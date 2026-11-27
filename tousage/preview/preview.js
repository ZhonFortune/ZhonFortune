const find = (id) => document.getElementById(id);
const form = find("settings");
const settingsFields = [...form.querySelectorAll("input[name], select[name]")];
const settingsStorageKey = "token-usage-preview:settings:v1";
const generate = find("generate");
const status = find("status");
const chart = find("chart");
const theme = find("theme");
const recordFile = find("record-file");
const recordJson = find("record-json");
const recordsSummary = find("records-summary");
const emptySummary = recordsSummary.textContent;
const formatNumber = new Intl.NumberFormat("zh-CN");
let records = [];
let chartUrl;
let activeRequest;

function restoreSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(settingsStorageKey));
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return;
    for (const field of settingsFields) {
      const value = saved[field.name];
      if (!Object.hasOwn(saved, field.name) || typeof value !== "string") continue;
      if (field instanceof HTMLSelectElement && ![...field.options].some((option) => option.value === value)) continue;
      field.value = value;
    }
  } catch {
    return;
  }
}

function saveSettings() {
  try {
    const settings = Object.fromEntries(settingsFields.map((field) => [field.name, field.value]));
    localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
  } catch {
    return;
  }
}

function updateTheme() {
  document.documentElement.dataset.colorMode = theme.value;
}

function updateSource() {
  const remote = find("source").value === "s3";
  find("local-settings").hidden = find("local-settings").disabled = remote;
  find("s3-settings").hidden = find("s3-settings").disabled = !remote;
}

function showStatus(message, error = false) {
  status.textContent = message;
  status.dataset.error = String(error);
}

function resetResult() {
  if (chartUrl) URL.revokeObjectURL(chartUrl);
  chartUrl = undefined;
  chart.removeAttribute("src");
  find("open-chart").removeAttribute("href");
  find("chart-wrap").hidden = true;
  find("chart-actions").hidden = true;
  find("chart-empty").hidden = false;
  find("copy-status").textContent = "";
  find("markdown-snippet").hidden = true;
  records = [];
  recordFile.replaceChildren();
  recordJson.textContent = "";
  recordsSummary.textContent = emptySummary;
  find("record-controls").hidden = true;
}

function showRecord() {
  const record = records[Number(recordFile.value)];
  recordJson.textContent = record ? JSON.stringify(record.data, null, 2) : "";
}

theme.addEventListener("change", updateTheme);
find("source").addEventListener("change", updateSource);
recordFile.addEventListener("change", showRecord);

find("copy-markdown").addEventListener("click", async () => {
  const snippet = find("markdown-snippet");
  const input = find("image-url");
  const url = URL.parse(input.value.trim());
  if (!url || url.protocol !== "https:" || url.username || url.password) {
    snippet.hidden = true;
    find("copy-status").textContent = "请输入已发布 SVG 的 HTTPS 地址。";
    input.focus();
    return;
  }
  const image = chart.cloneNode(false);
  image.removeAttribute("id");
  image.src = url.href;
  snippet.value = image.outerHTML;
  try {
    await navigator.clipboard.writeText(snippet.value);
    find("copy-status").textContent = "已复制。";
  } catch {
    snippet.hidden = false;
    snippet.select();
    find("copy-status").textContent = "无法自动复制，请复制选中的内容。";
  }
});

find("clear").addEventListener("click", () => {
  activeRequest?.abort();
  form.reset();
  find("image-url").value = "";
  updateSource();
  resetResult();
  showStatus("");
  try {
    localStorage.removeItem(settingsStorageKey);
  } catch {
    showStatus("无法清除浏览器保存的配置。", true);
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  saveSettings();
  resetResult();
  generate.disabled = true;
  showStatus("正在读取记录并生成图表…");
  const controller = new AbortController();
  activeRequest = controller;
  try {
    const response = await fetch(form.action, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
      signal: controller.signal,
    });
    const result = await response.json();
    if (controller.signal.aborted) return;
    if (!response.ok) {
      showStatus(result.error || "无法生成预览。", true);
      return;
    }

    chartUrl = URL.createObjectURL(new Blob([result.svg], { type: "image/svg+xml" }));
    chart.src = chartUrl;
    find("open-chart").href = chartUrl;
    find("chart-wrap").hidden = false;
    find("chart-actions").hidden = false;
    find("chart-empty").hidden = true;

    records = result.records;
    const calls = records.reduce((total, record) => total + record.data.calls.length, 0);
    const days = new Set(records.map((record) => record.data.day));
    recordsSummary.textContent = `${formatNumber.format(result.fileCount)} 个文件 · ${formatNumber.format(days.size)} 天 · ${formatNumber.format(calls)} 次调用`;
    recordFile.replaceChildren(...records.map((record, index) => new Option(record.fileName, String(index))));
    find("record-controls").hidden = false;
    showRecord();
    showStatus("预览已生成。");
  } catch {
    if (!controller.signal.aborted) showStatus("无法连接到本机预览服务。", true);
  } finally {
    activeRequest = undefined;
    generate.disabled = false;
  }
});

if (location.protocol === "file:") {
  showStatus("请在仓库根目录运行 node tousage/preview/server.mjs，再打开终端显示的地址。", true);
} else {
  restoreSettings();
  form.addEventListener("input", saveSettings);
  updateTheme();
  updateSource();
  generate.disabled = false;
}
