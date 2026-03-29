import { UI_STRINGS, type UIStringKey } from "./constants.ts";
import { translate } from "./translate.ts";

let translated: Record<UIStringKey, string> = { ...UI_STRINGS };
let ready = false;
const waiters: Array<() => void> = [];

function detectLang(): string {
  return document.documentElement.lang || "en";
}

export async function initI18n(): Promise<void> {
  const lang = detectLang();

  // English base — no translation needed
  if (lang.startsWith("en")) {
    ready = true;
    return;
  }

  // Combine all strings into one text separated by newlines for a single API call
  const keys = Object.keys(UI_STRINGS) as UIStringKey[];
  const joined = keys.map((k) => UI_STRINGS[k]).join("\n");

  try {
    const result = await translate(joined, "en", lang);
    const lines = result.split("\n");
    for (let i = 0; i < keys.length; i++) {
      if (lines[i]) {
        translated[keys[i]!] = lines[i]!;
      }
    }
  } catch {
    // Fallback to English on error
  }

  ready = true;
  for (const fn of waiters) fn();
  waiters.length = 0;
}

export function whenReady(): Promise<void> {
  if (ready) return Promise.resolve();
  return new Promise((resolve) => waiters.push(resolve));
}

export function t(key: UIStringKey, vars?: Record<string, string>): string {
  let msg = translated[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      msg = msg.replace(`{${k}}`, v);
    }
  }
  return msg;
}
