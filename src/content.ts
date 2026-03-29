import { PANEL_ID, SELECTORS } from "./constants.ts";
import { getParams } from "./utils.ts";
import { createPanel } from "./components/panel.ts";
import { initI18n, whenReady } from "./i18n.ts";

function isOriginalReady(): boolean {
  return !!document.querySelector(SELECTORS.originalTextarea);
}

function findInsertionPoint(): Element | null {
  if (!isOriginalReady()) return null;
  return document.querySelector(SELECTORS.insertionPoint);
}

async function inject() {
  if (document.getElementById(PANEL_ID)) return;

  const params = getParams();
  if (!params) return;

  const container = findInsertionPoint();
  if (!container) return;

  await whenReady();

  const panel = createPanel(params.sl, params.tl);
  container.parentElement?.insertBefore(panel, container.nextSibling);
}

function watchUrlChange() {
  let lastUrl = location.href;

  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      document.getElementById(PANEL_ID)?.remove();
    }

    // Re-inject if panel is missing and page is ready
    if (!document.getElementById(PANEL_ID) && findInsertionPoint()) {
      inject();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

async function initAfterLoad() {
  // Start translating UI strings immediately
  initI18n();

  if (findInsertionPoint()) {
    await inject();
    watchUrlChange();
    return;
  }
  const observer = new MutationObserver(async () => {
    if (findInsertionPoint()) {
      observer.disconnect();
      await inject();
      watchUrlChange();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

if (document.readyState === "complete") {
  initAfterLoad();
} else {
  window.addEventListener("load", initAfterLoad);
}
