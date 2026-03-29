const LANG_NAMES: Record<string, string> = {
  ja: "日本語",
  en: "English",
  ko: "한국어",
  zh: "中文",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  pt: "Português",
  ru: "Русский",
  it: "Italiano",
};

function getLangName(code: string): string {
  return LANG_NAMES[code] ?? code;
}

function getParams(): { sl: string; tl: string } | null {
  const url = new URL(location.href);
  const sl = url.searchParams.get("sl");
  const tl = url.searchParams.get("tl");
  if (!sl || !tl) return null;
  return { sl, tl };
}

async function translate(
  text: string,
  sl: string,
  tl: string
): Promise<string> {
  if (!text.trim()) return "";
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  const data = await res.json();
  return (data[0] as [string, string][])
    .map((seg) => seg[0])
    .join("");
}

// Font size threshold (characters) — matches Google Translate behavior
const FONT_SMALL_THRESHOLD = 80;

function updateFontSize(panel: HTMLElement, text: string) {
  if (text.length > FONT_SMALL_THRESHOLD) {
    panel.classList.add("font-small");
  } else {
    panel.classList.remove("font-small");
  }
}

// TTS using Google Translate's TTS endpoint
const SPEAKER_SVG = `<svg focusable="false" width="20" height="20" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm7-.17v6.34L7.83 13H5v-2h2.83L10 8.83zM16.5 12A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"></path><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z"></path></svg>`;
const STOP_SVG = `<svg focusable="false" width="20" height="20" viewBox="0 0 24 24"><path d="M6,6h12v12H6V6z"></path></svg>`;

function createTtsButton(
  lang: string,
  getText: () => string
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.className = "dual-tts-btn";
  btn.innerHTML = SPEAKER_SVG;
  btn.title = "音声を聞く";
  btn.disabled = true;

  let audio: HTMLAudioElement | null = null;
  let playing = false;

  function stop() {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio = null;
    }
    playing = false;
    btn.classList.remove("playing");
    btn.innerHTML = SPEAKER_SVG;
    btn.title = "音声を聞く";
  }

  btn.addEventListener("click", () => {
    if (playing) {
      stop();
      return;
    }

    const text = getText();
    if (!text.trim()) return;

    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(text)}`;
    audio = new Audio(ttsUrl);
    playing = true;
    btn.classList.add("playing");
    btn.innerHTML = STOP_SVG;
    btn.title = "停止";

    audio.play().catch(() => stop());
    audio.addEventListener("ended", stop);
    audio.addEventListener("error", stop);
  });

  return btn;
}

function createPanel(sl: string, tl: string): HTMLElement {
  const revSl = tl;
  const revTl = sl;

  const panel = document.createElement("div");
  panel.id = "gt-dual-reverse-panel";

  panel.innerHTML = `
    <div class="dual-header">
      <div class="dual-header-left">
        <span class="lang-label">${getLangName(revSl)}</span>
        <span class="arrow">→</span>
        <span class="lang-label">${getLangName(revTl)}</span>
      </div>
      <label class="dual-auto-toggle">
        <span class="dual-auto-toggle-label">自動で再翻訳</span>
        <div class="dual-toggle-track">
          <div class="dual-toggle-thumb"></div>
          <input type="checkbox" class="dual-toggle-input" />
        </div>
      </label>
    </div>
    <div class="dual-body">
      <div class="dual-input-area">
        <textarea placeholder="${getLangName(revSl)} のテキストを入力..."></textarea>
        <div class="dual-tts-row" data-side="input"></div>
      </div>
      <div class="dual-output-area">
        <div class="result-text placeholder">翻訳</div>
        <div class="dual-tts-row" data-side="output"></div>
      </div>
    </div>
  `;

  const textarea = panel.querySelector("textarea")!;
  const resultDiv = panel.querySelector(".result-text")!;
  const toggleInput = panel.querySelector<HTMLInputElement>(".dual-toggle-input")!;

  // TTS buttons
  const inputTtsRow = panel.querySelector(
    '.dual-tts-row[data-side="input"]'
  )!;
  const outputTtsRow = panel.querySelector(
    '.dual-tts-row[data-side="output"]'
  )!;

  const inputTtsBtn = createTtsButton(revSl, () => textarea.value);
  const outputTtsBtn = createTtsButton(revTl, () => {
    const text = resultDiv.textContent ?? "";
    return resultDiv.classList.contains("placeholder") ? "" : text;
  });

  inputTtsRow.appendChild(inputTtsBtn);
  outputTtsRow.appendChild(outputTtsBtn);

  let debounceTimer: ReturnType<typeof setTimeout>;

  function triggerTranslate() {
    clearTimeout(debounceTimer);
    const text = textarea.value;

    updateFontSize(panel, text);
    inputTtsBtn.disabled = !text.trim();

    if (!text.trim()) {
      resultDiv.textContent = "翻訳";
      resultDiv.classList.add("placeholder");
      outputTtsBtn.disabled = true;
      return;
    }

    resultDiv.textContent = "翻訳しています...";
    resultDiv.classList.add("placeholder");
    outputTtsBtn.disabled = true;

    debounceTimer = setTimeout(async () => {
      try {
        const result = await translate(text, revSl, revTl);
        resultDiv.textContent = result;
        resultDiv.classList.remove("placeholder");
        outputTtsBtn.disabled = !result.trim();
      } catch {
        resultDiv.textContent = "翻訳エラーが発生しました";
        resultDiv.classList.add("placeholder");
        outputTtsBtn.disabled = true;
      }
    }, 300);
  }

  textarea.addEventListener("input", triggerTranslate);

  // Auto re-translate: watch the original translation output
  let autoObserver: MutationObserver | null = null;

  function getOriginalResultText(): string {
    // The original translation result lives in span.ryNqvb[jsname="W297wb"]
    const spans = document.querySelectorAll(
      '.usGWQd span.ryNqvb[jsname="W297wb"]'
    );
    return Array.from(spans)
      .map((s) => s.textContent ?? "")
      .join("");
  }

  function feedOriginalResult() {
    const text = getOriginalResultText();
    if (text && text !== textarea.value) {
      textarea.value = text;
      triggerTranslate();
    }
  }

  function startAutoWatch() {
    // Initial feed
    feedOriginalResult();

    // Watch for changes in the original output area
    const outputContainer = document.querySelector(".usGWQd");
    if (!outputContainer) return;

    autoObserver = new MutationObserver(() => {
      feedOriginalResult();
    });
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

  const toggleTrack = panel.querySelector(".dual-toggle-track")!;

  toggleInput.addEventListener("change", () => {
    if (toggleInput.checked) {
      toggleTrack.classList.add("active");
      textarea.readOnly = true;
      startAutoWatch();
    } else {
      toggleTrack.classList.remove("active");
      textarea.readOnly = false;
      stopAutoWatch();
    }
  });

  return panel;
}

function findInsertionPoint(): Element | null {
  return document.querySelector(".OPPzxe");
}

function inject() {
  if (document.getElementById("gt-dual-reverse-panel")) return;

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
      document.getElementById("gt-dual-reverse-panel")?.remove();
      inject();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function waitAndInject() {
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

waitAndInject();
