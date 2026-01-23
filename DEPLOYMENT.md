# GitHub Pages へのデプロイ手順

Golf Analytics は GitHub Pages で `https://takiya21.github.io/Golf_Analytics/` として公開されます。

## 📋 リポジトリ構成

```
takiya21/Golf_Analytics           ← このリポジトリ
  ├── frontend/                   ← ソースコード
  │   └── dist/                   ← ビルド結果（一時）
  ├── dist/                        ← デプロイされるファイル
  │   ├── index.html
  │   └── assets/
  └── deploy.sh                   ← デプロイスクリプト
         ↓
GitHub Pages
         ↓
https://takiya21.github.io/Golf_Analytics/
```

## 🚀 デプロイ方法

### クイックデプロイ（推奨）

```bash

./deploy.sh
```

このスクリプトが以下を自動実行します：
1. ✓ フロントエンドをビルド
2. ✓ ビルドファイルを Golf_Analytics/ 直下にコピー
3. ✓ Git にコミット＆プッシュ

### 手動デプロイ

```bash
# 1. ビルド
cd /root/Data/takiya21/Golf_Analytics/frontend
npm run build

# 2. ファイルをコピー
rm -rf /root/Data/takiya21/Golf_Analytics/dist
cp -r frontend/dist /root/Data/takiya21/Golf_Analytics/

# 3. Git プッシュ
cd /root/Data/takiya21/Golf_Analytics
git add dist/
git commit -m "Deploy Golf Analytics"
git push origin main
```

## ✅ デプロイ確認

数分待ってから以下のURLにアクセス：

```
https://takiya21.github.io/Golf_Analytics/
```

## 📅 更新時の手順

アプリを更新する度に実行：

```bash
/root/Data/takiya21/Golf_Analytics/deploy.sh
```

## 📁 ファイル構造

デプロイ後、以下の構造になります：

```
Golf_Analytics/
├── dist/
│   ├── index.html              ← ルートファイル
│   ├── assets/
│   │   ├── index-*.js
│   │   ├── index-*.css
│   │   ├── router-*.js
│   │   └── vendor-*.js
│   └── （その他のビルド出力）
├── frontend/                   ← ソースコード
├── .git/
├── README.md
└── deploy.sh
```

---

**Happy Golfing! ⛳**
