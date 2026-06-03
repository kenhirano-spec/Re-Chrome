# Chrome Web Store 提出手順

## 1. 事前準備

- [ ] 開発者アカウント登録（初回 $5）
- [ ] プライバシーポリシーURLを設定  
      `https://kenhirano-spec.github.io/Re-Chrome/privacy.html`
- [ ] 掲載文を用意（`store/ja.md`, `store/en.md`）
- [ ] スクリーンショット作成（`store/SCREENSHOTS.md`）

## 2. ZIP作成

```bash
cd "/Users/hiranoken/Library/CloudStorage/GoogleDrive-ken.hirano@jamming-group.com/マイドライブ/システム開発/Re-Chrome"

zip -r ReChromeText-v1.1.0.zip . \
  -x ".git/*" "*.zip" "*.DS_Store" "store/*"
```

## 3. ダッシュボード入力

1. [Chrome デベロッパーダッシュボード](https://chrome.google.com/webstore/devconsole) を開く
2. 「新しいアイテム」→ ZIPをアップロード
3. ストア掲載情報を入力
   - 名前: `Re:Chrome Text`
   - 短い説明: `store/ja.md` からコピー
   - 詳細説明: `store/ja.md` からコピー
   - カテゴリ: 生産性向上
   - 言語: 日本語（必要なら英語追加）
4. プライバシー
   - 単一用途: `store/ja.md` の文言
   - プライバシーポリシーURL: 公開した `privacy.html` のURL
   - データ使用: 収集しない
5. 権限の理由（審査で聞かれた場合）
   - `activeTab`: ユーザー操作時のみ表示中ページへアクセス
   - `scripting`: 置換処理実行
   - `storage`: 直近ルールと設定保存
6. 画像
   - アイコン: `icons/icon128.png`
   - スクリーンショット: 1280x800 を1枚以上
7. 公開範囲を選択
   - 一般公開 / 限定公開（URL共有）

## 4. 審査後

- 公開URLをユーザーへ共有
- 例: `https://chromewebstore.google.com/detail/<拡張機能ID>`

## 5. 更新時

1. `manifest.json` の `version` を上げる
2. ZIP再作成
3. ダッシュボードから新パッケージをアップロード
