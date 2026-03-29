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

function updateFontSize(panel: HTMLElement, text: string) {
  panel.classList.toggle("font-small", text.length > FONT_SMALL_THRESHOLD);
}

export function createPanel(sl: string, tl: string): HTMLElement {
  const revSl = tl;
  const revTl = sl;

  const panel = document.createElement("div");
  panel.id = PANEL_ID;

  panel.innerHTML = `
    <div class="dual-header">
      <div class="dual-header-left">
        <span class="lang-label">${getLangName(revSl)}</span>
        <span class="arrow">→</span>
        <span class="lang-label">${getLangName(revTl)}</span>
      </div>
      <label class="dual-auto-toggle">
        <span class="dual-auto-toggle-label">${t("autoRetranslate")}</span>
        <div class="dual-toggle-track">
          <div class="dual-toggle-thumb"></div>
          <input type="checkbox" class="dual-toggle-input" />
        </div>
      </label>
    </div>
    <div class="dual-body">
      <div class="dual-input-area">
        <textarea placeholder="${t("placeholder", { lang: getLangName(revSl) })}"></textarea>
        <div class="dual-tts-row" data-side="input"></div>
      </div>
      <div class="dual-output-area">
        <div class="result-text placeholder">${t("resultPlaceholder")}</div>
        <div class="dual-tts-row" data-side="output"></div>
      </div>
    </div>
  `;

  const textarea = panel.querySelector("textarea")!;
  const resultDiv = panel.querySelector(".result-text")!;
  const toggleInput =
    panel.querySelector<HTMLInputElement>(".dual-toggle-input")!;
  const toggleTrack = panel.querySelector(".dual-toggle-track")!;

  // TTS buttons
  const inputTtsBtn = createTtsButton(revSl, () => textarea.value);
  const outputTtsBtn = createTtsButton(revTl, () => {
    const text = resultDiv.textContent ?? "";
    return resultDiv.classList.contains("placeholder") ? "" : text;
  });

  panel
    .querySelector('.dual-tts-row[data-side="input"]')!
    .appendChild(inputTtsBtn);
  panel
    .querySelector('.dual-tts-row[data-side="output"]')!
    .appendChild(outputTtsBtn);

  // Translation logic
  let debounceTimer: ReturnType<typeof setTimeout>;
  let lastResult = "";

  function showLoading() {
    // Append "..." to existing result instead of replacing it
    if (lastResult) {
      resultDiv.textContent = lastResult + "...";
      resultDiv.classList.remove("placeholder");
    } else {
      resultDiv.textContent = t("resultPlaceholder");
      resultDiv.classList.add("placeholder");
    }
    outputTtsBtn.disabled = true;
  }

  function triggerTranslate() {
    clearTimeout(debounceTimer);
    const text = textarea.value;

    updateFontSize(panel, text);
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
