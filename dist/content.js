// src/constants.ts
var PANEL_ID = "gt-dual-reverse-panel";
var STORAGE_KEY = "gt-dual-auto-retranslate";
var FONT_SMALL_THRESHOLD = 80;
var TRANSLATE_DEBOUNCE_MS = 300;
var UI_STRINGS = {
  listen: "Listen",
  stop: "Stop",
  placeholder: "Enter {lang} text...",
  resultPlaceholder: "Translation",
  error: "Translation error",
  autoRetranslate: "Auto re-translate"
};
var SELECTORS = {
  insertionPoint: ".OPPzxe",
  originalTextarea: "textarea.er8xn",
  originalOutput: ".usGWQd",
  originalOutputSpans: '.usGWQd span.ryNqvb[jsname="W297wb"]'
};

// src/utils.ts
function getLangName(code) {
  const pageLang = document.documentElement.lang || navigator.language || "en";
  try {
    const dn = new Intl.DisplayNames([pageLang], { type: "language" });
    return dn.of(code) ?? code;
  } catch {
    return code;
  }
}
function getParams() {
  const url = new URL(location.href);
  const sl = url.searchParams.get("sl");
  const tl = url.searchParams.get("tl");
  if (!sl || !tl)
    return null;
  return { sl, tl };
}

// src/translate.ts
async function translate(text, sl, tl) {
  if (!text.trim())
    return "";
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(sl)}&tl=${encodeURIComponent(tl)}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data[0].map((seg) => seg[0]).join("");
}

// src/components/icons.ts
var SVG_NS = "http://www.w3.org/2000/svg";
function svg(width, height) {
  const el = document.createElementNS(SVG_NS, "svg");
  el.setAttribute("focusable", "false");
  el.setAttribute("width", String(width));
  el.setAttribute("height", String(height));
  el.setAttribute("viewBox", "0 0 24 24");
  return el;
}
function path(d) {
  const el = document.createElementNS(SVG_NS, "path");
  el.setAttribute("d", d);
  return el;
}
function createSpeakerIcon() {
  const s = svg(20, 20);
  s.appendChild(path("M3 9v6h4l5 5V4L7 9H3zm7-.17v6.34L7.83 13H5v-2h2.83L10 8.83zM16.5 12A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"));
  s.appendChild(path("M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z"));
  return s;
}
function createStopIcon() {
  const s = svg(20, 20);
  s.appendChild(path("M6,6h12v12H6V6z"));
  return s;
}
function createCopyIcon() {
  const s = svg(20, 20);
  const g1 = document.createElementNS(SVG_NS, "g");
  g1.appendChild(rect("none", 24, 24));
  s.appendChild(g1);
  const g2 = document.createElementNS(SVG_NS, "g");
  g2.appendChild(path("M16,20H5V6H3v14c0,1.1,0.9,2,2,2h11V20z M20,16V4c0-1.1-0.9-2-2-2H9C7.9,2,7,2.9,7,4v12c0,1.1,0.9,2,2,2h9 C19.1,18,20,17.1,20,16z M18,16H9V4h9V16z"));
  s.appendChild(g2);
  return s;
}
function rect(fill, width, height) {
  const el = document.createElementNS(SVG_NS, "rect");
  el.setAttribute("fill", fill);
  el.setAttribute("width", String(width));
  el.setAttribute("height", String(height));
  return el;
}

// src/i18n.ts
var translated = { ...UI_STRINGS };
var ready = false;
var waiters = [];
function detectLang() {
  return document.documentElement.lang || "en";
}
async function initI18n() {
  const lang = detectLang();
  if (lang.startsWith("en")) {
    ready = true;
    return;
  }
  const keys = Object.keys(UI_STRINGS);
  const joined = keys.map((k) => UI_STRINGS[k]).join(`
`);
  try {
    const result = await translate(joined, "en", lang);
    const lines = result.split(`
`);
    for (let i = 0;i < keys.length; i++) {
      if (lines[i]) {
        translated[keys[i]] = lines[i];
      }
    }
  } catch {}
  ready = true;
  for (const fn of waiters)
    fn();
  waiters.length = 0;
}
function whenReady() {
  if (ready)
    return Promise.resolve();
  return new Promise((resolve) => waiters.push(resolve));
}
function t(key, vars) {
  let msg = translated[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      msg = msg.replace(`{${k}}`, v);
    }
  }
  return msg;
}

