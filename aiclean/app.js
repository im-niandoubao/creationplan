const inputText = document.querySelector("#inputText");
const outputText = document.querySelector("#outputText");
const cleanBtn = document.querySelector("#cleanBtn");
const clearBtn = document.querySelector("#clearBtn");
const copyBtn = document.querySelector("#copyBtn");
const downloadTxtBtn = document.querySelector("#downloadTxtBtn");
const downloadDocxBtn = document.querySelector("#downloadDocxBtn");
const countText = document.querySelector("#countText");
const statusText = document.querySelector("#statusText");
const optionInputs = [...document.querySelectorAll("[data-option]")];

const sampleText = `## 产品优势
当然可以！下面我帮你整理。
- 支持 AI
- 支持自动化
- 支持导出 😊
---
如果需要的话，我还可以继续帮你生成 PPT。`;

inputText.value = sampleText;

function getOptions() {
  return optionInputs.reduce((options, input) => {
    options[input.dataset.option] = input.checked;
    return options;
  }, {});
}

function cleanText(rawText, options) {
  let text = rawText.replace(/\r\n?/g, "\n");

  if (options.images) {
    text = text.replace(/!\[[^\]]*]\([^)]*\)/g, "");
  }

  if (options.markdown) {
    text = removeMarkdown(text);
  }

  if (options.bold) {
    text = text.replace(/\*\*([^*\n]+)\*\*/g, "$1").replace(/__([^_\n]+)__/g, "$1");
  }

  if (options.italic) {
    text = text.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1$2").replace(/(^|[^_])_([^_\n]+)_(?!_)/g, "$1$2");
  }

  if (options.html) {
    text = text.replace(/<\/?[^>\n]+>/g, "");
  }

  if (options.urls) {
    text = text.replace(/\bhttps?:\/\/[^\s)）]+/gi, "").replace(/\bwww\.[^\s)）]+/gi, "");
  }

  if (options.sources) {
    text = removeSources(text);
  }

  if (options.aiPhrases) {
    text = removeAiPhrases(text);
  }

  if (options.lists) {
    text = normalizeLists(text);
  }

  if (options.emoji) {
    text = removeEmoji(text);
  }

  if (options.mergeLines) {
    text = mergeBrokenLines(text);
  }

  if (options.punctuation) {
    text = normalizePunctuation(text);
  }

  if (options.spaces) {
    text = normalizeSpaces(text);
  }

  if (options.blankLines) {
    text = normalizeBlankLines(text);
  }

  return text.trim();
}

function removeMarkdown(text) {
  // 注意：加粗 / 斜体剥离由 cleanText 的 options.bold / options.italic 单独门控，
  // 不在这里做，避免 markdown 勾选时把高级开关里的 bold/italic 顶掉。
  return text
    .replace(/^```[^\n]*\n?/gm, "")
    .replace(/^~~~[^\n]*\n?/gm, "")
    .replace(/^(#{1,6})\s+/gm, "")
    .replace(/^\s{0,3}>\s?/gm, "")
    .replace(/^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/gm, "")
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, "$1")
    .replace(/`([^`\n]+)`/g, "$1");
}

function removeAiPhrases(text) {
  const starters = [
    /^当然可以[！!，,。.\s]*/u,
    /^好的[！!，,。.\s]*/u,
    /^没问题[！!，,。.\s]*/u,
    /^下面是[^。\n]*[。.\n]*/u,
    /^下面我为你整理[^。\n]*[。.\n]*/u,
    /^下面我帮你整理[^。\n]*[。.\n]*/u,
    /^以下是[^。\n]*[。.\n]*/u,
    /^可以参考下面内容[：:！!，,。.\s]*/u,
  ];
  const endings = [
    /希望对你有帮助[。.!！\s]*$/u,
    /如果还有问题欢迎继续交流[。.!！\s]*$/u,
    /如果需要我还可以[^。\n]*[。.!！\s]*$/u,
    /如果需要，我还能帮你[^。\n]*[。.!！\s]*$/u,
    /如果需要的话，我还可以[^。\n]*[。.!！\s]*$/u,
    /如果你[^。\n]*我可以帮你[^。\n]*[。.!！\s]*$/u,
    /需要的话我可以继续[^。\n]*[。.!！\s]*$/u,
    /欢迎继续提问[。.!！\s]*$/u,
  ];

  let lines = text.split("\n").map((line) => {
    let cleaned = line.trim();
    starters.forEach((pattern) => {
      cleaned = cleaned.replace(pattern, "");
    });
    endings.forEach((pattern) => {
      cleaned = cleaned.replace(pattern, "");
    });
    return cleaned;
  });

  return lines.filter(Boolean).join("\n");
}

function normalizeLists(text) {
  return text.replace(/^(\s*)(?:[•●▪*-]|\d+[.)、])\s+/gm, "$1• ");
}

function removeEmoji(text) {
  return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F]/gu, "");
}

