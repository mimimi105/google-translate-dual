import { SpeakerIcon, StopIcon } from "./icons.ts";

export function createTtsButton(
  lang: string,
  getText: () => string
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.className = "dual-tts-btn";
  btn.innerHTML = SpeakerIcon;
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
    btn.innerHTML = SpeakerIcon;
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
    btn.innerHTML = StopIcon;
    btn.title = "停止";

    audio.play().catch(() => stop());
    audio.addEventListener("ended", stop);
    audio.addEventListener("error", stop);
  });

  return btn;
}
