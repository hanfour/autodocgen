# Frontend - React Application

React 18 + TypeScript 前端應用程式

## 目錄結構

```
src/
├── components/          # React 元件
│   ├── Common/         # 通用元件 (Button, Input, Modal, Toast...)
│   ├── Layout/         # 版面元件 (MainLayout, Sidebar, Header...)
│   ├── Dashboard/      # Dashboard 相關元件
│   ├── Projects/       # 專案相關元件
│   ├── Templates/      # 模板相關元件
│   ├── Companies/      # 公司相關元件
│   └── Contacts/       # 聯絡人相關元件
├── pages/              # 頁面元件
│   ├── Auth/           # 登入/註冊頁面
│   ├── Projects/       # 專案管理頁面
│   ├── Templates/      # 模板管理頁面
│   ├── Companies/      # 公司管理頁面
│   └── Contacts/       # 聯絡人管理頁面
├── hooks/              # Custom React Hooks
├── utils/              # 工具函數
├── types/              # TypeScript 型別定義
├── firebase/           # Firebase 配置和 helper functions
├── App.tsx             # 主應用程式元件
└── index.tsx           # 應用程式入口
```

## 技術棧

- **React 18**: UI 框架
- **TypeScript**: 型別安全
- **Tailwind CSS**: 樣式框架
- **React Router**: 路由管理
- **React Hook Form**: 表單管理
- **React Query**: 資料獲取和快取
- **Firebase SDK**: Firebase 整合

## 開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm start

# 執行測試
npm test

# 建置生產版本
npm run build
```

## 環境變數

複製 `.env.local` 並填入你的 Firebase 配置:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## UI 設計原則

參考 Google Analytics 風格:
- 乾淨簡潔的卡片式設計
- 清晰的色彩層級
- 直覺的導航結構
- 完整的響應式設計
