#!/bin/bash

# Golfys Setup Script
# Golf Analytics & Score Management Application

echo "================================"
echo "🏌️  Golfys セットアップスクリプト"
echo "================================"
echo ""

# 1. Node.js チェック
echo "📋 環境確認中..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js がインストールされていません"
    echo "https://nodejs.org/ からインストールしてください"
    exit 1
fi

echo "✓ Node.js $(node -v) が検出されました"
echo "✓ npm $(npm -v) が検出されました"
echo ""

# 2. バックエンドセットアップ
echo "⚙️  バックエンドをセットアップ中..."
cd backend
if npm install; then
    echo "✓ バックエンドのセットアップが完了しました"
else
    echo "❌ バックエンドのセットアップに失敗しました"
    exit 1
fi
cd ..
echo ""

# 3. フロントエンドセットアップ
echo "⚙️  フロントエンドをセットアップ中..."
cd frontend
if npm install; then
    echo "✓ フロントエンドのセットアップが完了しました"
else
    echo "❌ フロントエンドのセットアップに失敗しました"
    exit 1
fi
cd ..
echo ""

# 4. 完了メッセージ
echo "================================"
echo "✨ セットアップが完了しました！"
echo "================================"
echo ""
echo "🚀 起動方法:"
echo ""
echo "1️⃣  2つのターミナルを開いてください"
echo ""
echo "ターミナル1 (バックエンド):"
echo "   cd Golf_Analytics/backend"
echo "   npm run dev"
echo ""
echo "ターミナル2 (フロントエンド):"
echo "   cd Golf_Analytics/frontend"
echo "   npm run dev"
echo ""
echo "3️⃣  ブラウザで以下にアクセス:"
echo "   http://localhost:3000"
echo ""
echo "詳細は QUICKSTART.md を参照してください"
echo ""
