# スクリーンショット作成ガイド

Chrome Web Store 推奨:
- サイズ: **1280 x 800** または **640 x 400**
- 形式: PNG / JPEG
- 枚数: 最低1枚、推奨3〜5枚

---

## 推奨構成（5枚）

### 1. メインUI（必須）
- 内容: ポップアップ全体（置換前/置換後、最近使ったルール、対象、ボタン）
- キャプション案:
  - JA: `シンプルなUIで、置換前/置換後を入力してすぐ実行`
  - EN: `Simple UI: enter before/after text and run instantly`

### 2. 件数確認
- 内容: 「件数確認」実行後のステータス表示
- 例: `件数確認: 5件中 3件（合計7箇所）`
- キャプション案:
  - JA: `実行前に件数を確認できる`
  - EN: `Preview replacement count before running`

### 3. 全部置換の結果
- 内容: フォームページ + 置換後の入力欄
- キャプション案:
  - JA: `ページ内のテキストボックスを一括置換`
  - EN: `Replace text across fields on the page`

### 4. 最近使ったルール
- 内容: 履歴プルダウンを開いた状態
- キャプション案:
  - JA: `直近3件のルールをすぐ再利用`
  - EN: `Reuse your 3 most recent rules`

### 5. ショートカット
- 内容: `chrome://extensions/shortcuts` で Alt+Shift+R を表示
- キャプション案:
  - JA: `Alt+Shift+R で前回設定を即実行`
  - EN: `Run last settings with Alt+Shift+R`

---

## 撮影手順（実機）

1. 通常のWebページ（Googleフォームや社内フォーム）を開く
2. テキストボックスにサンプル文言を入力
   - 置換前: `よろしくお願いします`
   - 置換後: `よろしくお願いいたします`
3. 拡張アイコン → ポップアップ表示
4. macOS: `Cmd+Shift+4` で領域キャプチャ
5. 必要なら Figma/Canva で 1280x800 キャンバスに配置

---

## テンプレートHTML

`store/screenshot-template.html` をブラウザで開き、
ウィンドウサイズを 1280x800 にしてキャプチャしてもOKです。
