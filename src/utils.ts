const langDisplayNames = new Intl.DisplayNames(["ja"], { type: "language" });

export function getLangName(code: string): string {
  try {
    return langDisplayNames.of(code) ?? code;
  } catch {
    return code;
  }
}

export function getParams(): { sl: string; tl: string } | null {
  const url = new URL(location.href);
  const sl = url.searchParams.get("sl");
  const tl = url.searchParams.get("tl");
  if (!sl || !tl) return null;
  return { sl, tl };
}
