#!/bin/bash
# 啟動自動文件產生平台

cd "$(dirname "$0")"

echo "安裝必要套件..."
pip install flask python-docx

echo "啟動 Flask 伺服器..."
python app.py
