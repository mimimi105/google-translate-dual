export const PANEL_ID = "gt-dual-reverse-panel";
export const STORAGE_KEY = "gt-dual-auto-retranslate";
export const FONT_SMALL_THRESHOLD = 80;
export const TRANSLATE_DEBOUNCE_MS = 300;

// UI strings (English base — translated at runtime via Google Translate API)
export const UI_STRINGS = {
  listen: "Listen",
  stop: "Stop",
  placeholder: "Enter {lang} text...",
  resultPlaceholder: "Translation",
  error: "Translation error",
  autoRetranslate: "Auto re-translate",
} as const;

export type UIStringKey = keyof typeof UI_STRINGS;

// Google Translate DOM selectors
export const SELECTORS = {
  insertionPoint: ".OPPzxe",
  originalTextarea: "textarea.er8xn",
  originalOutput: ".usGWQd",
  originalOutputSpans: '.usGWQd span.ryNqvb[jsname="W297wb"]',
} as const;
