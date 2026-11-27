import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { generateUsageGraph } from "../generate-usage-graph.mjs";
import { S3SourceError, withS3Usage } from "../s3-source.mjs";

const host = "127.0.0.1";
const port = 4173;
const address = `${host}:${port}`;
const origin = `http://${address}`;
const requestLimit = 32 * 1024;
const indexPage = "/index.html";
const assets = new Map([
  [indexPage, "text/html; charset=utf-8"],
  ["/style.css", "text/css; charset=utf-8"],
  ["/preview.js", "text/javascript; charset=utf-8"],
]);
const securityHeaders = {
  "Cache-Control": "no-store",
  "Content-Security-Policy": "default-src 'none'; script-src 'self'; style-src 'self' https://cdn.jsdelivr.net; img-src 'self' blob: data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

class PreviewError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function sendJson(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
}

async function readSettings(request) {
  let size = 0;
  let body = "";
  request.setEncoding("utf8");
  for await (const chunk of request) {
    size += Buffer.byteLength(chunk);
    if (size <= requestLimit) body += chunk;
  }
  if (size > requestLimit) throw new PreviewError(413, "配置内容过长。");

  let settings;
  try {
    settings = JSON.parse(body);
  } catch {
    throw new PreviewError(400, "无法读取配置，请重新提交。");
  }
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    throw new PreviewError(400, "配置格式不正确。");
  }
  for (const value of Object.values(settings)) {
    if (typeof value !== "string" || value.includes("\0")) {
      throw new PreviewError(400, "配置项必须是有效文本。");
    }
  }
  return settings;
}

function configuredPath(settings, key) {
  return settings[key]?.trim() || process.env[key]?.trim() || undefined;
}

async function buildPreview(settings, signal) {
  if (!["local", "s3"].includes(settings.source)) {
    throw new PreviewError(400, "请选择数据来源。");
  }
  const passphrase = settings.USAGE_PASSPHRASE || process.env.USAGE_PASSPHRASE;
  if (!passphrase) throw new PreviewError(400, "请输入解密口令。");
  const generate = (directory) => generateUsageGraph({
    directory,
    passphrase,
    pricingFile: configuredPath(settings, "USAGE_PRICING_FILE"),
    includeRecords: true,
  });
  if (settings.source === "s3") return withS3Usage(settings, generate, signal);
  const directory = configuredPath(settings, "USAGE_DIR");
  if (!directory) throw new PreviewError(400, "请填写本地记录目录。");
  return generate(directory);
}

function publicFailure(error) {
  if (error instanceof PreviewError || error instanceof S3SourceError) return error;
  const messages = [
    [/^No daily usage/, "没有找到符合命名规则的使用记录。"],
    [/^Cannot decrypt/, "无法解密或解压使用记录，请确认口令和文件来源。"],
    [/^(Unsupported usage|Invalid usage|Date mismatch|Invalid calls)/, "使用记录格式不正确，请检查文件。"],
    [/^(Model pricing|JetBrains Mono|Invalid JetBrains Mono)/, "无法加载价格或图表字体，请检查网络。"],
  ];
  const message = error.code === "ENOENT"
    ? "找不到本地使用记录目录或价格文件。"
    : messages.find(([pattern]) => pattern.test(error.message))?.[1]
      ?? "无法生成预览，请检查记录、模型价格和网络连接。";
  return new PreviewError(422, message);
}

let generating = false;
createServer({ requestTimeout: 15_000 }, async (request, response) => {
  for (const [name, value] of Object.entries(securityHeaders)) response.setHeader(name, value);
  if (request.headers.host !== address) return sendJson(response, 403, { error: "请通过本机地址访问。" });

  const assetPath = request.url === "/" ? indexPage : request.url;
  const contentType = assets.get(assetPath);
  if (request.method === "GET" && contentType) {
    try {
      const content = await readFile(new URL(`.${assetPath}`, import.meta.url));
      response.writeHead(200, { "Content-Type": contentType });
      return response.end(content);
    } catch {
      return sendJson(response, 500, { error: "无法读取预览页面。" });
    }
  }
  if (request.method !== "POST" || request.url !== "/") {
    return sendJson(response, 404, { error: "页面不存在。" });
  }
  if (request.headers.origin !== origin || request.headers["content-type"] !== "application/json") {
    return sendJson(response, 403, { error: "请从预览页面提交配置。" });
  }
  if (Number(request.headers["content-length"]) > requestLimit) {
    return sendJson(response, 413, { error: "配置内容过长。" });
  }
  if (generating) return sendJson(response, 409, { error: "正在生成预览，请稍候。" });

  generating = true;
  const controller = new AbortController();
  response.once("close", () => controller.abort());
  try {
    const settings = await readSettings(request);
    const result = await buildPreview(settings, controller.signal);
    if (!response.destroyed) sendJson(response, 200, result);
  } catch (error) {
    if (response.destroyed) return;
    const failure = publicFailure(error);
    sendJson(response, failure.status, { error: failure.message });
  } finally {
    generating = false;
  }
}).listen(port, host, () => console.log(`Usage preview: ${origin}`));
