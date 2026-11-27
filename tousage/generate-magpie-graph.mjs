import { createDecipheriv, pbkdf2Sync } from "node:crypto";
import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { gunzipSync } from "node:zlib";

const inputDirectory = process.env.MAGPIE_USAGE_DIR ?? ".dev";
const outputFile = process.env.MAGPIE_GRAPH_OUTPUT ?? "dist/magpie-usage.svg";
const passphrase = process.env.MAGPIE_PASSPHRASE;

if (!passphrase) {
  throw new Error("MAGPIE_PASSPHRASE must be set.");
}

function openUsageFile(envelope, fileName) {
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

function dayTokens(day) {
  if (!Array.isArray(day.calls)) {
    throw new Error(`Invalid calls list for ${day.day}.`);
  }

  return day.calls.reduce((total, call) => {
    const count = (value) =>
      Number.isSafeInteger(value) && value > 0 ? value : 0;
    return (
      total +
      count(call.in) +
      count(call.out) +
      count(call.cache_read) +
      count(call.cache_write)
    );
  }, 0);
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

function renderCube(x, y, height, grade) {
  const width = 9;
  const scaleY = 1.15;
  const faceHeight = (height / scaleY).toFixed(1);
  const topTransform = `skewY(-30) skewX(40.89) scale(1 ${scaleY})`;
  const leftTransform = `skewY(30) scale(1 ${scaleY})`;
  const rightTransform = `translate(${width} 5.2) skewY(-30) scale(1 ${scaleY})`;
  const position = `translate(${x.toFixed(1)} ${y.toFixed(1)})`;
  return `<g transform="${position}"><rect width="9" height="9" transform="${topTransform}" class="g${grade}t"/><rect width="9" height="${faceHeight}" transform="${leftTransform}" class="g${grade}l"/><rect width="9" height="${faceHeight}" transform="${rightTransform}" class="g${grade}r"/></g>`;
}

function renderSvg(tokensByDay) {
  const width = 680;
  const height = 482;
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
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  const weekCount = Math.ceil((end - start + 1) / (7 * 86_400_000));
  const visibleValues = [...tokensByDay.entries()].filter(([day]) => {
    const date = new Date(`${day}T00:00:00Z`);
    return date >= start && date <= end;
  });
  const maxTokens = Math.max(0, ...visibleValues.map(([, tokens]) => tokens));
  const activeDays = visibleValues.filter(([, tokens]) => tokens > 0).length;
  const totalTokens = visibleValues.reduce((sum, [, tokens]) => sum + tokens, 0);
  const tokenMap = new Map(visibleValues);
  const grades = ["#18202b", "#164e63", "#0e7490", "#0891b2", "#67e8f9"];
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
  const originY = 108;
  let cubes = "";

  for (let week = 0; week < weekCount; week += 1) {
    for (let weekday = 0; weekday < 7; weekday += 1) {
      const date = new Date(start);
      date.setUTCDate(date.getUTCDate() + week * 7 + weekday);
      if (date > end) continue;
      const day = date.toISOString().slice(0, 10);
      const tokens = tokenMap.get(day) ?? 0;
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
      cubes += renderCube(
        originX + (week - weekday) * cell,
        originY + (week + weekday) * diagonal - cubeHeight,
        cubeHeight,
        grade,
      );
    }
  }

  const today = end.toISOString().slice(0, 10);
  const format = new Intl.NumberFormat("en-US");
  const scale = 0.86;
  const translateX = ((1 - scale) * width) / 2;
  const translateY = 70 - (originY - maxHeight) * scale;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg data-template="3d" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Magpie 3D token contributions graph">
  <title>Magpie token contributions · ${escapeXml(today)}</title>
  <style>${faceStyles}</style>
  <rect width="${width}" height="${height}" rx="12" fill="#131822"/>
  <text x="24" y="30" fill="#F4F7FB" font-size="16" font-weight="600" font-family="system-ui, sans-serif">Magpie · Token contributions</text>
  <text x="656" y="30" fill="#A8B3C5" font-size="11" text-anchor="end" font-family="system-ui, sans-serif">Last 365 days · through ${escapeXml(today)}</text>
  <line x1="24" y1="48" x2="656" y2="48" stroke="#FFFFFF" stroke-opacity=".09"/>
  <g data-contribution-grid="3d" transform="translate(${translateX.toFixed(1)} ${translateY.toFixed(1)}) scale(${scale})">${cubes}</g>
  <line x1="24" y1="410" x2="656" y2="410" stroke="#FFFFFF" stroke-opacity=".09"/>
  <text x="24" y="434" fill="#A8B3C5" font-size="10" font-family="system-ui, sans-serif">TOKENS · LAST 365 DAYS</text>
  <text x="24" y="460" fill="#67E8F9" font-size="18" font-weight="600" font-family="system-ui, sans-serif">${format.format(totalTokens)}</text>
  <line x1="340" y1="424" x2="340" y2="467" stroke="#FFFFFF" stroke-opacity=".09"/>
  <text x="364" y="434" fill="#A8B3C5" font-size="10" font-family="system-ui, sans-serif">ACTIVE DAYS</text>
  <text x="364" y="460" fill="#F4F7FB" font-size="18" font-weight="600" font-family="system-ui, sans-serif">${activeDays}</text>
  <rect x=".5" y=".5" width="679" height="481" rx="11.5" fill="none" stroke="#FFFFFF" stroke-opacity=".09"/>
</svg>
`;
}

const fileNames = (await readdir(inputDirectory))
  .filter((name) =>
    /^(?:magpie_usage_)?[a-f0-9]{8,64}-\d{4}-\d{2}-\d{2}\.magpie-usage$/.test(
      name,
    ),
  )
  .sort();

if (fileNames.length === 0) {
  throw new Error(`No Magpie daily usage files found in ${inputDirectory}.`);
}

const tokensByDay = new Map();
for (const fileName of fileNames) {
  const envelope = JSON.parse(
    await readFile(path.join(inputDirectory, fileName), "utf8"),
  );
  const day = JSON.parse(openUsageFile(envelope, fileName).toString("utf8"));
  const fileDate = fileName.slice(-23, -13);
  if (day.day !== fileDate) {
    throw new Error(`Date mismatch in Magpie usage file: ${fileName}`);
  }
  tokensByDay.set(day.day, (tokensByDay.get(day.day) ?? 0) + dayTokens(day));
}

await mkdir(path.dirname(outputFile), { recursive: true });
await writeFile(outputFile, renderSvg(tokensByDay), "utf8");
console.log(
  `Generated ${outputFile} from ${fileNames.length} encrypted usage files.`,
);
