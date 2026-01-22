# 🚀 Golfys クイックスタートガイド

このガイドに従ってGolfysをセットアップして起動してください。

## ✅ 初回セットアップ

### ステップ 1: フロントエンドの準備

```bash
# Golf_Analyticsフォルダに移動
cd /root/Data/takiya21/Golf_Analytics

# フロントエンド フォルダに移動
cd frontend

# 依存パッケージをインストール
npm install
```

**インストール時間の目安:**
- 初回: **3-5分** ⚡
- キャッシュあり: **30秒以下**

## 🎬 起動手順

### ターミナル: フロントエンド開発サーバー起動

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
| http://localhost:3000 | Golfys（メインアプリ） |

## 📸 使用開始

### 最初のスコア登録

1. ホームページから「スコア登録」をクリック
2. 「スコアを手動入力」をクリック
3. コース（Lake Hamamatsu）とプレー日を選択
4. 18ホール分のスコアを入力
5. 「登録する」で確定（デバイスに保存）

### コース分析

1. ホームページから「コース分析」をクリック
2. ホール画像をクリックして詳細分析を確認
3. スコア推移と統計情報を確認

## 🧪 テスト用サンプルコース

プロジェクトには **lake-hamamatsu** コースのホール画像が含まれています：
- ✅ 18ホール完備
- ✅ 各ホールのPar、Yardage情報付き

## 🛑 停止方法

- **フロントエンド**: `Ctrl + C`

## ⚡ パフォーマンス情報

| 項目 | 時間 |
|-----|------|
| npm install（初回） | 3-5分 |
| npm install（2回目以降） | 30秒以下 |
| フロントエンド起動 | 300ms |
| **合計起動時間** | **～1分** |

## 📝 よく使うコマンド

### フロントエンド
```bash
cd frontend

npm run dev      # 開発サーバー起動
npm run build    # ビルド（本番用）
npm run preview  # ビルド結果のプレビュー
```

## 🔧 トラブルシューティング

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

### データが表示されない場合

```bash
# ブラウザのキャッシュをクリア
# F12 → Application → Clear site data

# または別のブラウザで試す
```

## 💾 データについて

### 保存場所
- すべてのスコアデータはブラウザのIndexedDBに保存されます
- インターネット接続は不要です（オフライン対応）
- データはデバイスに永続的に保存されます

### データをクリアしたい場合
```javascript
// ブラウザコンソール（F12）で実行
// IndexedDBから全データを削除
indexedDB.deleteDatabase('GolfysDB');
```

## 🌍 本番環境への配置

### フロントエンドのビルド

```bash
cd frontend
npm run build

# dist フォルダが生成されます
# これをWebサーバー（Nginx, Apache等）で公開
```

## 📚 主なファイル説明

| ファイル | 説明 |
|---------|------|
| `/frontend/src/App.jsx` | Reactメインコンポーネント |
| `/frontend/src/pages/Dashboard.jsx` | ホームページ |
| `/frontend/src/pages/ManualScore.jsx` | スコア手動入力 |
| `/frontend/src/pages/CourseSelect.jsx` | コース選択・分析 |
| `/frontend/src/pages/HoleDetail.jsx` | ホール詳細分析 |
| `/frontend/src/services/apiLocal.js` | IndexedDB操作API |
| `/hole_img/` | ホール画像ディレクトリ |

## ✨ カスタマイズ例

### 新しいコースを追加

1. `hole_img/` に新しいコース名のフォルダを作成
2. 18個のホール画像（webp形式）を配置
   - ファイル名形式: `Hole{1-18}_par{N}_{yardage}yard.webp`
3. `frontend/src/services/apiLocal.js` の `initializeStorage()` 関数に以下を追加：

```javascript
const newCourse = {
  id: 'course-id',
  name: 'Course Name',
  createdAt: new Date().toISOString()
};
await db.saveCourse(newCourse);

const holes = [
  { hole_number: 1, par: 4, yardage: 420 },
  // ... 18 holes
];
await db.saveHoles('course-id', holes);
```

## 📞 サポート

問題が発生した場合は：

1. README.md を確認
2. ブラウザの開発者ツール（F12）を確認
3. コンソールエラーをチェック

---

**Happy Golfing! ⛳**
