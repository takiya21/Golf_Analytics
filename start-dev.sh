#!/bin/bash

# Golfys Development Server Launcher
# This script starts both backend and frontend servers

echo "🏌️  Golfys 開発サーバー起動中..."
echo ""
echo "⚠️  このスクリプトを実行する前に、以下を確認してください:"
echo "   - npm install が完了している"
echo "   - ポート 5000 と 3000 が利用可能"
echo ""
echo "Ctrl+C で両方のサーバーを停止できます"
echo ""

# Check if concurrently is installed at root level
if ! npm list concurrently > /dev/null 2>&1; then
    echo "📦 concurrently パッケージをインストール中..."
    npm install
fi

# Start both servers concurrently
cd "$(dirname "$0")"

echo "🚀 バックエンドを起動中 (http://localhost:5000)..."
echo "🚀 フロントエンドを起動中 (http://localhost:3000)..."
echo ""

npx concurrently \
    --kill-others \
    --names "Backend,Frontend" \
    --prefix "[{name}]" \
    --prefix-colors "yellow,cyan" \
    "cd backend && npm run dev" \
    "cd frontend && npm run dev"
