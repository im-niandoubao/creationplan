const DEFAULTS = {
  enabled: false,
  workUrl: "",
  funUrl: "",
  idleSeconds: 5,
  funLeft: 80,
  funTop: 80,
  funWidth: 520,
  funHeight: 420,
  funShownAt: 0,
  workTabId: null,
  workWindowId: null,
  funTabId: null,
  funWindowId: null
};

async function getState() {
  return { ...DEFAULTS, ...(await chrome.storage.local.get(DEFAULTS)) };
}

async function setState(patch) {
  await chrome.storage.local.set(patch);
}

function normalizeUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  const withProtocol = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  return new URL(withProtocol).href;
}

async function tabExists(tabId) {
  if (!tabId) return false;
  try {
    await chrome.tabs.get(tabId);
    return true;
  } catch {
    return false;
  }
}

async function windowExists(windowId) {
  if (!windowId) return false;
  try {
    await chrome.windows.get(windowId);
    return true;
  } catch {
    return false;
  }
}

async function muteFunTab(state, muted) {
  if (!(await tabExists(state.funTabId))) return;
  try {
    await chrome.tabs.update(state.funTabId, { muted });
  } catch {
    // Some internal browser pages cannot be muted by extensions.
  }
}

async function focusWork(state) {
  if (await tabExists(state.workTabId)) {
    await chrome.tabs.update(state.workTabId, { active: true });
  }

  if (await windowExists(state.workWindowId)) {
    await chrome.windows.update(state.workWindowId, {
      focused: true,
      state: "normal"
    });
  }
}

async function hideFunWindow({ focus = true } = {}) {
  const state = await getState();
  await muteFunTab(state, true);
  if (await windowExists(state.funWindowId)) {
    await chrome.windows.update(state.funWindowId, { state: "minimized" });
    if (focus) await focusWork(state);
  }
}

async function closeFunWindow({ focus = true } = {}) {
  const state = await getState();
  if (await windowExists(state.funWindowId)) {
    await chrome.windows.remove(state.funWindowId);
    if (focus) await focusWork(state);
  }
  await setState({ funWindowId: null, funTabId: null });
}

async function ensureWorkTab(workUrl, state) {
  if (await tabExists(state.workTabId)) {
    const tab = await chrome.tabs.get(state.workTabId);
    if (tab.url !== workUrl) {
      await chrome.tabs.update(state.workTabId, { url: workUrl, active: true });
    }
    return {
      workTabId: state.workTabId,
      workWindowId: tab.windowId
    };
  }

  const tab = await chrome.tabs.create({ url: workUrl, active: true });
  return {
    workTabId: tab.id,
    workWindowId: tab.windowId
  };
}

async function ensureFunWindow(funUrl, state, { focused = true } = {}) {
  if ((await windowExists(state.funWindowId)) && (await tabExists(state.funTabId))) {
    const tab = await chrome.tabs.get(state.funTabId);
    if (tab.url !== funUrl) {
      await chrome.tabs.update(state.funTabId, { url: funUrl, active: true, muted: false });
    } else {
      await chrome.tabs.update(state.funTabId, { active: true, muted: false });
    }
    const updateInfo = {
      state: "normal",
      left: state.funLeft,
      top: state.funTop,
      width: state.funWidth,
      height: state.funHeight
    };
    if (focused) updateInfo.focused = true;
    await chrome.windows.update(state.funWindowId, updateInfo);
    return {
      funTabId: state.funTabId,
      funWindowId: state.funWindowId
    };
  }

  const win = await chrome.windows.create({
    url: funUrl,
    type: "popup",
    left: state.funLeft,
    top: state.funTop,
    width: state.funWidth,
    height: state.funHeight,
    focused
  });

  const tabId = win.tabs && win.tabs[0] ? win.tabs[0].id : null;
  if (tabId) {
    await chrome.tabs.update(tabId, { muted: false });
  }

  return {
    funWindowId: win.id,
    funTabId: tabId
  };
}

function readSettings(settings, state = DEFAULTS) {
  const workUrl = normalizeUrl(settings.workUrl !== undefined ? settings.workUrl : state.workUrl);
  const funUrl = normalizeUrl(settings.funUrl !== undefined ? settings.funUrl : state.funUrl);
  const idleSeconds = Math.max(2, Math.min(60, Number(settings.idleSeconds) || state.idleSeconds || DEFAULTS.idleSeconds));
  const funWidth = Math.max(360, Math.min(1200, Number(settings.funWidth) || state.funWidth || DEFAULTS.funWidth));
  const funHeight = Math.max(260, Math.min(900, Number(settings.funHeight) || state.funHeight || DEFAULTS.funHeight));
  const funLeft = Number.isFinite(Number(state.funLeft)) ? Number(state.funLeft) : DEFAULTS.funLeft;
  const funTop = Number.isFinite(Number(state.funTop)) ? Number(state.funTop) : DEFAULTS.funTop;

  if (!workUrl || !funUrl) {
    throw new Error("missing_url");
  }

  return { workUrl, funUrl, idleSeconds, funLeft, funTop, funWidth, funHeight };
}

