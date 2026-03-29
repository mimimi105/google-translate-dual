import { PANEL_ID, SELECTORS } from "./constants.ts";
import { getParams } from "./utils.ts";
import { createPanel } from "./components/panel.ts";
import { initI18n, whenReady } from "./i18n.ts";

function findInsertionPoint(): Element | null {
  if (!document.querySelector(SELECTORS.originalTextarea)) return null;
  return document.querySelector(SELECTORS.insertionPoint);
}

let currentSl = "";
let currentTl = "";

async function inject() {
  const params = getParams();
  if (!params) return;

  const existing = document.getElementById(PANEL_ID);

  // Already showing the correct panel
  if (existing && params.sl === currentSl && params.tl === currentTl) return;

  // Language changed — remove old panel
  if (existing) existing.remove();

  const container = findInsertionPoint();
  if (!container) return;

  await whenReady();

  currentSl = params.sl;
  currentTl = params.tl;
  const panel = createPanel(params.sl, params.tl);
  container.parentElement?.insertBefore(panel, container.nextSibling);
}

function watchChanges() {
  let lastSl = currentSl;
  let lastTl = currentTl;

  // Poll URL params to catch all language changes reliably
  setInterval(() => {
    const params = getParams();
    if (!params) return;

    if (params.sl !== lastSl || params.tl !== lastTl) {
      lastSl = params.sl;
      lastTl = params.tl;
      inject();
    }
  }, 500);

  // MutationObserver only for re-injection when panel is missing (e.g. back/forward)
  let checkTimer: ReturnType<typeof setTimeout> | null = null;

  const observer = new MutationObserver(() => {
    if (document.getElementById(PANEL_ID)) return;

    if (checkTimer) return;
    checkTimer = setTimeout(() => {
      checkTimer = null;
      if (!document.getElementById(PANEL_ID) && findInsertionPoint()) {
        inject();
      }
    }, 200);
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

async function initAfterLoad() {
  initI18n();

  if (findInsertionPoint()) {
    await inject();
    watchChanges();
    return;
  }

  // Wait for Google Translate to render
  const observer = new MutationObserver(async () => {
    if (findInsertionPoint()) {
      observer.disconnect();
      await inject();
      watchChanges();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "complete") {
  initAfterLoad();
} else {
  window.addEventListener("load", initAfterLoad);
}
