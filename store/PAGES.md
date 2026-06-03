# GitHub Pages 公開手順

## 公開URL（main 反映後）

- トップ: `https://kenhirano-spec.github.io/Re-Chrome/`
- プライバシーポリシー: `https://kenhirano-spec.github.io/Re-Chrome/privacy.html`

Chrome Web Store の「プライバシーポリシー」欄には **privacy.html のURL** を入力してください。

---

## 初回設定（リポジトリ管理者）

1. 変更を `main` ブランチへ push
2. GitHub リポジトリ → **Settings** → **Pages**
3. **Build and deployment**
   - Source: **GitHub Actions**
4. Actions の `Deploy GitHub Pages` が成功することを確認
5. 数分後に上記URLへアクセスして表示確認

---

## 更新方法

`docs/privacy.html` を編集して `main` へ push するだけで自動更新されます。
