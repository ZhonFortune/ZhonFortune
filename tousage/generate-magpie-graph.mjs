import { createDecipheriv, pbkdf2Sync } from "node:crypto";
import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { gunzipSync } from "node:zlib";

const inputDirectory = process.env.MAGPIE_USAGE_DIR ?? ".dev";
const outputFile =
  process.env.MAGPIE_GRAPH_OUTPUT ?? "dist/tousage/token-usgae-graph.svg";
const pricingUrl = "https://models.dev/api.json";
const fontUrl =
  "https://raw.githubusercontent.com/JetBrains/JetBrainsMono/v2.304/fonts/webfonts/JetBrainsMono-Regular.woff2";

function openUsageFile(envelope, fileName, passphrase) {
  if (
    envelope.format !== "magpie-data" ||
    envelope.version !== 1 ||
    envelope.kdf !== "pbkdf2-sha256" ||
    !Number.isInteger(envelope.iterations) ||
    envelope.iterations < 100_000 ||
    envelope.iterations > 10_000_000
  ) {
    throw new Error(`Unsupported Magpie usage file: ${fileName}`);
  }

  const salt = Buffer.from(envelope.salt, "base64");
  const nonce = Buffer.from(envelope.nonce, "base64");
  const sealed = Buffer.from(envelope.data, "base64");
  if (salt.length < 16 || nonce.length !== 12 || sealed.length < 16) {
    throw new Error(`Invalid Magpie usage envelope: ${fileName}`);
  }

  const key = pbkdf2Sync(
    passphrase,
    salt,
    envelope.iterations,
    32,
    "sha256",
  );
  const header = Buffer.from(
    `${envelope.format}/${envelope.version}/${envelope.kdf}/${envelope.iterations}/${salt.toString("hex")}`,
  );
  const decipher = createDecipheriv("aes-256-gcm", key, nonce);
  decipher.setAAD(header);
  decipher.setAuthTag(sealed.subarray(-16));

  try {
    const compressed = Buffer.concat([
      decipher.update(sealed.subarray(0, -16)),
      decipher.final(),
    ]);
    return gunzipSync(compressed);
  } catch {
    throw new Error(`Cannot decrypt or decompress Magpie usage file: ${fileName}`);
  }
}

function countTokens(value) {
  return Number.isSafeInteger(value) && value > 0 ? value : 0;
}

function callTokens(call) {
  return countTokens(call.in) + countTokens(call.out) +
    countTokens(call.cache_read) + countTokens(call.cache_write);
}

function escapeXml(value) {
  return String(value).replace(/[<>&"']/g, (character) => {
    const entities = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      '"': "&quot;",
      "'": "&apos;",
    };
    return entities[character];
  });
}

async function loadPricing(file) {
  if (file) {
    const bytes = await readFile(file);
    return JSON.parse(
      (file.endsWith(".gz") ? gunzipSync(bytes) : bytes).toString("utf8"),
    );
  }
  const response = await fetch(pricingUrl, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`Model pricing request failed: HTTP ${response.status}`);
  }
  return response.json();
}

async function loadFont() {
  const response = await fetch(fontUrl, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`JetBrains Mono download failed: HTTP ${response.status}`);
  }
  const font = Buffer.from(await response.arrayBuffer());
  if (font.toString("ascii", 0, 4) !== "wOF2") {
    throw new Error("Invalid JetBrains Mono WOFF2 file.");
  }
  return font.toString("base64");
}

