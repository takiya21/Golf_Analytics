# ⛳ Golfys - ゴルフスコア管理・分析アプリ

視覚的なコース攻略とデータ分析を融合させたゴルフスコア管理ツール。スコアカード画像から自動的に情報を抽出し、ホールごとのレイアウト画像と同期させることで、精度の高い振り返りを実現します。

## 🎯 主な機能

### 1. **メインページ（総合ダッシュボード）**
- 総合推移グラフ：全ラウンドのスコア・パット数を時系列表示
- 基本統計サマリー：平均スコア、平均パット数、FWキープ率など
- クイックアクション：画像からのスコア登録とコース分析へのアクセス

### 2. **データ確認・承認画面**
- スコアカード画像の自動OCR解析
- 自動抽出結果の表示とセル単位での修正
- 承認ボタンで正式な履歴データとして保存

### 3. **コース選択ページ**
- コース別タブ切り替え
- 18ホール・グリッド表示（webp画像一覧）
- 各ホールの平均スコア・パット数表示
- ホール詳細ページへの遷移

### 4. **スコア分析ページ**
- ホール詳細画像の大表示
- 履歴管理テーブル（日付、スコア、パット数）
- 個別ホール分析グラフ
- ホール間ナビゲーション

## 📊 抽出データ項目

OCRで自動抽出される情報：
- コース名
- プレー日
- ホール番号
- スコア・パット数
- 1打目クラブ
- FWキープ
- パーオン・ボギーオン
- OB数・バンカー数・ペナルティ数

## 🏗️ プロジェクト構成

```
Golf_Analytics/
├── backend/                 # Node.js/Express API
│   ├── server.js
│   ├── package.json
│   ├── database/           # SQLite3
│   │   └── db.js
│   ├── routes/             # APIルート
│   │   ├── courses.js
│   │   ├── rounds.js
│   │   ├── holes.js
│   │   ├── ocr.js
│   │   └── stats.js
│   ├── controllers/        # ビジネスロジック
│   │   ├── coursesController.js
│   │   ├── roundsController.js
│   │   ├── holesController.js
│   │   ├── ocrController.js
│   │   └── statsController.js
│   └── utils/
│       └── ocr.js         # Tesseract.js OCR処理
├── frontend/               # React フロントエンド
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Upload.jsx
│   │   │   ├── Review.jsx
│   │   │   ├── CourseSelect.jsx
│   │   │   └── HoleDetail.jsx
│   │   ├── components/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   │   └── index.html
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
- Python 3.7+ (Tesseract.jsの依存関係)

### バックエンドセットアップ

```bash
cd Golf_Analytics/backend

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# 本番環境での起動
npm start
```

バックエンドは `http://localhost:5000` で起動します。

### フロントエンドセットアップ

```bash
cd Golf_Analytics/frontend

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build
```

フロントエンドは `http://localhost:3000` で起動します。

## 📝 使用方法

### 1. スコア登録フロー
1. メインページの「📸 画像からスコアを登録」ボタンをクリック
2. スコアカード画像をアップロード
3. OCRで自動抽出された内容を確認・編集
4. 「この内容で登録する」ボタンで確定

### 2. コース分析フロー
1. メインページの「🏌️ コースを選択して分析」をクリック
2. コースをタブから選択
3. ホール画像をクリックして詳細分析ページへ
4. スコア推移、統計情報を確認

### 3. ホール詳細分析
- 各ホールのプレー履歴を表示
- 平均スコア、パット数などの統計値
- スコア分布（イーグル、バーディ、パーなど）

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

## 🎨 デザイン

- **カラースキーム**: グラデーション（紫・ピンク系）
- **レスポンシブ**: モバイル対応完全実装
- **UI/UX**: 直感的で使いやすいデザイン

## 📦  依存パッケージ

### バックエンド
- `express` - Webフレームワーク
- `sqlite3` - データベース
- `tesseract.js` - OCR処理
- `sharp` - 画像処理
- `multer` - ファイルアップロード処理
- `cors` - CORS対応

### フロントエンド
- `react` - UIフレームワーク
- `react-router-dom` - ルーティング
- `axios` - HTTP クライアント
- `vite` - ビルドツール
- `chart.js` - グラフ表示（拡張可能）

## 🔒 セキュリティ

- CORS有効化
- 入力データ検証
- SQLインジェクション対策（Prepared Statements）
- ファイルアップロード制限

## 📈 今後の拡張機能

- [ ] 複数コースの自動登録
- [ ] AIを使った改善点の提案
- [ ] プレーヤー間の比較分析
- [ ] ラウンド履歴のエクスポート（PDF, Excel）
- [ ] リアルタイムスコアトラッキング
- [ ] ハンディキャップ管理
- [ ] SNSシェア機能

## 📞 トラブルシューティング

### OCR認識精度が低い場合
- 画像の品質を改善（照度、角度）
- 画像前処理パラメータを調整

### データベースエラー
- `backend/data/` ディレクトリの確認
- SQLiteのバージョン確認

### ポート競合エラー
```bash
# ポート変更
PORT=5001 npm run dev   # バックエンド
```

## 📄 ライセンス

MIT License

## 🤝 貢献

バグ報告や機能リクエストはIssueで受け付けます。

---

**作成日**: 2025年1月21日
**バージョン**: 1.0.0
