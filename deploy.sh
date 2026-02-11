#!/bin/bash
# Golf Analytics をビルド＆デプロイするスクリプト
#
# ⚠️ GitHub Pages へのデプロイは GitHub Actions が自動で行います。
#    このスクリプトはローカル確認用です。
#
# 【GitHub Actions デプロイ手順】
#   1. GitHub リポジトリ Settings → Secrets and variables → Actions
#      → New repository secret で VITE_GOOGLE_MAPS_API_KEY を追加
#   2. Settings → Pages → Source を "GitHub Actions" に変更
#   3. main ブランチに push すると自動デプロイされます
#
# 【ローカル確認用】
#   このスクリプトを実行すると docs/ にビルドされます（gitignore済み）

set -e

# 色定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Golf Analytics ローカルビルド${NC}"
echo -e "${BLUE}================================${NC}"

PROJECT_ROOT="/root/Data/takiya21/Golf_Analytics"

# ステップ 1: ビルド
echo -e "\n${BLUE}[1/3] フロントエンドをビルド中...${NC}"
cd "$PROJECT_ROOT/frontend"
npm run build
echo -e "${GREEN}✓ ビルド完了${NC}"

# ステップ 2: ビルドファイルを docs フォルダにコピー
echo -e "\n${BLUE}[2/3] ビルドファイルをコピー中...${NC}"
rm -rf "$PROJECT_ROOT/docs"
mkdir -p "$PROJECT_ROOT/docs"
cp -r "$PROJECT_ROOT/frontend/dist"/* "$PROJECT_ROOT/docs/"
echo -e "${GREEN}✓ コピー完了${NC}"

# ステップ 3: 画像ファイルをコピー
echo -e "\n${BLUE}[3/3] 画像ファイルをコピー中...${NC}"
cp -r "$PROJECT_ROOT/hole_img" "$PROJECT_ROOT/docs/"
echo -e "${GREEN}✓ 画像コピー完了${NC}"
ls -la "$PROJECT_ROOT/docs/" | head -10
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✓ ローカルビルドが完了しました!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "\n${BLUE}ローカル確認:${NC} $PROJECT_ROOT/docs/"
echo -e "\n${RED}⚠️ docs/ は .gitignore 済みです。${NC}"
echo -e "${BLUE}デプロイは main ブランチに push すると GitHub Actions が自動実行します。${NC}"
echo -e "${GREEN}cd $PROJECT_ROOT && git add -A && git commit -m 'Update' && git push origin main${NC}\n"
