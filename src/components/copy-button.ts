import { createCopyIcon } from "./icons.ts";

export function createCopyButton(
  getText: () => string
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.className = "dual-tts-btn dual-copy-btn";
  btn.appendChild(createCopyIcon());
  btn.title = "Copy";

  btn.addEventListener("click", () => {
    const text = getText();
    if (!text.trim()) return;
    navigator.clipboard.writeText(text);
  });

  return btn;
}
