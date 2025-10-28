# Firebase 專案設置指南

## Task 1.1: 建立 Firebase 專案

### 步驟 1: 建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊 "Add project" (新增專案)
3. 輸入專案名稱: `autodocgen-prod` (或你喜歡的名稱)
4. 選擇是否啟用 Google Analytics (建議啟用,用於追蹤使用情況)
5. 選擇 Firebase 方案:
   - **Spark (免費方案)**: 適合開發測試
   - **Blaze (用量計費)**: 需要使用 Cloud Functions,建議選擇此方案

### 步驟 2: 啟用 Firebase 服務

#### 2.1 啟用 Authentication

1. 在 Firebase Console 左側選單點擊 "Authentication"
2. 點擊 "Get started"
3. 在 "Sign-in method" 頁籤中:
   - 啟用 "Email/Password" 提供者
   - 點擊 "Email/Password" → 啟用 → 儲存

#### 2.2 啟用 Firestore Database

1. 在左側選單點擊 "Firestore Database"
2. 點擊 "Create database"
3. 選擇模式:
   - **Production mode** (正式環境)
   - 選擇區域: `asia-east1` (台灣) 或 `asia-northeast1` (日本)
4. 點擊 "Enable"

#### 2.3 啟用 Storage

1. 在左側選單點擊 "Storage"
2. 點擊 "Get started"
3. 使用預設的 Security Rules
4. 選擇與 Firestore 相同的區域
5. 點擊 "Done"

#### 2.4 啟用 Functions

1. 在左側選單點擊 "Functions"
2. 點擊 "Get started"
3. 系統會自動啟用 Cloud Functions
4. 確認已升級到 Blaze 方案 (Functions 需要付費方案)

### 步驟 3: 建立 Staging 環境 (可選但建議)

重複步驟 1-2,建立另一個專案:
- 專案名稱: `autodocgen-staging`
- 用途: 開發和測試環境

### 步驟 4: 取得 Firebase 配置

#### 4.1 Web App 配置

1. 在 Firebase Console 首頁,點擊 "Add app" 或 Web 圖示 (`</>`)
2. 輸入 App nickname: `AutoDocGen Web`
3. 不勾選 "Firebase Hosting" (稍後設定)
4. 點擊 "Register app"
5. 複製 Firebase configuration 物件:

```javascript
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD9IRzjWGTQ-s1YMtwxnXmRm_6tgd7dwpw",
  authDomain: "autodocgen-prod.firebaseapp.com",
  projectId: "autodocgen-prod",
  storageBucket: "autodocgen-prod.firebasestorage.app",
  messagingSenderId: "853262845197",
  appId: "1:853262845197:web:878babc99f4d16986e9c44",
  measurementId: "G-0ECKSD39GB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
```

6. 將此配置保存,稍後會用於前端專案

#### 4.2 Service Account Key (後端使用)

1. 點擊左上角齒輪圖示 → "Project settings"
2. 切換到 "Service accounts" 頁籤
3. 點擊 "Generate new private key"
4. 下載 JSON 檔案
5. 重命名為 `serviceAccountKey.json`
6. **重要**: 將此檔案加入 `.gitignore`,不要提交到版本控制

### 步驟 5: 安裝 Firebase CLI

在本機終端執行:

```bash
# 安裝 Firebase CLI (全域)
npm install -g firebase-tools

# 登入 Firebase
firebase login

# 驗證安裝
firebase --version
```

### 步驟 6: 初始化 Firebase 專案

在專案根目錄執行:

```bash
cd /Users/hanfourhuang/Projects/OTHER/autoDocGen

# 初始化 Firebase
firebase init
```

在互動式設定中選擇:

1. **選擇要使用的服務** (使用空白鍵選擇,Enter 確認):
   - ☑ Firestore
   - ☑ Functions
   - ☑ Hosting
   - ☑ Storage
   - ☑ Emulators

