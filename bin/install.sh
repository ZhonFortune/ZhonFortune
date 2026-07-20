#!/usr/bin/env sh
set -e

echo "[HyperMyPage] Installing dependencies..."

echo "→ Installing root"
npm install --ignore-scripts

echo "→ Installing admin"
cd ./admin
npm install
cd ..

echo "→ Installing client"
cd ./client
npm install
cd ..

echo "→ Installing server"
cd ./server
npm install
cd ..

echo "All dependencies installed."
