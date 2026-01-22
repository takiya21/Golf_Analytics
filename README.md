# ⛳ Golfys - ゴルフスコア管理・分析アプリ

ブラウザで動作するゴルフスコア管理ツール。スコアを手動入力し、デバイスに保存。ホールごとの分析でラウンドを振り返れます。

## 🎯 主な機能

### 1. **メインページ（総合ダッシュボード）**
- 総合推移グラフ：全ラウンドのスコア・パット数を時系列表示
- 基本統計サマリー：平均スコア、平均パット数など
- クイックアクション：スコア登録とコース分析へのアクセス

### 2. **スコア手動入力ページ**
- コース選択（lake-hamamatsu）
- プレー日の指定
- 18ホール分のスコア入力
- デバイスに自動保存

### 3. **コース選択ページ**
- 18ホール・グリッド表示（webp画像一覧）
- 各ホールの平均スコア・パット数表示
- ホール詳細ページへの遷移

### 4. **スコア分析ページ**
- ホール詳細画像の大表示
- 履歴管理テーブル（日付、スコア、パット数）
- 個別ホール分析グラフ
- ホール間ナビゲーション

## 📊 管理データ項目

手動入力で記録される情報：
- コース名
- プレー日
- ホール番号
- スコア・パット数
- 1打目クラブ
- FWキープ
- OB数・バンカー数・ペナルティ数

## 🏗️ プロジェクト構成

```
Golf_Analytics/
├── frontend/               # React フロントエンド
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # ダッシュボード
│   │   │   ├── Upload.jsx         # スコア入力メニュー
│   │   │   ├── ManualScore.jsx    # 手動入力フォーム
│   │   │   ├── CourseSelect.jsx   # コース選択
│   │   │   ├── HoleDetail.jsx     # ホール詳細
│   │   │   └── Rounds.jsx         # ラウンド一覧
│   │   ├── components/
│   │   ├── services/
│   │   │   ├── apiLocal.js        # IndexedDB API互換層
│   │   │   └── indexedDB.js       # IndexedDB操作
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── vite.config.js
│   └── package.json
└── hole_img/              # ホール画像（webp）
    └── lake-hamamatsu/    # コース名フォルダ
        ├── Hole1_par4_420yard.webp
        ├── Hole2_par4_306yard.webp
        └── ... (18 holes)
```

## 🚀 セットアップ手順

### 前提条件
- Node.js 16+
- npm または yarn
- モダンブラウザ（Chrome, Firefox, Safari など）

### フロントエンドセットアップ

```bash
# Golf_Analyticsフォルダに移動
cd /root/Data/takiya21/Golf_Analytics

# フロントエンド フォルダに移動
cd frontend

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド（本番用）
npm run build
```

フロントエンドは `http://localhost:3000` で起動します。

## 📝 使用方法

### 1. スコア登録フロー
1. メインページの「スコア登録」をクリック
2. 「スコアを手動入力」をクリック
3. コース（Lake Hamamatsu）とプレー日を選択
4. 18ホール分のスコアを入力
5. 「登録する」で確定（デバイスに保存）

### 2. コース分析フロー
1. メインページの「コース分析」をクリック
2. ホール画像をクリックして詳細分析ページへ
3. スコア推移、統計情報を確認

### 3. ホール詳細分析
- 各ホールのプレー履歴を表示
- 平均スコア、パット数などの統計値
- スコア分布を確認

## 🗄️ データベーススキーマ

### courses テーブル
| id | name | created_at |
|----|------|-----------|

### holes テーブル
| id | course_id | hole_number | par | yardage | created_at |
|----|-----------|-----------  |-----|---------|-----------|

### rounds テーブル
| id | course_id | play_date | status | created_at | updated_at |
|----|-----------|-----------|--------|-----------|-----------|

### round_scores テーブル
| id | round_id | hole_id | score | putts | first_club | fairway_kept | greens_on | bogey_on | ob_count | bunker_count | one_penalty | created_at |
|----|----------|---------|-------|-------|-----------|-------------|-----------|----------|----------|-------------|-----------|-----------|

### ocr_results テーブル
| id | round_id | raw_text | extracted_data | status | created_at |
|----|----------|----------|----------------|--------|-----------|

## 🔌 API エンドポイント

