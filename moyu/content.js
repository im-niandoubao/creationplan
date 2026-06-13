let moyuIdleTimer = 0;
let moyuLastActivity = 0;
let moyuConfig = {
  enabled: false,
  idleSeconds: 5,
  isFunTab: false,
  isWorkTab: false
};
let moyuStartSurface = null;
let moyuExitSurface = null;

function sendMoyuMessage(type) {
  try {
    chrome.runtime.sendMessage({ type });
  } catch {
    // The extension context may be unavailable during page teardown.
  }
}

function requestMoyuMessage(type) {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage({ type }, (response) => {
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
    } catch (error) {
      reject(error);
    }
  });
}

function askMoyuContext() {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage({ type: "moyu:getContext" }, (response) => {
        if (chrome.runtime.lastError || !response || response.ok === false) {
          resolve(null);
          return;
        }
        resolve(response);
      });
    } catch {
      resolve(null);
    }
  });
}

function clearMoyuIdleTimer() {
  if (moyuIdleTimer) {
    window.clearTimeout(moyuIdleTimer);
    moyuIdleTimer = 0;
  }
}

function removeMoyuStartSurface() {
  if (moyuStartSurface) {
    moyuStartSurface.remove();
    moyuStartSurface = null;
  }
  document.querySelectorAll("#moyuStartSurface").forEach((node) => {
    node.remove();
  });
}

function removeMoyuExitSurface() {
  if (moyuExitSurface) {
    moyuExitSurface.remove();
    moyuExitSurface = null;
  }
  document.querySelectorAll("#moyuExitSurface").forEach((node) => {
    node.remove();
  });
}

function ensureMoyuExitSurface() {
  if (window.top !== window || !moyuConfig.enabled || !moyuConfig.isWorkTab) {
    removeMoyuExitSurface();
    return;
  }

  if (moyuExitSurface && document.documentElement.contains(moyuExitSurface)) return;

  removeMoyuExitSurface();
  moyuExitSurface = document.createElement("button");
  moyuExitSurface.id = "moyuExitSurface";
  moyuExitSurface.type = "button";
  moyuExitSurface.textContent = "退出";
  moyuExitSurface.style.cssText = [
    "position:fixed",
    "right:14px",
    "top:14px",
    "z-index:2147483647",
    "height:34px",
    "border:1px solid rgba(255,255,255,.3)",
    "border-radius:10px",
    "padding:0 14px",
    "background:rgba(211,77,52,.92)",
    "box-shadow:0 12px 34px rgba(0,0,0,.24)",
    "color:white",
    "font:800 13px/34px system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    "letter-spacing:0",
    "cursor:pointer"
  ].join(";");

  moyuExitSurface.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    removeMoyuExitSurface();
    try {
      await requestMoyuMessage("moyu:stop");
    } catch {
      // The extension popup can still stop the session if this fails.
    }
  });

  (document.documentElement || document.body).append(moyuExitSurface);
}

function ensureMoyuStartSurface() {
  if (window.top !== window || !moyuConfig.isFunTab || moyuConfig.enabled) {
    removeMoyuStartSurface();
    return;
  }

  if (moyuStartSurface && document.documentElement.contains(moyuStartSurface)) return;

  removeMoyuStartSurface();
  moyuStartSurface = document.createElement("div");
  moyuStartSurface.id = "moyuStartSurface";
  moyuStartSurface.style.cssText = [
    "position:fixed",
    "right:14px",
    "top:14px",
    "z-index:2147483647",
    "display:flex",
    "align-items:center",
    "gap:8px",
    "padding:8px 8px 8px 12px",
    "border:1px solid rgba(255,255,255,.28)",
    "border-radius:10px",
    "background:rgba(18,24,32,.86)",
    "box-shadow:0 12px 34px rgba(0,0,0,.28)",
    "backdrop-filter:blur(12px)",
    "font:13px/1.2 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    "color:white"
  ].join(";");

  const label = document.createElement("span");
  label.textContent = "摸鱼";
  label.style.cssText = "font-weight:650;letter-spacing:0;";

  const startButton = document.createElement("button");
  startButton.type = "button";
  startButton.textContent = "启动";
  startButton.style.cssText = [
    "height:30px",
    "border:0",
    "border-radius:8px",
    "padding:0 13px",
    "background:#56d364",
    "color:#08110b",
    "font:700 13px/30px system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    "cursor:pointer"
  ].join(";");

  startButton.addEventListener("click", async (event) => {
    event.preventDefault();
    event.stopPropagation();
    removeMoyuStartSurface();
    try {
      await requestMoyuMessage("moyu:startFromSurface");
    } catch {
      // The extension popup can still start the session if this fails.
    }
  });

  moyuStartSurface.append(label, startButton);
  (document.documentElement || document.body).append(moyuStartSurface);
}

function scheduleMoyuIdle() {
  clearMoyuIdleTimer();
  if (!moyuConfig.enabled || document.visibilityState !== "visible") return;

  moyuIdleTimer = window.setTimeout(() => {
    moyuIdleTimer = 0;
    sendMoyuMessage("moyu:idle");
  }, Math.max(2, moyuConfig.idleSeconds) * 1000);
}

function reportMoyuActivity() {
  const now = Date.now();
  if (now - moyuLastActivity < 250) {
    scheduleMoyuIdle();
    return;
  }

  moyuLastActivity = now;
  sendMoyuMessage("moyu:activity");
  scheduleMoyuIdle();
}

function handleMoyuInput(event) {
  if (moyuConfig.enabled && moyuConfig.isFunTab) {
    event.preventDefault();
    event.stopImmediatePropagation();
    sendMoyuMessage("moyu:activity");
    return;
  }

  reportMoyuActivity();
}

async function loadMoyuConfig() {
  try {
    const [stored, context] = await Promise.all([
      chrome.storage.local.get({
        enabled: false,
        idleSeconds: 5
      }),
      askMoyuContext()
    ]);
    moyuConfig = {
      ...stored,
      isFunTab: Boolean(context && context.isFunTab)
    };
    if (context) {
      moyuConfig.enabled = context.enabled;
      moyuConfig.idleSeconds = context.idleSeconds;
      moyuConfig.isFunTab = context.isFunTab;
      moyuConfig.isWorkTab = context.isWorkTab;
    }
    ensureMoyuStartSurface();
    ensureMoyuExitSurface();
    scheduleMoyuIdle();
  } catch {
    clearMoyuIdleTimer();
    removeMoyuStartSurface();
    removeMoyuExitSurface();
  }
}

[
  "mousemove",
  "mousedown",
  "keydown",
  "wheel",
  "touchstart",
  "scroll"
].forEach((eventName) => {
  window.addEventListener(eventName, handleMoyuInput, {
    capture: true,
    passive: false
  });
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    scheduleMoyuIdle();
  } else {
    clearMoyuIdleTimer();
  }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  if (changes.enabled || changes.idleSeconds || changes.funTabId || changes.workTabId) {
    loadMoyuConfig();
  }
});

removeMoyuStartSurface();
removeMoyuExitSurface();
loadMoyuConfig();
