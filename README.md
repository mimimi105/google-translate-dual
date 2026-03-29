# Google Translate Dual Direction
![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue) ![Tampermonkey](https://img.shields.io/badge/Tampermonkey-Userscript-green)

Google 翻訳に**逆方向の翻訳パネル**を追加する拡張機能です。
例えば「日本語 → 英語」で翻訳しているとき、その下に「英語 → 日本語」のパネルが自動で表示されます。言語の切り替え不要で、両方向の翻訳を1つの画面で確認できます。

また、`自動再翻訳`を有効化することにより、翻訳した内容を自動的に再度翻訳にかけることができます。

<img style="display: inline-block;" width="400" height="260" alt="image" src="https://github.com/user-attachments/assets/6e15b123-afad-4616-8497-a2e1b3aafd65" />
<img style="display: inline-block;" width="400" height="260" alt="image" src="https://github.com/user-attachments/assets/8bcaff48-cb74-45fc-87dd-f556a49aef31" />


## インストール

### Chrome 拡張機能

1. [Releases](https://github.com/mimimi105/google-translate-dual/releases/latest) から `google-translate-dual-chrome.zip` をダウンロード
2. ZIP を解凍
3. Chrome で `chrome://extensions` を開く
4. 右上の「デベロッパー モード」を有効にする
5. 「パッケージ化されていない拡張機能を読み込む」をクリックし、解凍したフォルダを選択

### Tampermonkey / Greasy Fork (Userscript)

[![Greasy Fork](https://img.shields.io/greasyfork/v/571641)](https://greasyfork.org/ja/scripts/571641-google-translate-dual-direction)

1. [Greasy Fork のページ](https://greasyfork.org/ja/scripts/571641-google-translate-dual-direction) からインストール

または手動で:

1. [Tampermonkey](https://www.tampermonkey.net/) をブラウザにインストール
2. [google-translate-dual.user.js](https://www.tampermonkey.net/script_installation.php#url=https://github.com/mimimi105/google-translate-dual/raw/refs/heads/main/dist/google-translate-dual.user.js) をクリックしてインストール

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
