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
echo -e "\n${BLUE}[2/2] ビルドファイルをコピー中...${NC}"
# 既存の docs フォルダを削除
rm -rf "$PROJECT_ROOT/docs"
# docs フォルダを作成
mkdir -p "$PROJECT_ROOT/docs"
# ビルドファイルを docs フォルダ直下にコピー
cp -r "$PROJECT_ROOT/frontend/dist"/* "$PROJECT_ROOT/docs/"
echo -e "${GREEN}✓ コピー完了${NC}"
ls -la "$PROJECT_ROOT/docs/" | head -10

# 完了
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✓ ビルドとコピーが完了しました!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "\n${BLUE}ファイル場所:${NC} $PROJECT_ROOT/docs/"
echo -e "${BLUE}URL:${NC} ${GREEN}https://takiya21.github.io/Golf_Analytics/${NC}"
echo -e "${BLUE}次は以下コマンドで手動で push してください:${NC}"
echo -e "${GREEN}cd $PROJECT_ROOT && git add docs/ && git commit -m 'Deploy Golf Analytics' && git push origin main${NC}\n"
