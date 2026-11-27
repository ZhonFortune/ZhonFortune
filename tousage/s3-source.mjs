import { createWriteStream } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { usageFileDate, usageObjectPrefix } from "./usage-format.mjs";

const downloadConcurrency = 8;
const downloadTimeout = 120_000;

export class S3SourceError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function readConfig(settings) {
  const get = (key) => settings[key]?.trim() || process.env[key]?.trim() || "";
  const bucket = get("S3_BUCKET");
  const region = get("S3_REGION");
  const endpoint = URL.parse(get("S3_ENDPOINT"));
  const localHttp = endpoint?.protocol === "http:" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(endpoint.hostname);
  if (!endpoint || (endpoint.protocol !== "https:" && !localHttp) ||
      endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
    throw new S3SourceError(400, "S3_ENDPOINT 必须是 HTTPS 服务地址；仅本机路径式端点允许 HTTP。");
  }
  if (!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket) || bucket.includes("..")) {
    throw new S3SourceError(400, "请提供有效的 S3_BUCKET。");
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(region)) {
    throw new S3SourceError(400, "请提供存储服务要求的签名区域 S3_REGION。");
  }
  const submittedAccessKey = settings.S3_ACCESS_KEY_ID?.trim();
  const submittedSecretKey = settings.S3_SECRET_ACCESS_KEY?.trim();
  const submittedToken = settings.S3_SESSION_TOKEN?.trim();
  const explicitCredentials = Boolean(submittedAccessKey || submittedSecretKey || submittedToken);
  const changedEndpoint = settings.S3_ENDPOINT?.trim() &&
    endpoint.href !== URL.parse(process.env.S3_ENDPOINT?.trim() || "")?.href;
  if ((explicitCredentials || changedEndpoint) && (!submittedAccessKey || !submittedSecretKey)) {
    throw new S3SourceError(400, "请为当前 S3 端点填写配套的访问密钥和私密访问密钥。");
  }
  const accessKey = explicitCredentials ? submittedAccessKey : get("S3_ACCESS_KEY_ID");
  const secretKey = explicitCredentials ? submittedSecretKey : get("S3_SECRET_ACCESS_KEY");
  const sessionToken = explicitCredentials ? submittedToken : get("S3_SESSION_TOKEN");
  if (!accessKey || !secretKey) throw new S3SourceError(400, "请提供 S3 访问密钥和私密访问密钥。");
  return { bucket, region, accessKey, secretKey, sessionToken, endpoint: endpoint.href };
}

export async function withS3Usage(settings, consume, signal) {
  const config = readConfig(settings);
  const { S3Client, ListObjectsV2Command, GetObjectCommand } = await import("@aws-sdk/client-s3").catch((error) => {
    if (error.code !== "ERR_MODULE_NOT_FOUND") throw error;
    throw new S3SourceError(503, "未安装 S3 预览依赖，请在仓库根目录运行 npm install --prefix tousage。");
  });
  const client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    forcePathStyle: true,
    credentials: {
      accessKeyId: config.accessKey,
      secretAccessKey: config.secretKey,
      sessionToken: config.sessionToken || undefined,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
  let directory;
  try {
    directory = await mkdtemp(path.join(tmpdir(), "usage-s3-"));
    const deadline = AbortSignal.timeout(downloadTimeout);
    const transferSignal = signal ? AbortSignal.any([signal, deadline]) : deadline;
    const requestOptions = { abortSignal: transferSignal };
    const download = async ({ key, fileName }) => {
      const { Body } = await client.send(new GetObjectCommand({
        Bucket: config.bucket,
        Key: key,
      }), requestOptions);
      if (!Body) throw new S3SourceError(502, "S3 返回了空的对象响应。");
      await pipeline(Body, createWriteStream(path.join(directory, fileName), { mode: 0o600 }), {
        signal: transferSignal,
      });
    };

    let downloaded = false;
    let directObjects = 0;
    let nestedPrefixes = 0;
    let continuationToken;
    const seenTokens = new Set();
    try {
      do {
        const page = await client.send(new ListObjectsV2Command({
          Bucket: config.bucket,
          Prefix: usageObjectPrefix,
          Delimiter: "/",
          ContinuationToken: continuationToken,
        }), requestOptions);
        continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
        if (page.IsTruncated && (!continuationToken || seenTokens.has(continuationToken))) {
          throw new S3SourceError(502, "S3 返回了无效的分页信息。");
        }
        if (continuationToken) seenTokens.add(continuationToken);

        nestedPrefixes += page.CommonPrefixes?.length ?? 0;
        const files = [];
        for (const { Key: key } of page.Contents ?? []) {
          if (!key?.startsWith(usageObjectPrefix)) continue;
          const fileName = key.slice(usageObjectPrefix.length);
          if (!fileName || fileName.includes("/")) continue;
          directObjects += 1;
          if (usageFileDate(fileName)) files.push({ key, fileName });
        }
        for (let offset = 0; offset < files.length; offset += downloadConcurrency) {
          const results = await Promise.allSettled(files.slice(offset, offset + downloadConcurrency).map(download));
          const failed = results.find((result) => result.status === "rejected");
          if (failed) throw failed.reason;
          downloaded = true;
        }
      } while (continuationToken);
    } catch (error) {
      if (signal?.aborted) throw signal.reason;
      if (deadline.aborted) throw new S3SourceError(504, "S3 读取超时。");
      if (error instanceof S3SourceError) throw error;
      throw new S3SourceError(502, "无法读取 S3 数据，请检查端点和区域，并确认存储服务支持路径式寻址、凭据具有只读权限。");
    }
    if (!downloaded) {
      const location = `存储桶 ${config.bucket}，记录目录 ${usageObjectPrefix}`;
      const detail = directObjects
        ? `找到 ${directObjects} 个对象，但文件名均不符合用量导出格式。`
        : "没有找到直接存放在此处的对象。";
      const hint = nestedPrefixes
        ? "用量记录应直接存放在此目录下，不应放入子目录。"
        : "请检查导出位置及文件名。";
      throw new S3SourceError(422, `${location}：${detail}${hint}`);
    }
    return await consume(directory);
  } finally {
    client.destroy();
    if (directory) await rm(directory, { recursive: true, force: true, maxRetries: 3 });
  }
}
