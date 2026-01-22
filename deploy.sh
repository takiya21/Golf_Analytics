#!/bin/bash
# Golf Analytics を takiya21.github.io にデプロイするスクリプト

set -e

# 色定義
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Golf Analytics デプロイスクリプト${NC}"
echo -e "${BLUE}================================${NC}"

# ステップ 1: ビルド
echo -e "\n${BLUE}ステップ 1: フロントエンドをビルド中...${NC}"
cd /root/Data/takiya21/Golf_Analytics/frontend
npm run build
echo -e "${GREEN}✓ ビルド完了${NC}"

# ステップ 2: GitHub Pages リポジトリの確認
echo -e "\n${BLUE}ステップ 2: GitHub Pages リポジトリを確認中...${NC}"
if [ ! -d ~/takiya21-github-io ]; then
    echo -e "${RED}警告: ~/takiya21-github-io が見つかりません${NC}"
    echo -e "${BLUE}以下の選択肢があります:${NC}"
    echo -e "  1. リポジトリをクローンする:"
    echo -e "     git clone https://github.com/takiya21/takiya21.github.io.git ~/takiya21-github-io"
    echo -e "  2. または別のパスを指定:"
    echo -e "     deploy.sh [パス]"
    echo ""
    if [ -n "$1" ]; then
        GITHUB_IO_PATH="$1"
        if [ ! -d "$GITHUB_IO_PATH" ]; then
            echo -e "${RED}エラー: $GITHUB_IO_PATH が見つかりません${NC}"
            exit 1
        fi
    else
        echo -e "${RED}デプロイをスキップします${NC}"
        exit 1
    fi
else
    GITHUB_IO_PATH=~/takiya21-github-io
fi
echo -e "${GREEN}✓ リポジトリを確認: $GITHUB_IO_PATH${NC}"

# ステップ 3: ビルドファイルをコピー
echo -e "\n${BLUE}ステップ 3: ビルドファイルをコピー中...${NC}"
mkdir -p "$GITHUB_IO_PATH/Golf_Analytics"
cp -r /root/Data/takiya21/Golf_Analytics/frontend/dist/* "$GITHUB_IO_PATH/Golf_Analytics/"
echo -e "${GREEN}✓ コピー完了${NC}"

# ステップ 4: Git にコミット＆プッシュ
echo -e "\n${BLUE}ステップ 4: GitHub にプッシュ中...${NC}"
cd "$GITHUB_IO_PATH"

# 変更確認
if [ -z "$(git status --porcelain Golf_Analytics 2>/dev/null)" ]; then
    echo -e "${GREEN}✓ 変更がありません${NC}"
else
    echo -e "${BLUE}変更ファイル:${NC}"
    git status --short Golf_Analytics
    
    # コミット
    git add Golf_Analytics/
    git commit -m "Update Golf Analytics - $(date '+%Y-%m-%d %H:%M:%S')"
    
    # プッシュ
    git push origin main
    echo -e "${GREEN}✓ プッシュ完了${NC}"
fi

# ステップ 5: デプロイ完了
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}デプロイが完了しました!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "\n${BLUE}以下のURLでアクセスできます:${NC}"
echo -e "${GREEN}https://takiya21.github.io/Golf_Analytics/${NC}"
echo -e "\n※ キャッシュの反映に数分かかることがあります"
echo ""
