import { createSpeakerIcon, createStopIcon } from "./icons.ts";
import { t } from "../i18n.ts";

function setIcon(btn: HTMLButtonElement, icon: SVGSVGElement) {
  while (btn.firstChild) btn.removeChild(btn.firstChild);
  btn.appendChild(icon);
}

export function createTtsButton(
  lang: string,
  getText: () => string
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.className = "dual-tts-btn";
  setIcon(btn, createSpeakerIcon());
  btn.title = t("listen");
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
    setIcon(btn, createSpeakerIcon());
    btn.title = t("listen");
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
    setIcon(btn, createStopIcon());
    btn.title = t("stop");

    audio.play().catch(() => stop());
    audio.addEventListener("ended", stop);
    audio.addEventListener("error", stop);
  });

  return btn;
}
