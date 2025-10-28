# AutoDocGen - 自動化文檔生成平台

> 企業級文檔自動化解決方案，讓文檔生成變得簡單高效

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/react-18.2-61dafb.svg)](https://reactjs.org/)

---

## 🚀 快速開始

```bash
# 克隆項目
git clone git@github.com:hanfour/autodocgen.git
cd autodocgen

# 一鍵啟動開發環境
./scripts/start-dev.sh
```

訪問：
- 🌐 前端: http://localhost:3000
- 🔥 Emulator UI: http://localhost:4000

詳細步驟請參閱 [QUICK_START.md](QUICK_START.md)

---

## ✨ 功能特色

- **智能文檔生成** - 基於 Word 模板自動生成各類文檔
- **HIYES 編號系統** - 獨特的文檔編號格式 (HIYESYYMDDNNN)
- **多模板支持** - 報價單、合約、發票等
- **項目管理** - 完整的項目生命週期管理
- **權限控制** - Owner/Member/Viewer 角色管理
- **實時同步** - Firebase 實時數據更新

---

## 🏗️ 技術棧

**後端**: Python 3.11 + Firebase Functions + python-docx  
**前端**: React 18 + TypeScript + Vite + Tailwind CSS  
**基礎設施**: Firebase (Firestore + Storage + Auth)

---

## 📁 項目結構

```
autodocgen/
├── frontend/          # React 前端應用
├── functions/         # Python Cloud Functions
├── docs/              # 詳細文檔
├── scripts/           # 工具腳本
└── README.md         # 本文件
```

---

## 📚 文檔

- [快速開始](QUICK_START.md) - 5分鐘快速上手
- [項目完成報告](PROJECT_COMPLETE.md) - 功能總覽
- [集成指南](docs/INTEGRATION_GUIDE.md) - 詳細集成步驟
- [Cloud Functions](docs/CLOUD_FUNCTIONS_SETUP.md) - Functions 開發指南

---

## 📊 項目狀態

### 已完成 ✅
- Cloud Functions (6個核心函數)
- 項目管理 UI (4個頁面)
- 文檔生成系統
- 權限管理
- 單元測試 (100% 通過)

### 進行中 🚧
- 模板管理 UI
- 公司/聯繫人管理 UI
- Dashboard 頁面

---

## 🔧 開發

```bash
# 安裝依賴
cd functions && pip install -r requirements.txt
cd frontend && npm install

# 運行測試
cd functions && python test_functions.py

# 啟動開發環境
./scripts/start-dev.sh
```

---

## 🚢 部署

```bash
# 部署 Functions
firebase deploy --only functions

# 部署前端
cd frontend && npm run build
firebase deploy --only hosting
```

---

## 📄 許可證

MIT License - 詳見 [LICENSE](LICENSE)

---

## 📞 聯繫

- 📧 Email: support@autodocgen.com
- 📖 文檔: [查看完整文檔](docs/)
- 🐙 GitHub: https://github.com/hanfour/autodocgen

---

<p align="center">Made with ❤️ by AutoDocGen Team</p>