function modelPrice(catalog, call) {
  const model = call.served || call.model;
  if (typeof model !== "string" || !model) return null;
  const provider = (call.provider || "").split("~")[0];
  const separator = model.indexOf("/");
  const namespace = separator > 0 ? model.slice(0, separator) : null;
  const bareModel = namespace ? model.slice(separator + 1) : model;
  const preferred =
    bareModel.startsWith("claude-") ? "anthropic" :
    /^(gpt-|o\d)/.test(bareModel) ? "openai" :
    bareModel.startsWith("gemini-") ? "google" :
    bareModel.startsWith("deepseek-") ? "deepseek" : null;
  const validRate = (rate) => Number.isFinite(rate) && rate >= 0;
  for (const candidate of new Set([provider, call.upstream, namespace, preferred])) {
    if (!candidate) continue;
    for (const id of new Set([model, bareModel])) {
      const cost = catalog[candidate]?.models?.[id]?.cost;
      if (cost && validRate(cost.input) && validRate(cost.output)) return cost;
    }
  }
  return null;
}

function priceCall(catalog, call) {
  const price = modelPrice(catalog, call);
  if (!price) return null;
  const input = countTokens(call.in);
  const output = countTokens(call.out);
  const cacheRead = countTokens(call.cache_read);
  const cacheWrite = countTokens(call.cache_write);
  const cacheWrite1h = Math.min(cacheWrite, countTokens(call.cache_write_1h));
  const context = input + cacheRead + cacheWrite;
  const tier = (price.tiers || [])
    .filter((item) => item.tier?.type === "context" && context > item.tier.size)
    .sort((left, right) => right.tier.size - left.tier.size)[0];
  const rates = { ...price, ...tier };
  if (
    (cacheRead && !Number.isFinite(rates.cache_read)) ||
    (cacheWrite > cacheWrite1h && !Number.isFinite(rates.cache_write))
  ) return null;
  const write1hRate = rates.cache_write_1h ??
    (/(^|\/)claude-/.test(call.served || call.model)
      ? rates.input * 2
      : rates.cache_write);
  if (cacheWrite1h && !Number.isFinite(write1hRate)) return null;
  return (
    input * rates.input +
    output * rates.output +
    cacheRead * (rates.cache_read ?? 0) +
    (cacheWrite - cacheWrite1h) * (rates.cache_write ?? 0) +
    cacheWrite1h * (write1hRate ?? 0)
  ) / 1_000_000;
}

function compactNumber(value) {
  for (const [divisor, suffix] of [
    [1e12, "T"], [1e9, "B"], [1e6, "M"], [1e3, "K"],
  ]) {
    if (value >= divisor) {
      return `${(value / divisor).toFixed(2).replace(/\.?0+$/, "")}${suffix}`;
    }
  }
  return String(value);
}

const cubeWidth = 9;
const scaleY = 1.15;
const cubeFaceDrop = cubeWidth * Math.tan(Math.PI / 6);
const hoverLift = 6;
const modelNameLimit = 26;

function topModel(modelTokens) {
  let name = "—";
  let highest = 0;
  for (const [model, tokens] of modelTokens) {
    if (tokens > highest || (tokens === highest && model < name)) {
      name = model;
      highest = tokens;
    }
  }
  return name;
}

function modelLabel(name, limit = modelNameLimit) {
  const characters = [...name];
  return escapeXml(characters.length > limit
    ? `${characters.slice(0, limit - 1).join("")}…`
    : name);
}

function renderCube(x, y, faceHeight, grade, dayId, description) {
  const topTransform = `skewY(-30) skewX(40.89) scale(1 ${scaleY})`;
  const leftTransform = `skewY(30) scale(1 ${scaleY})`;
  const rightTransform = `translate(${cubeWidth} ${cubeFaceDrop}) skewY(-30) scale(1 ${scaleY})`;
  const position = `translate(${x.toFixed(1)} ${y})`;
  const topGeometry = `width="${cubeWidth}" height="${cubeWidth}" transform="${topTransform}"`;
  const sideGeometry = `width="${cubeWidth}" height="${faceHeight}"`;
  return `<g id="${dayId}" class="day" transform="${position}" tabindex="0" role="img" aria-label="${description}">
    <g class="pillar" style="--face-height:${faceHeight}px">
      <rect ${topGeometry} class="g${grade}t"/>
      <rect ${sideGeometry} transform="${leftTransform}" class="side g${grade}l"/>
      <rect ${sideGeometry} transform="${rightTransform}" class="side g${grade}r"/>
    </g>
    <g fill="transparent" aria-hidden="true">
      <rect ${topGeometry}/>
      <rect ${sideGeometry} transform="${leftTransform}"/>
      <rect ${sideGeometry} transform="${rightTransform}"/>
    </g>
  </g>`;
}

