# 🚀 Golfys クイックスタートガイド

このガイドに従ってGolfysをセットアップして起動してください。

## ✅ 初回セットアップ

### ステップ 1: バックエンドの準備（推奨：高速インストール）

```bash
# Golf_Analyticsフォルダに移動
cd /root/Data/takiya21/Golf_Analytics

# バックエンド フォルダに移動
cd backend

# 📌 【推奨】高速インストール（インストール時間 10秒）
npm install --no-optional --legacy-peer-deps

# または通常インストール
# npm install
```

**インストール時間の目安:**
- 高速インストール: **10秒** ⚡
- 通常インストール: 3-5分

### ステップ 2: フロントエンドの準備

```bash
# Golf_Analyticsフォルダに戻る
cd ..

# フロントエンド フォルダに移動
cd frontend

# 依存パッケージをインストール
npm install
```

## 🎬 起動手順

### ターミナル 1: バックエンドサーバー起動

```bash
cd /root/Data/takiya21/Golf_Analytics/backend
npm run dev
```

出力例：
```
> golfys-backend@1.0.0 dev
> nodemon server.js

[nodemon] 2.0.22
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] starting `node server.js`
Database initialized successfully
🏌️ Golf Analytics Backend running on http://localhost:5000
Connected to SQLite database
```

**起動時間: ~500ms**

### ターミナル 2: フロントエンド開発サーバー起動

```bash
cd /root/Data/takiya21/Golf_Analytics/frontend
npm run dev
```

出力例：
```
  VITE v4.5.14  ready in 296 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

**起動時間: ~300ms**

## 🌐 アクセス

ブラウザで以下のURLを開いてください：

| URL | 説明 |
|-----|------|
| http://localhost:3000 | フロントエンド（メインアプリ） |
| http://localhost:5000/health | バックエンドの状態確認 |

## 📸 使用開始

### 最初のスコア登録

1. ホームページから「📸 画像からスコアを登録」をクリック
2. スコアカード画像をアップロード
3. OCRで抽出されたデータを確認・修正
4. 「この内容で登録する」で確定

### コース分析

1. ホームページから「🏌️ コースを選択して分析」をクリック
2. 登録済みコース（lake-hamamatsu）を選択
3. ホール画像をクリックして詳細分析を確認

## 🧪 テスト用サンプルコース

プロジェクトには **lake-hamamatsu** コースのホール画像が含まれています：
- ✅ 18ホール完備
- ✅ 各ホールのPar、Yardage情報付き

## 🛑 停止方法

- **バックエンド**: `Ctrl + C`
- **フロントエンド**: `Ctrl + C`

## ⚡ パフォーマンス情報

| 項目 | 時間 |
|-----|------|
| npm install (高速) | 10秒 |
| npm install (通常) | 3-5分 |
| バックエンド起動 | 500ms |
| フロントエンド起動 | 300ms |
| **合計起動時間** | **約800ms** |

詳細は [PERFORMANCE.md](PERFORMANCE.md) と [OPTIMIZATION_REPORT.md](OPTIMIZATION_REPORT.md) を参照してください。


## 📝 よく使うコマンド

### バックエンド
```bash
cd backend

npm run dev      # 開発モード（自動リロード）
npm start        # 本番環境
npm test         # テスト実行
```

### フロントエンド
```bash
cd frontend

npm run dev      # 開発サーバー起動
npm run build    # ビルド（本番用）
npm run preview  # ビルド結果のプレビュー
```

## 🔧 トラブルシューティング

### ポート 5000 が既に使用されている場合

```bash
# 別のポートを使用
cd backend
PORT=5001 npm run dev
```

### ポート 3000 が既に使用されている場合

フロントエンドの `vite.config.js` を編集：
```javascript
server: {
  port: 3001,  // 別のポートに変更
  // ...
}
```

### npm install エラー

```bash
# キャッシュをクリア
npm cache clean --force

# node_modules を削除してリインストール
rm -rf node_modules package-lock.json
npm install
```

### データベースエラー

```bash
# データベースファイルを削除してリセット
rm -rf backend/data/golf.db

# バックエンドを再起動（自動で再作成）
```

## 📊 データベース確認

SQLiteデータベースの確認：

```bash
# SQLiteをインストール
apt-get install sqlite3

# database を確認
sqlite3 backend/data/golf.db

# テーブル一覧を表示
.tables

# テーブルの内容を確認
SELECT * FROM courses;
SELECT * FROM rounds;

# SQLiteを終了
.exit
```

## 🌍 本番環境への配置

### フロントエンドのビルド

```bash
cd frontend
npm run build

# dist フォルダが生成されます
# これをWebサーバー（Nginx, Apache等）で公開
```

### バックエンドの起動（本番環境）

```bash
cd backend
NODE_ENV=production npm start
```

## 📚 主なファイル説明

| ファイル | 説明 |
|---------|------|
| `/backend/server.js` | バックエンドのエントリーポイント |
| `/backend/database/db.js` | SQLiteデータベース設定 |
| `/backend/utils/ocr.js` | OCR処理のメインロジック |
| `/frontend/src/App.jsx` | Reactメインコンポーネント |
| `/frontend/src/pages/Dashboard.jsx` | ホームページ |
| `/hole_img/` | ホール画像ディレクトリ |

## ✨ カスタマイズ例

### 新しいコースを追加

1. `hole_img/` に新しいコース名のフォルダを作成
2. 18個のホール画像（webp形式）を配置
   - ファイル名形式: `Hole{1-18}_par{N}_{yardage}yard.webp`
3. アプリから画像をアップロード時に自動認識

### OCR精度改善

`backend/utils/ocr.js` の `parseScoreCardText()` 関数をカスタマイズ

## 📞 サポート

問題が発生した場合は：

1. README.md を確認
2. バックエンドサーバーのログを確認
3. ブラウザの開発者ツール（F12）で確認

---

**Happy Golfing! ⛳**