2. **選擇專案**: 選擇剛建立的 `autodocgen-prod`

3. **Firestore 設定**:
   - Firestore rules file: `firestore.rules` (Enter)
   - Firestore indexes file: `firestore.indexes.json` (Enter)

4. **Functions 設定**:
   - Language: `Python`
   - Directory: `functions` (Enter)
   - Install dependencies: `Yes`

5. **Hosting 設定**:
   - Public directory: `frontend/build` (稍後建立)
   - Configure as SPA: `Yes`
   - Set up automatic builds: `No`

6. **Storage 設定**:
   - Storage rules file: `storage.rules` (Enter)

7. **Emulators 設定** (選擇以下項目):
   - ☑ Authentication Emulator (port 9099)
   - ☑ Functions Emulator (port 5001)
   - ☑ Firestore Emulator (port 8080)
   - ☑ Storage Emulator (port 9199)
   - ☑ Hosting Emulator (port 5000)
   - Download emulators: `Yes`

### 步驟 7: 驗證設定

完成後,專案根目錄應該有以下檔案:

```
autoDocGen/
├── .firebaserc          # Firebase 專案配置
├── firebase.json        # Firebase 服務配置
├── firestore.rules      # Firestore 安全規則
├── firestore.indexes.json  # Firestore 索引
├── storage.rules        # Storage 安全規則
└── functions/           # Cloud Functions 目錄
    ├── main.py
    └── requirements.txt
```

### 步驟 8: 測試 Emulator

啟動 Firebase Emulator Suite:

```bash
firebase emulators:start
```

如果成功,應該會看到:

```
✔  All emulators ready! It is now safe to connect your app.
┌─────────────────────────────────────────────────────────────┐
│ ✔  All emulators ready! View status and logs at http://127.0.0.1:4000 │
└─────────────────────────────────────────────────────────────┘

┌───────────┬────────────────┬─────────────────────────────────┐
│ Emulator  │ Host:Port      │ View in Emulator UI             │
├───────────┼────────────────┼─────────────────────────────────┤
│ Auth      │ 127.0.0.1:9099 │ http://127.0.0.1:4000/auth      │
│ Functions │ 127.0.0.1:5001 │ http://127.0.0.1:4000/functions │
│ Firestore │ 127.0.0.1:8080 │ http://127.0.0.1:4000/firestore │
│ Storage   │ 127.0.0.1:9199 │ http://127.0.0.1:4000/storage   │
│ Hosting   │ 127.0.0.1:5000 │ n/a                             │
└───────────┴────────────────┴─────────────────────────────────┘
```

訪問 http://127.0.0.1:4000 查看 Emulator UI。

---

## 🎯 完成檢查清單

- [ ] 建立 Firebase 專案 (Production)
- [ ] 建立 Firebase 專案 (Staging) - 可選
- [ ] 啟用 Authentication (Email/Password)
- [ ] 啟用 Firestore Database (選擇區域)
- [ ] 啟用 Storage
- [ ] 啟用 Functions (升級到 Blaze 方案)
- [ ] 取得 Web App 配置
- [ ] 下載 Service Account Key
- [ ] 安裝 Firebase CLI
- [ ] 初始化 Firebase 專案
- [ ] 測試 Emulator Suite

---

## 📝 注意事項

1. **Service Account Key** 必須保密,不要提交到 Git
2. **區域選擇** 建議選擇 `asia-east1` (台灣) 以降低延遲
3. **Blaze 方案** Cloud Functions 需要付費方案,但有免費額度:
   - 每月 2,000,000 次調用免費
   - 400,000 GB-seconds 免費
   - 200,000 CPU-seconds 免費
4. **Emulator** 建議在開發時使用 Emulator,避免產生費用

---

## ⚠️ 下一步

完成上述步驟後,請回報以下資訊:

1. Firebase 專案 ID
2. Firebase Web 配置是否已取得
3. Emulator 是否正常運行

我將繼續進行下一個任務。
