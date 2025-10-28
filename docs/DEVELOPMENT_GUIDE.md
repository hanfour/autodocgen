# AutoDocGen Web Platform - 開發指南

## 當前進度

✅ **已完成**:
- Task 1.1: Firebase 專案設置指南已建立 (`docs/FIREBASE_SETUP.md`)
- 配置文件已建立:
  - `.gitignore`
  - `firebase.json`
  - `firestore.indexes.json`

⏳ **待完成** (需要你手動執行):
1. 按照 `docs/FIREBASE_SETUP.md` 建立 Firebase 專案
2. 執行 `firebase init` 初始化專案
3. 執行以下腳本建立專案結構

---

## 快速開始指南

### 步驟 1: 完成 Firebase 設置

請參考 `docs/FIREBASE_SETUP.md` 完成:
- 建立 Firebase 專案
- 啟用所有服務
- 安裝 Firebase CLI
- 執行 `firebase init`

### 步驟 2: 建立專案目錄結構

執行以下命令建立完整的專案結構:

```bash
# 在專案根目錄執行
cd /Users/hanfourhuang/Projects/OTHER/autoDocGen

# 建立前端目錄結構
mkdir -p frontend/src/{components,pages,hooks,utils,types,firebase}
mkdir -p frontend/src/components/{Common,Layout,Dashboard,Projects,Templates,Companies,Contacts}
mkdir -p frontend/src/pages/{Auth,Projects,Templates,Companies,Contacts}
mkdir -p frontend/public

# 建立後端目錄結構
mkdir -p functions/src/{projects,templates,documents,utils,tests}

# 建立其他必要目錄
mkdir -p scripts
mkdir -p docs/specs
```

### 步驟 3: 初始化前端專案 (React + TypeScript)

```bash
# 建立 React 應用
cd /Users/hanfourhuang/Projects/OTHER/autoDocGen
npx create-react-app frontend --template typescript

# 進入前端目錄
cd frontend

# 安裝依賴
npm install react-router-dom firebase tailwindcss postcss autoprefixer
npm install react-hook-form @tanstack/react-query axios date-fns
npm install -D @types/react-router-dom

# 初始化 Tailwind CSS
npx tailwindcss init -p
```

### 步驟 4: 配置 Tailwind CSS

編輯 `frontend/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Google Analytics 風格配色
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
    },
  },
  plugins: [],
}
```

編輯 `frontend/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 自定義全域樣式 */
body {
  @apply bg-gray-50 text-gray-900;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
```

### 步驟 5: 設置後端 (Cloud Functions)

```bash
# 進入 functions 目錄
cd /Users/hanfourhuang/Projects/OTHER/autoDocGen/functions

# 建立 Python 虛擬環境
python3 -m venv venv

# 啟動虛擬環境
source venv/bin/activate  # macOS/Linux

# 安裝依賴
pip install firebase-functions firebase-admin python-docx google-cloud-storage google-cloud-firestore

# 生成 requirements.txt
pip freeze > requirements.txt
```

### 步驟 6: 建立環境變數文件

```bash
cd /Users/hanfourhuang/Projects/OTHER/autoDocGen

# 建立前端環境變數
cat > frontend/.env.local << 'EOF'
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# Environment
REACT_APP_ENV=development
EOF

echo "⚠️  請編輯 frontend/.env.local 填入你的 Firebase 配置"
```

### 步驟 7: 啟動開發環境

#### 啟動 Firebase Emulator

```bash
# 在專案根目錄
firebase emulators:start
```

訪問 http://localhost:4000 查看 Emulator UI

#### 啟動前端開發伺服器

```bash
# 新開一個終端
cd frontend
npm start
```

訪問 http://localhost:3000 查看應用

---

## 專案結構

完成後的專案結構應該如下:

