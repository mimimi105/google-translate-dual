export async function translate(
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
