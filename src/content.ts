import { PANEL_ID, SELECTORS } from "./constants.ts";
import { getParams } from "./utils.ts";
import { createPanel } from "./components/panel.ts";

function isOriginalReady(): boolean {
  return !!document.querySelector(SELECTORS.originalTextarea);
}

function findInsertionPoint(): Element | null {
  if (!isOriginalReady()) return null;
  return document.querySelector(SELECTORS.insertionPoint);
}

function inject() {
  if (document.getElementById(PANEL_ID)) return;

  const params = getParams();
  if (!params) return;

  const container = findInsertionPoint();
  if (!container) return;

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

function initAfterLoad() {
  if (findInsertionPoint()) {
    inject();
    watchUrlChange();
    return;
  }
  const observer = new MutationObserver(() => {
    if (findInsertionPoint()) {
      observer.disconnect();
      inject();
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