```
autoDocGen/
├── docs/
│   ├── specs/
│   │   ├── requirements.md
│   │   ├── design.md
│   │   └── tasks.md
│   ├── FIREBASE_SETUP.md
│   └── DEVELOPMENT_GUIDE.md
├── frontend/                 # React 前端
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Common/      # 通用元件
│   │   │   ├── Layout/      # 版面元件
│   │   │   ├── Dashboard/   # Dashboard 元件
│   │   │   ├── Projects/    # 專案相關元件
│   │   │   ├── Templates/   # 模板相關元件
│   │   │   ├── Companies/   # 公司相關元件
│   │   │   └── Contacts/    # 聯絡人相關元件
│   │   ├── pages/
│   │   │   ├── Auth/        # 登入/註冊頁面
│   │   │   ├── Projects/    # 專案頁面
│   │   │   ├── Templates/   # 模板頁面
│   │   │   ├── Companies/   # 公司頁面
│   │   │   └── Contacts/    # 聯絡人頁面
│   │   ├── hooks/           # Custom Hooks
│   │   ├── utils/           # 工具函數
│   │   ├── types/           # TypeScript 型別定義
│   │   ├── firebase/        # Firebase 配置和 helpers
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── tailwind.config.js
├── functions/               # Cloud Functions (Python)
│   ├── src/
│   │   ├── projects/       # 專案相關 functions
│   │   ├── templates/      # 模板相關 functions
│   │   ├── documents/      # 文件生成 functions
│   │   ├── utils/          # 工具函數
│   │   ├── tests/          # 測試檔案
│   │   └── main.py         # 入口檔
│   ├── venv/               # Python 虛擬環境
│   └── requirements.txt
├── scripts/                # 資料遷移腳本
│   ├── migrate_companies.py
│   ├── migrate_contacts.py
│   ├── migrate_projects.py
│   └── migrate_templates.py
├── config/                 # 現有配置檔案
│   ├── companies.json
│   └── contacts.json
├── input/                  # 現有歷史資料
├── templates/              # 現有模板檔案
├── .gitignore
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── storage.rules
└── README.md
```

---

## 開發工作流程

### 1. 本地開發

```bash
# Terminal 1: 啟動 Emulator
firebase emulators:start

# Terminal 2: 啟動前端
cd frontend && npm start

# Terminal 3: 後端開發 (Functions 會自動重載)
# 編輯 functions/src/ 中的檔案
```

### 2. 測試

```bash
# 前端測試
cd frontend
npm test

# 後端測試
cd functions
source venv/bin/activate
pytest src/tests/
```

### 3. 部署

#### 部署到 Staging

```bash
firebase use staging  # 切換到 staging 專案
firebase deploy
```

#### 部署到 Production

```bash
firebase use production  # 切換到 production 專案
firebase deploy
```

#### 分別部署不同服務

```bash
firebase deploy --only hosting        # 只部署前端
firebase deploy --only functions      # 只部署 Functions
firebase deploy --only firestore:rules # 只部署 Firestore Rules
firebase deploy --only storage        # 只部署 Storage Rules
```

---

## 下一步任務

完成上述設置後,請執行:

```bash
# 檢查是否所有依賴都已安裝
cd frontend && npm install
cd ../functions && source venv/bin/activate && pip install -r requirements.txt

# 啟動開發環境
firebase emulators:start &
cd frontend && npm start
```

然後我們就可以開始實際的開發工作:
- Task 2: 前端核心配置
- Task 3: 後端核心模組
- Task 4: Firestore Security Rules
- ...

---

## 常見問題

### Q: Firebase Emulator 啟動失敗?

A: 確認 Java 已安裝 (Emulator 需要 Java):
```bash
java --version  # 應該顯示 Java 11 或更高版本
```

如果沒有安裝:
```bash
# macOS
brew install openjdk@11
```

### Q: 前端啟動報錯?

A: 確認 Node.js 版本:
```bash
node --version  # 應該是 v16 或更高版本
```

### Q: Cloud Functions 部署失敗?

A: 確認已升級到 Blaze 方案,Functions 需要付費方案才能部署。

---

## 參考資源

- [Firebase 文檔](https://firebase.google.com/docs)
- [React 文檔](https://react.dev/)
- [Tailwind CSS 文檔](https://tailwindcss.com/docs)
- [TypeScript 文檔](https://www.typescriptlang.org/docs/)
- [python-docx 文檔](https://python-docx.readthedocs.io/)