function renderSvg(callsByDay, catalog, font) {
  const width = 680;
  const height = 360;
  const cell = 10;
  const diagonal = 5.77;
  const maxHeight = 35;
  const minimumHeight = 2;
  const minimumActiveHeight = 8;
  const now = new Date();
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 364);
  const rangeStart = new Date(start);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  const weekCount = Math.ceil((end - start + 1) / (7 * 86_400_000));
  const firstDay = rangeStart.toISOString().slice(0, 10);
  const today = end.toISOString().slice(0, 10);
  const tokenMap = new Map();
  const modelTotals = new Map();
  let maxTokens = 0;
  let activeDays = 0;
  let totalTokens = 0;
  let totalCost = 0;
  let pricedCalls = 0;
  let unpricedCalls = 0;
  for (const [day, calls] of callsByDay) {
    if (day < firstDay || day > today) continue;
    let dailyTokens = 0;
    const dailyModels = new Map();
    for (const call of calls) {
      const tokens = callTokens(call);
      if (!tokens) continue;
      dailyTokens += tokens;
      const model = call.served || call.model;
      if (typeof model === "string" && model.trim()) {
        dailyModels.set(model, (dailyModels.get(model) ?? 0) + tokens);
        modelTotals.set(model, (modelTotals.get(model) ?? 0) + tokens);
      }
      const cost = priceCall(catalog, call);
      if (cost === null) unpricedCalls += 1;
      else {
        pricedCalls += 1;
        totalCost += cost;
      }
    }
    if (!dailyTokens) continue;
    tokenMap.set(day, { tokens: dailyTokens, model: topModel(dailyModels) });
    maxTokens = Math.max(maxTokens, dailyTokens);
    activeDays += 1;
    totalTokens += dailyTokens;
  }
  const grades = ["#d8dee4", "#164e63", "#0e7490", "#0891b2", "#67e8f9"];
  const shade = (hex, factor) =>
    `#${hex
      .slice(1)
      .match(/.{2}/g)
      .map((channel) =>
        Math.round(Number.parseInt(channel, 16) * factor)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")}`;
  const faceStyles = grades
    .map(
      (color, grade) =>
        `.g${grade}t{fill:${color}}.g${grade}l{fill:${shade(color, 0.8367)}}.g${grade}r{fill:${shade(color, 0.7)}}`,
    )
    .join("");
  const originX = 109;
  const originY = 58;
  const scale = 0.86;
  const translateX = Number((((1 - scale) * width) / 2).toFixed(1));
  const translateY = Number((18 - (originY - maxHeight) * scale).toFixed(1));
  const tooltipWidth = 176;
  const tooltipHeight = 55;
  const tokenFormatter = new Intl.NumberFormat("en-US");
  let cubes = "";
  let tooltips = "";
  const tooltipSelectors = [];
  let gridBottom = -Infinity;

  for (let week = 0; week < weekCount; week += 1) {
    for (let weekday = 0; weekday < 7; weekday += 1) {
      const date = new Date(start);
      date.setUTCDate(date.getUTCDate() + week * 7 + weekday);
      if (date > end) continue;
      const day = date.toISOString().slice(0, 10);
      const activity = tokenMap.get(day);
      const tokens = activity?.tokens ?? 0;
      const grade = tokens
        ? Math.min(4, Math.max(1, Math.ceil((tokens / maxTokens) * 4)))
        : 0;
      const cubeHeight = tokens
        ? Math.max(
            minimumActiveHeight,
            Math.round(
              (tokens / maxTokens) * (maxHeight - minimumActiveHeight) +
                minimumActiveHeight,
            ),
          )
        : minimumHeight;
      const cubeX = originX + (week - weekday) * cell;
      const cubeY = Number((originY + (week + weekday) * diagonal - cubeHeight).toFixed(1));
      const faceHeight = Number((cubeHeight / scaleY).toFixed(1));
      gridBottom = Math.max(gridBottom, cubeY + faceHeight * scaleY + cubeFaceDrop);
      const dayId = `day-${day}`;
      const model = activity?.model ?? "—";
      const tokenLabel = `${tokenFormatter.format(tokens)} tokens`;
      const description = escapeXml(`${day}, ${tokenLabel}, top model: ${model}`);
      cubes += renderCube(cubeX, cubeY, faceHeight, grade, dayId, description);

      const columnX = translateX + (cubeX + cubeWidth) * scale;
      const columnY = translateY + (cubeY - cubeFaceDrop - hoverLift) * scale;
      const tooltipX = Math.max(4, Math.min(width - tooltipWidth - 4, columnX - tooltipWidth / 2));
      const tooltipY = columnY >= tooltipHeight + 10
        ? columnY - tooltipHeight - 6
        : Math.max(4, Math.min(height - tooltipHeight - 4, columnY + 20));
      tooltipSelectors.push(
        `.grid:has(#${dayId}:hover) ~ .tooltips #tip-${day}`,
        `.grid:not(:has(.day:hover)):has(#${dayId}:focus-visible) ~ .tooltips #tip-${day}`,
      );
      tooltips += `<g id="tip-${day}" class="tooltip" transform="translate(${tooltipX.toFixed(1)} ${tooltipY.toFixed(1)})">
        <rect width="${tooltipWidth}" height="${tooltipHeight}" rx="5"/>
        <text x="9" y="15" class="label">${day}</text>
        <text x="9" y="30" class="value">${tokenLabel}</text>
        <text x="9" y="45" class="note">${model === "—" ? "No model recorded" : `Top: ${modelLabel(model, modelNameLimit - 5)}`}</text>
      </g>`;
    }
  }

  const statsBaseline = (translateY + gridBottom * scale).toFixed(1);
  const costLabel = unpricedCalls && pricedCalls
    ? "ESTIMATED COST · PARTIAL"
    : "ESTIMATED COST";
  const costText = unpricedCalls && !pricedCalls ? "Unavailable" : `$${totalCost.toFixed(2)}`;
  const coverage = unpricedCalls
    ? `<text x="652" y="79" class="note" text-anchor="end" font-size="9">${compactNumber(unpricedCalls)} unpriced calls</text>`
    : "";
  const modelLabelY = unpricedCalls ? 99 : 84;
  const mostUsed = topModel(modelTotals);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg data-template="3d" width="100%" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="3D token contributions graph">
  <title>Magpie token contributions · ${escapeXml(today)}</title>
  <style>
    @font-face{font-family:'JetBrains Mono';src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:400}
    ${faceStyles}
    .label,.note{fill:#656d76}.value{fill:#24292f}
    .day{cursor:crosshair}
    .pillar{pointer-events:none;transition:transform 180ms ease,filter 180ms ease,opacity 180ms ease}
    .side{height:var(--face-height);transition:height 180ms ease}
    .day:focus-visible{outline:none}
    .grid:has(.day:hover) .day:not(:hover) .pillar,
    .grid:not(:has(.day:hover)):has(.day:focus-visible) .day:not(:focus-visible) .pillar{filter:grayscale(1);opacity:.4}
    .day:hover .pillar,.grid:not(:has(.day:hover)) .day:focus-visible .pillar{transform:translateY(-${hoverLift}px);filter:brightness(1.18)}
    .day:hover .side,.grid:not(:has(.day:hover)) .day:focus-visible .side{height:calc(var(--face-height) + ${hoverLift / scaleY}px)}
    .tooltip{visibility:hidden;opacity:0;pointer-events:none;transition:opacity 180ms ease,visibility 180ms}
    .tooltip rect{fill:#fff;stroke:#d0d7de}
    ${tooltipSelectors.join(",\n    ")}{visibility:visible;opacity:1}
    @media (prefers-reduced-motion:reduce){.pillar,.side,.tooltip{transition:none}}
    @media (prefers-color-scheme:dark){.g0t{fill:#242b36}.g0l{fill:#1f2530}.g0r{fill:#1a202a}.label,.note{fill:#8b949e}.value{fill:#e6edf3}.tooltip rect{fill:#161b22;stroke:#30363d}}
  </style>
  <g class="grid" data-contribution-grid="3d" transform="translate(${translateX} ${translateY}) scale(${scale})">${cubes}</g>
  <g font-family="'JetBrains Mono', monospace" font-size="10" font-weight="400">
    <g transform="translate(28 ${statsBaseline})">
      <text y="-67" class="label">TOKENS · LAST 365 DAYS</text>
      <text y="-48" class="value" font-size="13">${compactNumber(totalTokens)}</text>
      <text y="-19" class="label">ACTIVE DAYS</text>
      <text y="0" class="value" font-size="13">${activeDays}</text>
    </g>
    <text x="652" y="42" class="label" text-anchor="end">${costLabel}</text>
    <text x="652" y="61" class="value" text-anchor="end" font-size="13">${costText}</text>
    ${coverage}
    <text x="652" y="${modelLabelY}" class="label" text-anchor="end">TOP MODEL</text>
    <text x="652" y="${modelLabelY + 16}" class="value" text-anchor="end" font-size="11"><title>${escapeXml(mostUsed)}</title>${modelLabel(mostUsed)}</text>
  </g>
  <g class="tooltips" aria-hidden="true" font-family="'JetBrains Mono', monospace" font-size="10">${tooltips}</g>
</svg>
`;
}

export async function generateUsageGraph({
  directory = inputDirectory,
  passphrase = process.env.MAGPIE_PASSPHRASE,
  pricingFile = process.env.MAGPIE_PRICING_FILE,
  includeRecords = false,
} = {}) {
  if (!passphrase) throw new Error("MAGPIE_PASSPHRASE must be set.");
  const fileNames = (await readdir(directory))
    .filter((name) =>
      /^(?:magpie_usage_)?[a-f0-9]{8,64}-\d{4}-\d{2}-\d{2}\.magpie-usage$/.test(name),
    )
    .sort();
  if (!fileNames.length) {
    throw new Error(`No Magpie daily usage files found in ${directory}.`);
  }

  const callsByDay = new Map();
  const records = [];
  for (const fileName of fileNames) {
    const envelope = JSON.parse(await readFile(path.join(directory, fileName), "utf8"));
    const day = JSON.parse(openUsageFile(envelope, fileName, passphrase).toString("utf8"));
    if (day.day !== fileName.slice(-23, -13)) {
      throw new Error(`Date mismatch in Magpie usage file: ${fileName}`);
    }
    if (!Array.isArray(day.calls)) {
      throw new Error(`Invalid calls list for ${fileName}.`);
    }
    const calls = callsByDay.get(day.day) ?? [];
    for (const call of day.calls) calls.push(call);
    callsByDay.set(day.day, calls);
    if (includeRecords) records.push({ fileName, data: day });
  }

  const [catalog, font] = await Promise.all([loadPricing(pricingFile), loadFont()]);
  return { svg: renderSvg(callsByDay, catalog, font), fileCount: fileNames.length, records };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const { svg, fileCount } = await generateUsageGraph();
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, svg, "utf8");
  console.log(`Generated ${outputFile} from ${fileCount} encrypted usage files.`);
}
