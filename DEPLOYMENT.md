# GitHub Pages へのデプロイ手順

Golf Analytics は以下の構成でデプロイされます：

## 📋 リポジトリ構成

```
takiya21/Golf_Analytics          ← このリポジトリ（開発用）
  ├── frontend/src/              ← ソースコード
  ├── frontend/dist/             ← ビルド済みファイル
  └── deploy.sh                  ← デプロイスクリプト
         ↓ デプロイ ↓
takiya21/takiya21.github.io      ← GitHub Pages リポジトリ
  └── Golf_Analytics/            ← アプリが公開される
         ↓
https://takiya21.github.io/Golf_Analytics/
```

**重要**: 別のデプロイ用リポジトリは不要です。開発リポジトリから直接デプロイします。

## 🚀 初回セットアップ

### 1. takiya21.github.io リポジトリをクローン

```bash
git clone https://github.com/takiya21/takiya21.github.io.git ~/takiya21-github-io
```

### 2. デプロイ準備完了

これで準備完了です。あとはデプロイスクリプトを実行するだけです。

## 📤 デプロイ方法

### クイックデプロイ（推奨）

```bash
cd /root/Data/takiya21/Golf_Analytics
./deploy.sh
```

このスクリプトが以下を自動実行します：
1. ✓ フロントエンドをビルド
2. ✓ ビルドファイルを takiya21.github.io にコピー
3. ✓ Git にコミット＆プッシュ
4. ✓ デプロイ完了

### 手動デプロイ

```bash
# 1. ビルド
cd /root/Data/takiya21/Golf_Analytics/frontend
npm run build

# 2. ファイルをコピー
cp -r dist/* ~/takiya21-github-io/Golf_Analytics/

# 3. Git プッシュ
cd ~/takiya21-github-io
git add Golf_Analytics/
git commit -m "Update Golf Analytics"
git push origin main
```

## ✅ デプロイ確認

数分待ってから以下のURLにアクセス：

```
https://takiya21.github.io/Golf_Analytics/
```

## 📅 更新時の手順

アプリを更新する度に以下を実行：

```bash
# 1. ソースコードを修正
# （/root/Data/takiya21/Golf_Analytics/frontend にて）

# 2. デプロイ実行
/root/Data/takiya21/Golf_Analytics/deploy.sh

# 完了！
```

## 🔧 トラブルシューティング

### takiya21.github.io が見つからない

```bash
# クローン
git clone https://github.com/takiya21/takiya21.github.io.git ~/takiya21-github-io

# または別のパスを指定
/root/Data/takiya21/Golf_Analytics/deploy.sh /path/to/takiya21.github.io
```

### ページが表示されない

1. **キャッシュをクリア** (Ctrl+Shift+Delete)
2. **GitHub リポジトリを確認**
   - `Golf_Analytics/` フォルダが存在するか
   - `index.html` が存在するか
3. **数分待つ** - GitHub Pages の反映に時間がかかることがあります

### ルーティングが機能しない

`takiya21.github.io` リポジトリのルートに `_config.yml` がある場合：

```yaml
include:
  - Golf_Analytics
```

を追加してください。

## 📊 デプロイフロー図

```
Golf_Analytics (開発用)
    ↓
    npm run build
    ↓
frontend/dist/ (ビルド済みファイル)
    ↓
    deploy.sh (自動コピー)
    ↓
takiya21.github.io/Golf_Analytics/
    ↓
    git push origin main
    ↓
GitHub Pages
    ↓
https://takiya21.github.io/Golf_Analytics/ ✓
```

## 💡 ベストプラクティス

- **開発時**: `npm run dev` で localhost で確認
- **本番環境へ**: `./deploy.sh` でデプロイ
- **バージョン管理**: 開発用リポジトリ （Golf_Analytics） に全ソースコードを保管
- **本番公開**: GitHub Pages で公開

---

**Happy Golfing! ⛳**
