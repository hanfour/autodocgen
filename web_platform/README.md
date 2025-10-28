# 自動文件產生平台

## 簡介
本專案是一個基於 Flask 的網頁平台，讓用戶上傳 Word 模板，設定批次欄位，並未來可批次產生 Word 文件。

## 主要功能
- 上傳 `.docx` 模板
- 自動解析模板內的佔位符欄位
- 設定哪些欄位為批次作業欄位
- 管理多個模板

## 環境需求
- Python 3.8+
- 套件：
  - Flask
  - python-docx
  - Werkzeug

## 安裝步驟
1. 進入 `web_platform` 目錄
2. 安裝套件：
   ```
   pip install flask python-docx
   ```
3. 啟動伺服器：
   ```
   python app.py
   ```
4. 在瀏覽器開啟 `http://127.0.0.1:5000`

## 目錄結構
```
web_platform/
├── app.py                  # Flask 主程式
├── README.md               # 專案說明
├── DEVELOPER.md            # 開發者文件
├── USER_GUIDE.md           # 操作手冊
├── uploads/                # 上傳的模板檔案
├── config/                 # 佔位符與欄位設定
├── templates/              # HTML 頁面模板
│   ├── index.html
│   ├── upload_template.html
│   └── field_settings.html
└── static/                 # 靜態資源（可擴充）
```

## 啟動畫面
首頁提供模板上傳與欄位設定功能。

## 作者
- 自動產生