function removeSources(text) {
  return text
    .replace(/^\s*(?:参考来源|来源|出处|引用)[:：].*$/gm, "")
    .replace(/^\s*\[\d+]\s*.*$/gm, "")
    .replace(/^\s*\(\d+\)\s*.*$/gm, "");
}

function mergeBrokenLines(text) {
  const lines = text.split("\n");
  const result = [];

  for (const line of lines) {
    const current = line.trim();
    if (!current) {
      result.push("");
      continue;
    }

    const previous = result[result.length - 1];
    const isList = /^•\s/.test(current);
    const previousEnds = /[。！？!?；;：:]$/.test(previous || "");

    if (previous && !previousEnds && !isList && !/^•\s/.test(previous)) {
      result[result.length - 1] = previous + current;
    } else {
      result.push(current);
    }
  }

  return result.join("\n");
}

function normalizePunctuation(text) {
  const cjk = "\\u4e00-\\u9fff\\u3400-\\u4dbf";
  return text
    .replace(new RegExp(`([${cjk}]),|,([${cjk}])`, "g"), (_, left, right) => (left ? `${left}，` : `，${right}`))
    .replace(new RegExp(`([${cjk}])\\.|\\.([${cjk}])`, "g"), (_, left, right) => (left ? `${left}。` : `。${right}`))
    .replace(new RegExp(`([${cjk}]):|:([${cjk}])`, "g"), (_, left, right) => (left ? `${left}：` : `：${right}`))
    .replace(new RegExp(`([${cjk}]);|;([${cjk}])`, "g"), (_, left, right) => (left ? `${left}；` : `；${right}`))
    .replace(new RegExp(`([${cjk}])\\?|\\?([${cjk}])`, "g"), (_, left, right) => (left ? `${left}？` : `？${right}`))
    .replace(new RegExp(`([${cjk}])!|!([${cjk}])`, "g"), (_, left, right) => (left ? `${left}！` : `！${right}`));
}

function normalizeSpaces(text) {
  return text
    .split("\n")
    .map((line) => line.replace(/[ \t]{2,}/g, "").replace(/[ \t]*([，。！？；：、])[ \t]*/g, "$1").trim())
    .join("\n");
}

function normalizeBlankLines(text) {
  return text.replace(/\n{3,}/g, "\n\n");
}

let renderTimer = 0;
function scheduleRender() {
  window.clearTimeout(renderTimer);
  renderTimer = window.setTimeout(renderOutput, 60);
}

function renderOutput() {
  const cleaned = cleanText(inputText.value, getOptions());
  outputText.value = cleaned;
  countText.textContent = `${cleaned.length.toLocaleString("zh-CN")} 字`;
  statusText.textContent = cleaned ? "已清洗" : "实时预览";
}

async function copyResult() {
  if (!outputText.value) return;
  await navigator.clipboard.writeText(outputText.value);
  flashStatus("已复制");
}

function downloadTxt() {
  if (!outputText.value) return;
  const blob = new Blob([outputText.value], { type: "text/plain;charset=utf-8" });
  downloadBlob(blob, "清洗结果.txt");
}

function downloadDocx() {
  if (!outputText.value) return;
  const blob = buildDocx(outputText.value);
  downloadBlob(blob, "清洗结果.docx");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function flashStatus(message) {
  const previous = statusText.textContent;
  statusText.textContent = message;
  window.setTimeout(() => {
    statusText.textContent = previous;
  }, 1300);
}

function buildDocx(text) {
  const files = {
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`,
    "word/document.xml": buildDocumentXml(text),
  };

  return new Blob([zipStore(files)], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

function buildDocumentXml(text) {
  const paragraphs = text.split("\n").map((line) => {
    const content = escapeXml(line) || " ";
    return `<w:p><w:r><w:t xml:space="preserve">${content}</w:t></w:r></w:p>`;
  });

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphs.join("\n    ")}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

function zipStore(fileMap) {
  const encoder = new TextEncoder();
  const parts = [];
  const central = [];
  let offset = 0;

  Object.entries(fileMap).forEach(([name, content]) => {
    const nameBytes = encoder.encode(name);
    const data = encoder.encode(content);
    const crc = crc32(data);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, 0, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, data.length, true);
    localView.setUint32(22, data.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localHeader.set(nameBytes, 30);

    parts.push(localHeader, data);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, data.length, true);
    centralView.setUint32(24, data.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);
    central.push(centralHeader);

    offset += localHeader.length + data.length;
  });

  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, central.length, true);
  endView.setUint16(10, central.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);

  return new Blob([...parts, ...central, end]);
}

const crcTable = new Uint32Array(256).map((_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

inputText.addEventListener("input", scheduleRender);
cleanBtn.addEventListener("click", renderOutput);
clearBtn.addEventListener("click", () => {
  inputText.value = "";
  renderOutput();
  inputText.focus();
});
copyBtn.addEventListener("click", copyResult);
downloadTxtBtn.addEventListener("click", downloadTxt);
downloadDocxBtn.addEventListener("click", downloadDocx);
optionInputs.forEach((input) => input.addEventListener("change", renderOutput));

renderOutput();