async function showFunWindow() {
  const state = await getState();
  if (!state.enabled || !state.funUrl) return;
  const funShownAt = Date.now();

  if (await windowExists(state.funWindowId)) {
    if (await tabExists(state.funTabId)) {
      await chrome.tabs.update(state.funTabId, { muted: false });
    }
    await chrome.windows.update(state.funWindowId, {
      state: "normal",
      left: state.funLeft,
      top: state.funTop,
      width: state.funWidth,
      height: state.funHeight
    });
    await setState({ funShownAt });
    return;
  }

  await setState({
    ...(await ensureFunWindow(state.funUrl, state, { focused: false })),
    funShownAt
  });
}

async function prepareSession(settings) {
  const state = await getState();
  const parsed = readSettings(settings, state);
  await setState({ ...parsed, enabled: false });

  const nextState = await getState();
  const workIds = await ensureWorkTab(parsed.workUrl, nextState);
  await setState(workIds);

  const withWork = await getState();
  const funIds = await ensureFunWindow(parsed.funUrl, withWork, { focused: true });
  await setState(funIds);

  return { ok: true };
}

async function startSession(settings) {
  await prepareSession(settings);
  const state = await getState();
  await setState({ enabled: true, funShownAt: Date.now() });
  await muteFunTab(state, false);

  return { ok: true };
}

async function startPreparedSession() {
  const state = await getState();
  await setState({ enabled: true, funShownAt: Date.now() });
  await muteFunTab(state, false);
  return { ok: true };
}

async function pauseSession() {
  const state = await getState();
  await setState({ enabled: false });
  await muteFunTab(state, false);
  await focusWork(state);
  return { ok: true };
}

async function stopSession() {
  await closeFunWindow();
  await setState({ enabled: false });
  return { ok: true };
}

chrome.runtime.onInstalled.addListener(async () => {
  const state = await getState();
  await setState({
    idleSeconds: state.idleSeconds || DEFAULTS.idleSeconds,
    funLeft: Number.isFinite(Number(state.funLeft)) ? state.funLeft : DEFAULTS.funLeft,
    funTop: Number.isFinite(Number(state.funTop)) ? state.funTop : DEFAULTS.funTop,
    funWidth: state.funWidth || DEFAULTS.funWidth,
    funHeight: state.funHeight || DEFAULTS.funHeight
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message.type === "moyu:getContext") {
      const state = await getState();
      sendResponse({
        ok: true,
        enabled: state.enabled,
        idleSeconds: state.idleSeconds,
        isFunTab: Boolean(sender.tab && sender.tab.id === state.funTabId),
        isWorkTab: Boolean(sender.tab && sender.tab.id === state.workTabId)
      });
      return;
    }

    if (message.type === "moyu:prepare") {
      sendResponse(await prepareSession(message.settings || {}));
      return;
    }

    if (message.type === "moyu:start") {
      sendResponse(await startSession(message.settings || {}));
      return;
    }

    if (message.type === "moyu:startFromSurface") {
      sendResponse(await startPreparedSession());
      return;
    }

    if (message.type === "moyu:pause") {
      sendResponse(await pauseSession());
      return;
    }

    if (message.type === "moyu:stop") {
      sendResponse(await stopSession());
      return;
    }

    if (message.type === "moyu:hideFun") {
      await hideFunWindow();
      sendResponse({ ok: true });
      return;
    }

    if (message.type === "moyu:closeFun") {
      await closeFunWindow();
      sendResponse({ ok: true });
      return;
    }

    if (message.type === "moyu:activity") {
      const state = await getState();
      if (state.enabled) {
        const isEarlyActivity = Date.now() - state.funShownAt < 1000;
        if (!isEarlyActivity) {
          await hideFunWindow();
        }
      }
      sendResponse({ ok: true });
      return;
    }

    if (message.type === "moyu:idle") {
      const state = await getState();
      if (state.enabled && sender.tab && sender.tab.id === state.workTabId) {
        await showFunWindow();
      }
      sendResponse({ ok: true });
      return;
    }

    sendResponse({ ok: false });
  })().catch((error) => {
    sendResponse({ ok: false, error: error.message });
  });

  return true;
});

chrome.windows.onRemoved.addListener(async (windowId) => {
  const state = await getState();
  if (windowId === state.funWindowId) {
    await setState({ funWindowId: null, funTabId: null });
  }
  if (windowId === state.workWindowId) {
    await setState({ enabled: false, workWindowId: null, workTabId: null });
  }
});

if (chrome.windows.onBoundsChanged) {
  chrome.windows.onBoundsChanged.addListener(async (win) => {
    const state = await getState();
    if (win.id !== state.funWindowId || !win.width || !win.height) return;
    const patch = {
      funWidth: win.width,
      funHeight: win.height
    };
    if (Number.isFinite(win.left)) patch.funLeft = win.left;
    if (Number.isFinite(win.top)) patch.funTop = win.top;
    await setState(patch);
  });
}

chrome.tabs.onRemoved.addListener(async (tabId) => {
  const state = await getState();
  if (tabId === state.funTabId) {
    await setState({ funWindowId: null, funTabId: null });
  }
  if (tabId === state.workTabId) {
    await setState({ enabled: false, workWindowId: null, workTabId: null });
  }
});
