import { createSpeakerIcon, createStopIcon } from "./icons.ts";
import { t } from "../i18n.ts";

const TTS_MAX_LENGTH = 200;

function setIcon(btn: HTMLButtonElement, icon: SVGSVGElement) {
  while (btn.firstChild) btn.removeChild(btn.firstChild);
  btn.appendChild(icon);
}

function splitText(text: string): string[] {
  const chunks: string[] = [];
  // Split on sentence boundaries first, then by length
  const sentences = text.match(/[^.!?。！？\n]+[.!?。！？\n]?/g) ?? [text];

  let current = "";
  for (const sentence of sentences) {
    if (current.length + sentence.length > TTS_MAX_LENGTH && current) {
      chunks.push(current.trim());
      current = "";
    }
    if (sentence.length > TTS_MAX_LENGTH) {
      // Force split long sentences by words
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
  if (current.trim()) chunks.push(current.trim());
  return chunks;
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

  async function playChunks(chunks: string[]) {
    for (const chunk of chunks) {
      if (stopped) return;

      const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(chunk)}`;
      audio = new Audio(ttsUrl);

      try {
        await new Promise<void>((resolve, reject) => {
          audio!.addEventListener("ended", () => resolve());
          audio!.addEventListener("error", () => reject());
          audio!.play().catch(reject);
        });
      } catch {
        stop();
        return;
      }
    }
    // All chunks finished
    if (!stopped) stop();
  }

  btn.addEventListener("click", () => {
    if (playing) {
      stop();
      return;
    }

    const text = getText();
    if (!text.trim()) return;

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