// src/components/tts-button.ts
var TTS_MAX_LENGTH = 200;
function setIcon(btn, icon) {
  while (btn.firstChild)
    btn.removeChild(btn.firstChild);
  btn.appendChild(icon);
}
function splitText(text) {
  const chunks = [];
  const sentences = text.match(/[^.!?。！？\n]+[.!?。！？\n]?/g) ?? [text];
  let current = "";
  for (const sentence of sentences) {
    if (current.length + sentence.length > TTS_MAX_LENGTH && current) {
      chunks.push(current.trim());
      current = "";
    }
    if (sentence.length > TTS_MAX_LENGTH) {
      if (current) {
        chunks.push(current.trim());
        current = "";
      }
      const words = sentence.split(/(\s+)/);
      for (const word of words) {
        if (current.length + word.length > TTS_MAX_LENGTH && current) {
          chunks.push(current.trim());
          current = "";
        }
        current += word;
      }
    } else {
      current += sentence;
    }
  }
  if (current.trim())
    chunks.push(current.trim());
  return chunks;
}
function createTtsButton(lang, getText) {
  const btn = document.createElement("button");
  btn.className = "dual-tts-btn";
  setIcon(btn, createSpeakerIcon());
  btn.title = t("listen");
  btn.disabled = true;
  let audio = null;
  let playing = false;
  let stopped = false;
  function stop() {
    stopped = true;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio = null;
    }
    playing = false;
    btn.classList.remove("playing");
    setIcon(btn, createSpeakerIcon());
    btn.title = t("listen");
  }
  async function playChunks(chunks) {
    for (const chunk of chunks) {
      if (stopped)
        return;
      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(chunk)}`;
      audio = new Audio(ttsUrl);
      try {
        await new Promise((resolve, reject) => {
          audio.addEventListener("ended", () => resolve());
          audio.addEventListener("error", () => reject());
          audio.play().catch(reject);
        });
      } catch {
        stop();
        return;
      }
    }
    if (!stopped)
      stop();
  }
  btn.addEventListener("click", () => {
    if (playing) {
      stop();
      return;
    }
    const text = getText();
    if (!text.trim())
      return;
    stopped = false;
    playing = true;
    btn.classList.add("playing");
    setIcon(btn, createStopIcon());
    btn.title = t("stop");
    const chunks = splitText(text);
    playChunks(chunks);
  });
  return btn;
}

// src/components/copy-button.ts
function createCopyButton(getText) {
  const btn = document.createElement("button");
  btn.className = "dual-tts-btn dual-copy-btn";
  btn.appendChild(createCopyIcon());
  btn.title = "Copy";
  btn.addEventListener("click", () => {
    const text = getText();
    if (!text.trim())
      return;
    navigator.clipboard.writeText(text);
  });
  return btn;
}

// src/components/panel.ts
function el(tag, attrs, children) {
  const e = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "className")
        e.className = v;
      else
        e.setAttribute(k, v);
    }
  }
  if (children) {
    for (const c of children) {
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
  }
  return e;
}
function updateFontSize(panel, text) {
  panel.classList.toggle("font-small", text.length > FONT_SMALL_THRESHOLD);
}
function createPanel(sl, tl) {
  const revSl = tl;
  const revTl = sl;
  const panel = document.createElement("div");
  panel.id = PANEL_ID;
  const headerLeft = el("div", { className: "dual-header-left" }, [
    el("span", { className: "lang-label" }, [getLangName(revSl)]),
    el("span", { className: "arrow" }, ["→"]),
    el("span", { className: "lang-label" }, [getLangName(revTl)])
  ]);
  const toggleInput = el("input", {
    type: "checkbox",
    className: "dual-toggle-input"
  });
  const toggleThumb = el("div", { className: "dual-toggle-thumb" });
  const toggleTrack = el("div", { className: "dual-toggle-track" }, [
    toggleThumb,
    toggleInput
  ]);
  const autoToggle = el("label", { className: "dual-auto-toggle" }, [
    el("span", { className: "dual-auto-toggle-label" }, [t("autoRetranslate")]),
    toggleTrack
  ]);
  const header = el("div", { className: "dual-header" }, [
    headerLeft,
    autoToggle
  ]);
  const textarea = el("textarea", {
    placeholder: t("placeholder", { lang: getLangName(revSl) })
  });
  const inputTtsRow = el("div", {
    className: "dual-tts-row",
    "data-side": "input"
  });
  const inputArea = el("div", { className: "dual-input-area" }, [
    textarea,
    inputTtsRow
  ]);
  const resultDiv = el("div", { className: "result-text placeholder" }, [
    t("resultPlaceholder")
  ]);
  const outputTtsRow = el("div", {
    className: "dual-tts-row",
    "data-side": "output"
  });
  const outputArea = el("div", { className: "dual-output-area" }, [
    resultDiv,
    outputTtsRow
  ]);
  const body = el("div", { className: "dual-body" }, [inputArea, outputArea]);
  panel.appendChild(header);
  panel.appendChild(body);
  const inputTtsBtn = createTtsButton(revSl, () => textarea.value);
  const outputTtsBtn = createTtsButton(revTl, () => {
    const text = resultDiv.textContent ?? "";
    return resultDiv.classList.contains("placeholder") ? "" : text;
  });
  const copyBtn = createCopyButton(() => {
    const text = resultDiv.textContent ?? "";
    return resultDiv.classList.contains("placeholder") ? "" : text;
  });
  inputTtsRow.appendChild(inputTtsBtn);
  outputTtsRow.appendChild(outputTtsBtn);
  outputTtsRow.appendChild(copyBtn);
  let debounceTimer;
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
  let autoObserver = null;
  function getOriginalResultText() {
    const spans = document.querySelectorAll(SELECTORS.originalOutputSpans);
    return Array.from(spans).map((s) => s.textContent ?? "").join("");
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
    if (!outputContainer)
      return;
    autoObserver = new MutationObserver(() => feedOriginalResult());
    autoObserver.observe(outputContainer, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
  function stopAutoWatch() {
    if (autoObserver) {
      autoObserver.disconnect();
      autoObserver = null;
    }
  }
  function setAutoMode(on) {
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
  if (localStorage.getItem(STORAGE_KEY) === "1") {
    setAutoMode(true);
  }
  return panel;
}

// src/content.ts
function findInsertionPoint() {
  if (!document.querySelector(SELECTORS.originalTextarea))
    return null;
  return document.querySelector(SELECTORS.insertionPoint);
}
var currentSl = "";
var currentTl = "";
async function inject() {
  const params = getParams();
  if (!params)
    return;
  const existing = document.getElementById(PANEL_ID);
  if (existing && params.sl === currentSl && params.tl === currentTl)
    return;
  if (existing)
    existing.remove();
  const container = findInsertionPoint();
  if (!container)
    return;
  await whenReady();
  currentSl = params.sl;
  currentTl = params.tl;
  const panel = createPanel(params.sl, params.tl);
  container.parentElement?.insertBefore(panel, container.nextSibling);
}
function watchChanges() {
  let lastSl = currentSl;
  let lastTl = currentTl;
  setInterval(() => {
    const params = getParams();
    if (!params)
      return;
    if (params.sl !== lastSl || params.tl !== lastTl) {
      lastSl = params.sl;
      lastTl = params.tl;
      inject();
    }
  }, 500);
  let checkTimer = null;
  const observer = new MutationObserver(() => {
    if (document.getElementById(PANEL_ID))
      return;
    if (checkTimer)
      return;
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
