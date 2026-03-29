import {
  PANEL_ID,
  STORAGE_KEY,
  FONT_SMALL_THRESHOLD,
  TRANSLATE_DEBOUNCE_MS,
  SELECTORS,
} from "../constants.ts";
import { getLangName } from "../utils.ts";
import { translate } from "../translate.ts";
import { createTtsButton } from "./tts-button.ts";
import { t } from "../i18n.ts";

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string>,
  children?: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "className") e.className = v;
      else e.setAttribute(k, v);
    }
  }
  if (children) {
    for (const c of children) {
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
  }
  return e;
}

function updateFontSize(panel: HTMLElement, text: string) {
  panel.classList.toggle("font-small", text.length > FONT_SMALL_THRESHOLD);
}

export function createPanel(sl: string, tl: string): HTMLElement {
  const revSl = tl;
  const revTl = sl;

  const panel = document.createElement("div");
  panel.id = PANEL_ID;

  // Header
  const headerLeft = el("div", { className: "dual-header-left" }, [
    el("span", { className: "lang-label" }, [getLangName(revSl)]),
    el("span", { className: "arrow" }, ["\u2192"]),
    el("span", { className: "lang-label" }, [getLangName(revTl)]),
  ]);

  const toggleInput = el("input", {
    type: "checkbox",
    className: "dual-toggle-input",
  }) as HTMLInputElement;
  const toggleThumb = el("div", { className: "dual-toggle-thumb" });
  const toggleTrack = el("div", { className: "dual-toggle-track" }, [
    toggleThumb,
    toggleInput,
  ]);
  const autoToggle = el("label", { className: "dual-auto-toggle" }, [
    el("span", { className: "dual-auto-toggle-label" }, [t("autoRetranslate")]),
    toggleTrack,
  ]);

  const header = el("div", { className: "dual-header" }, [
    headerLeft,
    autoToggle,
  ]);

  // Input area
  const textarea = el("textarea", {
    placeholder: t("placeholder", { lang: getLangName(revSl) }),
  }) as HTMLTextAreaElement;
  const inputTtsRow = el("div", {
    className: "dual-tts-row",
    "data-side": "input",
  });
  const inputArea = el("div", { className: "dual-input-area" }, [
    textarea,
    inputTtsRow,
  ]);

  // Output area
  const resultDiv = el("div", { className: "result-text placeholder" }, [
    t("resultPlaceholder"),
  ]);
  const outputTtsRow = el("div", {
    className: "dual-tts-row",
    "data-side": "output",
  });
  const outputArea = el("div", { className: "dual-output-area" }, [
    resultDiv,
    outputTtsRow,
  ]);

  // Body
  const body = el("div", { className: "dual-body" }, [inputArea, outputArea]);

  panel.appendChild(header);
  panel.appendChild(body);

  // TTS buttons
  const inputTtsBtn = createTtsButton(revSl, () => textarea.value);
  const outputTtsBtn = createTtsButton(revTl, () => {
    const text = resultDiv.textContent ?? "";
    return resultDiv.classList.contains("placeholder") ? "" : text;
  });
  inputTtsRow.appendChild(inputTtsBtn);
  outputTtsRow.appendChild(outputTtsBtn);

  // Translation logic
  let debounceTimer: ReturnType<typeof setTimeout>;
  let lastResult = "";

  function showLoading() {
    if (lastResult) {
      resultDiv.textContent = lastResult + "...";
      resultDiv.classList.remove("placeholder");
    } else {
      resultDiv.textContent = t("resultPlaceholder");
      resultDiv.classList.add("placeholder");
    }
    outputTtsBtn.disabled = true;
  }

  function autoResize() {
    if (!panel.isConnected) {
      // Defer until panel is in DOM
      requestAnimationFrame(() => autoResize());
      return;
    }
    textarea.style.height = "0";
    textarea.style.height = Math.max(textarea.scrollHeight, 166) + "px";
  }

  function triggerTranslate() {
    clearTimeout(debounceTimer);
    const text = textarea.value;

    updateFontSize(panel, text);
    autoResize();
    inputTtsBtn.disabled = !text.trim();

    if (!text.trim()) {
      lastResult = "";
      resultDiv.textContent = t("resultPlaceholder");
      resultDiv.classList.add("placeholder");
      outputTtsBtn.disabled = true;
      return;
    }

    showLoading();

    debounceTimer = setTimeout(async () => {
      try {
        const result = await translate(text, revSl, revTl);
        lastResult = result;
        resultDiv.textContent = result;
        resultDiv.classList.remove("placeholder");
        outputTtsBtn.disabled = !result.trim();
      } catch {
        resultDiv.textContent = t("error");
        resultDiv.classList.add("placeholder");
        outputTtsBtn.disabled = true;
      }
    }, TRANSLATE_DEBOUNCE_MS);
  }

  textarea.addEventListener("input", triggerTranslate);

  // Auto re-translate
  let autoObserver: MutationObserver | null = null;

  function getOriginalResultText(): string {
    const spans = document.querySelectorAll(SELECTORS.originalOutputSpans);
    return Array.from(spans)
      .map((s) => s.textContent ?? "")
      .join("");
  }

  function feedOriginalResult() {
    const text = getOriginalResultText();
    if (text !== textarea.value) {
      textarea.value = text;
      triggerTranslate();
    }
  }

  function startAutoWatch() {
    feedOriginalResult();

    const outputContainer = document.querySelector(SELECTORS.originalOutput);
    if (!outputContainer) return;

    autoObserver = new MutationObserver(() => feedOriginalResult());
    autoObserver.observe(outputContainer, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  function stopAutoWatch() {
    if (autoObserver) {
      autoObserver.disconnect();
      autoObserver = null;
    }
  }

  function setAutoMode(on: boolean) {
    toggleInput.checked = on;
    toggleTrack.classList.toggle("active", on);
    if (on) {
      startAutoWatch();
    } else {
      stopAutoWatch();
    }
  }

  toggleInput.addEventListener("change", () => {
    const on = toggleInput.checked;
    localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
    setAutoMode(on);
  });

  // Restore saved toggle state
  if (localStorage.getItem(STORAGE_KEY) === "1") {
    setAutoMode(true);
  }

  return panel;
}
