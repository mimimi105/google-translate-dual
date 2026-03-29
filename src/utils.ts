export function getLangName(code: string): string {
  const pageLang = document.documentElement.lang || navigator.language || "en";
  try {
    const dn = new Intl.DisplayNames([pageLang], { type: "language" });
    return dn.of(code) ?? code;
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
