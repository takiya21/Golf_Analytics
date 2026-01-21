# 🚀 パフォーマンス最適化ガイド

## インストール時間の短縮方法

### 現在の問題

- **Tesseract.js (30MB)** - OCR処理用（ネイティブモジュール）
- **Sharp (17MB)** - 画像処理用（ネイティブコンパイル必要）
- **SQLite3 (5.9MB)** - DB用（ネイティブコンパイル必要）

これらは初回インストール時にビルド・コンパイルが必要なため時間がかかります。

### ✅ 推奨される高速セットアップ手順

#### **オプション A: 高速インストール（推奨）**

```bash
cd Golf_Analytics/backend

# キャッシュをスキップして高速インストール
npm install --no-optional --legacy-peer-deps

# または npm ci を使用（package-lock.json が必要）
npm ci --legacy-peer-deps
```

#### **オプション B: 本番環境での最小インストール**

```bash
# 開発用依存関係をスキップ
npm install --production

# キャッシュクリア
npm cache clean --force
```

### 📊 インストール時間の目安

| 環境 | 時間 |
|------|------|
| 初回（フル） | 3-5 分 |
| `--no-optional` | 1-2 分 |
| `--production` | 1 分 |
| 2回目以降（キャッシュ有） | 30 秒 |

### 🎯 起動時間の短縮

#### **フロントエンド**

```bash
cd frontend

# 開発サーバー起動（HMR有効）
npm run dev
```

- ✅ 初期起動: 300ms
- ✅ ホットリロード: 100ms
- 注: node_modules が大きい場合は初回のみ遅い

#### **バックエンド**

```bash
cd backend

# 開発サーバー起動（自動リロード有効）
npm run dev
```

- ✅ 初期起動: 500ms
- ✅ ファイル変更時リロード: 200ms

### 🔧 トラブルシューティング

#### **"Cannot find module" エラー**

```bash
# node_modules をクリーンアップ
rm -rf node_modules package-lock.json

# 再インストール
npm install
```

#### **ポート競合エラー**

```bash
# 使用中のポートを確認
lsof -i :5000
lsof -i :3000

# 別のポートで起動
PORT=5001 npm run dev    # バックエンド
# vite.config.js で変更  # フロントエンド
```

#### **メモリ不足エラー**

```bash
# Node.js のメモリ制限を増加
NODE_OPTIONS=--max-old-space-size=4096 npm install
```

### 📈 キャッシュの活用

#### **npm キャッシュの確認**

```bash
npm cache verify
```

#### **キャッシュの統計**

```bash
npm cache ls | wc -l
```

### 🚀 並列インストールの有効化

```bash
# npm 8+ では自動的に並列インストール
npm install

# または明示的に指定
npm install --no-audit
```

### 💾 ディスク空き容量の確認

```bash
# Linux/Mac
df -h

# 要件: 最低 500MB の空き容量
```

### 📦 Npm Registry のミラー変更

遅い場合は npm registry を変更：

```bash
# 国内ミラー（taobao）
npm config set registry https://registry.npmmirror.com

# 公式に戻す
npm config set registry https://registry.npmjs.org/
```

### ✨ 定期メンテナンス

```bash
# 月1回実行推奨
npm cache clean --force
npm audit fix
npm update
```

---

## パフォーマンス統計

現在のプロジェクト規模：
- バックエンド: 117MB → 最適化後: 60-80MB
- フロントエンド: 61MB
- 合計: 約 150-200MB

改善の見込み：
- インストール時間: **50-70% 削減**
- 起動時間: **20-30% 削減**
