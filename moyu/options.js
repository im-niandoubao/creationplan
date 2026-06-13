const form = document.querySelector("#settingsForm");
const statusLine = document.querySelector("#status");
const prepareButton = document.querySelector("#prepareButton");
const stopButton = document.querySelector("#stopButton");
const bookmarkPicker = document.querySelector("#bookmarkPicker");
const bookmarkTitle = document.querySelector("#bookmarkTitle");
const bookmarkSearch = document.querySelector("#bookmarkSearch");
const bookmarkList = document.querySelector("#bookmarkList");
const closeBookmarkPicker = document.querySelector("#closeBookmarkPicker");

const fields = {
  workUrl: document.querySelector("#workUrl"),
  funUrl: document.querySelector("#funUrl"),
  idleSeconds: document.querySelector("#idleSeconds")
};

let activeBookmarkTarget = null;
let bookmarks = [];

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withProtocol = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  return new URL(withProtocol).href;
}

function setStatus(message, isError = false) {
  statusLine.textContent = message;
  statusLine.style.color = isError ? "#d34d34" : "#087565";
}

function readSettings() {
  return {
    workUrl: normalizeUrl(fields.workUrl.value),
    funUrl: normalizeUrl(fields.funUrl.value),
    idleSeconds: fields.idleSeconds.value
  };
}

function readDraft() {
  return {
    draftWorkUrl: fields.workUrl.value,
    draftFunUrl: fields.funUrl.value,
    draftIdleSeconds: fields.idleSeconds.value
  };
}

async function saveDraftNow() {
  await chrome.storage.local.set(readDraft());
}

function flattenBookmarks(nodes, path = []) {
  const items = [];
  nodes.forEach((node) => {
    const title = node.title || "未命名";
    if (node.url) {
      items.push({
        title,
        url: node.url,
        path: path.join(" / ")
      });
      return;
    }

    if (node.children) {
      items.push(...flattenBookmarks(node.children, title ? [...path, title] : path));
    }
  });
  return items;
}

async function loadBookmarks() {
  if (bookmarks.length) return bookmarks;
  const tree = await chrome.bookmarks.getTree();
  bookmarks = flattenBookmarks(tree)
    .filter((bookmark) => /^https?:\/\//i.test(bookmark.url))
    .sort((a, b) => a.title.localeCompare(b.title, "zh-Hans-CN"));
  return bookmarks;
}

function renderBookmarks(query = "") {
  const normalized = query.trim().toLowerCase();
  const matches = bookmarks
    .filter((bookmark) => {
      if (!normalized) return true;
      return `${bookmark.title} ${bookmark.url} ${bookmark.path}`.toLowerCase().includes(normalized);
    })
    .slice(0, 80);

  bookmarkList.textContent = "";

  if (!matches.length) {
    const empty = document.createElement("div");
    empty.className = "empty-bookmarks";
    empty.textContent = "没有找到可用的收藏网址。";
    bookmarkList.append(empty);
    return;
  }

  matches.forEach((bookmark) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "bookmark-item";
    button.dataset.url = bookmark.url;

    const title = document.createElement("b");
    title.textContent = bookmark.title || bookmark.url;

    const detail = document.createElement("small");
    detail.textContent = bookmark.path ? `${bookmark.path} · ${bookmark.url}` : bookmark.url;

    button.append(title, detail);
    bookmarkList.append(button);
  });
}

async function openBookmarkPicker(targetId) {
  activeBookmarkTarget = targetId;
  bookmarkTitle.textContent = targetId === "workUrl" ? "选择工作网址" : "选择娱乐网址";
  bookmarkPicker.hidden = false;
  bookmarkSearch.value = "";
  bookmarkList.innerHTML = '<div class="empty-bookmarks">正在读取收藏夹...</div>';

  try {
    await loadBookmarks();
    renderBookmarks();
    bookmarkSearch.focus();
  } catch {
    bookmarkList.innerHTML = '<div class="empty-bookmarks">读取收藏夹失败，请确认扩展权限。</div>';
  }
}

function hideBookmarkPicker() {
  bookmarkPicker.hidden = true;
  activeBookmarkTarget = null;
}

function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!response || response.ok === false) {
        reject(new Error(response && response.error ? response.error : "操作失败"));
        return;
      }
      resolve(response);
    });
  });
}

async function loadSettings() {
  const stored = await chrome.storage.local.get({
    workUrl: "",
    funUrl: "",
    idleSeconds: 5,
    draftWorkUrl: null,
    draftFunUrl: null,
    draftIdleSeconds: null,
    enabled: false
  });

  fields.workUrl.value = stored.draftWorkUrl !== null ? stored.draftWorkUrl : stored.workUrl;
  fields.funUrl.value = stored.draftFunUrl !== null ? stored.draftFunUrl : stored.funUrl;
  fields.idleSeconds.value = stored.draftIdleSeconds !== null ? stored.draftIdleSeconds : stored.idleSeconds;
  setStatus(stored.enabled ? "运行中" : "先点“设置窗口”打开两个窗口并调整小窗。");
}

prepareButton.addEventListener("click", async () => {
  try {
    const settings = readSettings();
    await sendMessage({ type: "moyu:prepare", settings });
    await chrome.storage.local.set({
      draftWorkUrl: settings.workUrl,
      draftFunUrl: settings.funUrl,
      draftIdleSeconds: settings.idleSeconds
    });
    setStatus("设置状态：两个窗口已打开。调整小窗后再点启动。");
  } catch {
    setStatus("网址或参数不正确。", true);
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const settings = readSettings();
    await sendMessage({ type: "moyu:start", settings });
    await chrome.storage.local.set({
      draftWorkUrl: settings.workUrl,
      draftFunUrl: settings.funUrl,
      draftIdleSeconds: settings.idleSeconds
    });
    setStatus("已启动。活动时小窗会隐藏并静音，静止后恢复。");
  } catch {
    setStatus("网址或参数不正确。", true);
  }
});

stopButton.addEventListener("click", async () => {
  try {
    await sendMessage({ type: "moyu:stop" });
    setStatus("已停止，并关闭娱乐小窗。");
  } catch {
    setStatus("停止失败，请重试。", true);
  }
});

Object.values(fields).forEach((field) => {
  field.addEventListener("input", saveDraftNow);
  field.addEventListener("blur", saveDraftNow);
});

document.querySelectorAll(".bookmark-button").forEach((button) => {
  button.addEventListener("click", () => {
    openBookmarkPicker(button.dataset.target);
  });
});

bookmarkSearch.addEventListener("input", () => {
  renderBookmarks(bookmarkSearch.value);
});

bookmarkList.addEventListener("click", async (event) => {
  const item = event.target.closest(".bookmark-item");
  if (!item || !activeBookmarkTarget) return;

  fields[activeBookmarkTarget].value = item.dataset.url;
  await saveDraftNow();
  hideBookmarkPicker();
});

closeBookmarkPicker.addEventListener("click", hideBookmarkPicker);

loadSettings();
