#!/usr/bin/env sh
set -e

echo "[HyperMyPage] Building..."

echo "→ Building admin"
cd ./admin
npm run build
cd ..

echo "→ Building client"
cd ./client
npm run build
cd ..

echo "Build completed."
