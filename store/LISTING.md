# Chrome Web Store 掲載情報（索引）

提出用ドキュメント一覧:

| ファイル | 内容 |
|---|---|
| `store/ja.md` | 日本語の掲載文（コピペ用） |
| `store/en.md` | 英語の掲載文（コピペ用） |
| `store/SCREENSHOTS.md` | スクリーンショット撮影ガイド |
| `store/screenshot-template.html` | 1280x800 用の撮影テンプレート |
| `store/SUBMISSION.md` | 提出手順チェックリスト |
| `privacy.html` | プライバシーポリシー（公開URL化が必要） |

## ZIP作成

```bash
zip -r ReChromeText-v1.1.0.zip . \
  -x ".git/*" "*.zip" "*.DS_Store" "store/*"
```
