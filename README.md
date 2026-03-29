# Google Translate Dual Direction
Google 翻訳に**逆方向の翻訳パネル**を追加する拡張機能です。
例えば「日本語 → 英語」で翻訳しているとき、その下に「英語 → 日本語」のパネルが自動で表示されます。言語の切り替え不要で、両方向の翻訳を1つの画面で確認できます。

また、`自動再翻訳`を有効化することにより、翻訳した内容を自動的に再度翻訳にかけることができます。

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue) ![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Userscript-green)


## インストール

### Chrome 拡張機能
準備中...

### Tampermonkey (Userscript)

1. [Tampermonkey](https://www.tampermonkey.net/) をブラウザにインストール
2. [google-translate-dual.user.js](https://github.com/mimimi105/google-translate-dual/releases/latest/download/google-translate-dual.user.js) をクリックしてインストール

## 使い方

1. [Google 翻訳](https://translate.google.com/) を開く
2. 通常通り翻訳すると、下に逆方向の翻訳パネルが表示されます
3. 逆パネルに直接テキストを入力して翻訳することもできます
4. **「自動再翻訳」をON** にすると、本体の翻訳結果が自動で逆方向に再翻訳されます

## ビルド

```bash
bun install
bun run build
```

`dist/` に Chrome 拡張機能と Tampermonkey 用 userscript が出力されます。

## ライセンス

MIT