### コース管理
- `GET /api/courses` - すべてのコース取得
- `GET /api/courses/:courseId` - コース詳細取得
- `POST /api/courses` - コース作成
- `POST /api/courses/:courseId/holes` - ホール追加

### ラウンド管理
- `GET /api/rounds` - すべてのラウンド取得
- `GET /api/rounds/:roundId` - ラウンド詳細取得
- `POST /api/rounds` - ラウンド作成
- `PUT /api/rounds/:roundId` - ラウンド更新
- `POST /api/rounds/:roundId/approve` - ラウンド承認
- `DELETE /api/rounds/:roundId` - ラウンド削除

### OCR処理
- `POST /api/ocr/extract` - 画像からデータ抽出
- `GET /api/ocr/result/:resultId` - OCR結果取得
- `POST /api/ocr/confirm` - OCR確認・ラウンド作成

### 統計情報
- `GET /api/stats/overall` - 全体統計
- `GET /api/stats/course/:courseId` - コース別統計
- `GET /api/stats/hole/:holeId` - ホール別統計

## 💾 データ保存について

### IndexedDB
- **保存場所**: ブラウザのローカルストレージ
- **容量**: 数GB（ブラウザに依存）
- **永続性**: ブラウザのキャッシュ削除まで保持
- **特徴**: インターネット接続不要、オフライン対応

### 保存データ
- コース情報（lake-hamamatsu）
- ラウンド履歴（日付、スコア、詳細情報）
- ホール情報（パー、ヤーデージ）
- 統計情報（平均スコアなど）

## 🎨 デザイン

- **カラースキーム**: グラデーション（紫・ピンク系）
- **レスポンシブ**: モバイル対応完全実装
- **UI/UX**: 直感的で使いやすいデザイン

## 📦 依存パッケージ

### フロントエンド
- `react` - UIフレームワーク
- `react-router-dom` - ルーティング
- `vite` - ビルドツール

## 🔒 セキュリティと プライバシー

- **オフライン対応**: サーバー通信なし
- **データ保護**: すべてのデータをローカル保存
- **プライバシー重視**: ユーザーデータが外部に送信されない

## 📈 今後の拡張機能

- [ ] 複数コースの追加サポート
- [ ] ラウンド履歴のエクスポート（PDF, CSV）
- [ ] スコア分析の詳細化
- [ ] ハンディキャップ管理
- [ ] ユーザー設定のカスタマイズ
- [ ] データバックアップ機能

## 📞 トラブルシューティング

### データが表示されない場合
- ブラウザの開発者ツール（F12）でIndexedDBの状態を確認
- キャッシュをクリアして再度アクセス

### ページが表示されない場合
```bash
# フロントエンドを再起動
cd frontend
npm run dev
```

### npm install エラー

```bash
# キャッシュをクリア
npm cache clean --force

# node_modules を削除してリインストール
rm -rf node_modules package-lock.json
npm install
```

## 🔧 ホール画像の追加方法

新しいコースを追加する場合：

1. `hole_img/` に新しいコース名のフォルダを作成
2. 18個のホール画像（webp形式）を配置
   - ファイル名形式: `Hole{1-18}_par{N}_{yardage}yard.webp`
3. `frontend/src/services/apiLocal.js` の `initializeStorage()` 関数でコースを登録

## 📚 主なファイル説明

| ファイル | 説明 |
|---------|------|
| `/frontend/src/App.jsx` | Reactメインコンポーネント |
| `/frontend/src/pages/Dashboard.jsx` | ダッシュボード（ホームページ） |
| `/frontend/src/pages/ManualScore.jsx` | スコア手動入力フォーム |
| `/frontend/src/pages/CourseSelect.jsx` | コース選択・ホール表示 |
| `/frontend/src/pages/HoleDetail.jsx` | ホール詳細分析 |
| `/frontend/src/services/apiLocal.js` | IndexedDB互換API |
| `/frontend/src/services/indexedDB.js` | IndexedDB操作ライブラリ |
| `/hole_img/` | ホール画像ディレクトリ |

## 📄 ライセンス

MIT License

## 🤝 貢献

バグ報告や機能リクエストはIssueで受け付けます。

---

**作成日**: 2025年1月21日  
**バージョン**: 2.0.0（フロントエンドのみ版）  
**更新日**: 2026年1月22日
