#!/bin/bash
# Golf Analytics をビルド＆デプロイするスクリプト

set -e

# 色定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Golf Analytics デプロイスクリプト${NC}"
echo -e "${BLUE}================================${NC}"

PROJECT_ROOT="/root/Data/takiya21/Golf_Analytics"

# ステップ 1: ビルド
echo -e "\n${BLUE}[1/3] フロントエンドをビルド中...${NC}"
cd "$PROJECT_ROOT/frontend"
npm run build
echo -e "${GREEN}✓ ビルド完了${NC}"

# ステップ 2: ビルドファイルを docs フォルダにコピー
echo -e "\n${BLUE}[2/3] ビルドファイルをコピー中...${NC}"
# 既存の docs フォルダを削除
rm -rf "$PROJECT_ROOT/docs"
# docs フォルダを作成して Golf_Analytics サブディレクトリを作成
mkdir -p "$PROJECT_ROOT/docs/Golf_Analytics"
# ビルドファイルをコピー
cp -r "$PROJECT_ROOT/frontend/dist"/* "$PROJECT_ROOT/docs/Golf_Analytics/"
echo -e "${GREEN}✓ コピー完了${NC}"
ls -la "$PROJECT_ROOT/docs/Golf_Analytics/" | head -10

# ステップ 3: Git にコミット＆プッシュ
echo -e "\n${BLUE}[3/3] GitHub にプッシュ中...${NC}"
cd "$PROJECT_ROOT"

# docs フォルダをステージング
git add docs/ .nojekyll
git commit -m "Deploy Golf Analytics to /docs - $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main
echo -e "${GREEN}✓ プッシュ完了${NC}"

# 完了
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✓ デプロイが完了しました!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "\n${BLUE}アクセス:${NC} ${GREEN}https://takiya21.github.io/Golf_Analytics/${NC}"
echo -e "${BLUE}※ キャッシュ反映に数分かかります${NC}\n"
