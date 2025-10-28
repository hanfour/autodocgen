# Functions - Cloud Functions (Python)

Firebase Cloud Functions 後端邏輯

## 目錄結構

```
src/
├── projects/       # 專案相關 Cloud Functions
│   ├── create_project.py
│   ├── update_project.py
│   ├── update_status.py
│   └── ...
├── templates/      # 模板相關 Cloud Functions
│   ├── upload_template.py
│   ├── analyze_template.py
│   └── ...
├── documents/      # 文件生成 Cloud Functions
│   ├── generate_documents.py
│   ├── regenerate_document.py
│   └── ...
├── utils/          # 工具函數
│   ├── code_generator.py
│   ├── validators.py
│   ├── permissions.py
│   └── ...
├── tests/          # 測試檔案
└── main.py         # 入口檔
```

## 技術棧

- **Python 3.11**: 程式語言
- **Firebase Functions**: Serverless 平台
- **python-docx**: Word 文件處理
- **Firebase Admin SDK**: Firebase 服務存取

## 開發

```bash
# 建立虛擬環境
python3 -m venv venv

# 啟動虛擬環境
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# 安裝依賴
pip install -r requirements.txt

# 執行測試
pytest src/tests/

# 部署
firebase deploy --only functions
```

## 主要 Cloud Functions

### Projects

- `create_project`: 建立新專案
- `update_project`: 更新專案資料
- `update_project_status`: 更新專案狀態
- `delete_project`: 刪除專案

### Templates

- `upload_template`: 上傳模板檔案
- `analyze_template`: 分析模板變數
- `update_template`: 更新模板
- `delete_template`: 刪除模板

### Documents

- `generate_documents`: 生成文件
- `regenerate_document`: 重新生成文件
- `download_document`: 取得文件下載連結

### Utilities

- `code_generator.py`: 文件編號生成 (HIYES 規則)
- `validators.py`: 資料驗證
- `permissions.py`: 權限檢查

## 環境變數

Cloud Functions 會自動取得以下環境變數:
- Firebase 專案配置
- Service Account 認證

## 測試

```bash
# 使用 Emulator 測試
firebase emulators:start

# 執行單元測試
pytest src/tests/

# 覆蓋率報告
pytest --cov=src
```
