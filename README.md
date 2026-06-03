# Re:Chrome Text (Chrome Extension)

テキストボックス（`input` / `textarea`）の文字列を、シンプルなUIでまとめて置換する Chrome 拡張機能です。

## 使い方

1. `chrome://extensions` を開く
2. 右上の「デベロッパーモード」を ON
3. 「パッケージ化されていない拡張機能を読み込む」からこのフォルダを選択
4. 拡張機能アイコンをクリック
5. ポップアップの「置換前」「置換後」を入力
6. 必要に応じて「対象」「大文字小文字無視」を設定
7. `件数確認` / `1個ずつ置換` / `全部置換` を実行

## 動作仕様

- `1個ずつ置換`: 各テキストボックスで最初の1箇所のみ置換
- `全部置換`: 各テキストボックスで一致する全箇所を置換
- `件数確認`: 実際に置換する前に件数を表示
- 対象: `input`（text/search/email/url/tel）と `textarea`
- 対象選択: このページ全体 / 選択中テキストボックス
- 大文字小文字無視オプションあり
- 直近ルールを3件保存して再利用
- ショートカット `Alt+Shift+R` で、前回設定の「全部置換」を実行
- `chrome://` などのブラウザ内部ページでは実行不可
- 置換前文字列は必須

## Chrome Web Store 向け改修（v1.1.0）

- 権限を `activeTab` ベースに最小化（`<all_urls>` / 常時 content script を廃止）
- ユーザー操作時のみ `scripting` で注入して置換実行
- `_locales` による i18n 対応（ja/en）
- `privacy.html` を追加（ストア審査用）
- ショートカットを `Alt+Shift+R` に変更（ブラウザ既定ショートカットとの競合回避）

## パッケージ化

```bash
zip -r ReChromeText-v1.1.0.zip . -x ".git/*" "*.zip" "*.DS_Store" "store/*"
```

## GitHub Pages（プライバシーポリシー）

- URL: `https://kenhirano-spec.github.io/Re-Chrome/privacy.html`
- 手順: `store/PAGES.md`

## Chrome Web Store 提出資料

- 掲載文（日本語）: `store/ja.md`
- 掲載文（英語）: `store/en.md`
- スクリーンショットガイド: `store/SCREENSHOTS.md`
- 撮影テンプレート: `store/screenshot-template.html`
- 提出手順: `store/SUBMISSION.md`
