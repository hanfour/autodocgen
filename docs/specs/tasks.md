# AutoDocGen Web Platform - Task List

## Implementation Tasks

### Phase 1: 基礎設施設置 (Foundation)

- [x] **1. Firebase 專案初始化**
    - [x] 1.1. 建立 Firebase 專案
        - *Goal*: 在 Firebase Console 建立新專案並配置基本設定
        - *Details*:
          - 建立 Firebase 專案 (選擇 Spark 或 Blaze plan)
          - 啟用 Authentication (Email/Password)
          - 啟用 Firestore Database (選擇區域)
          - 啟用 Storage
          - 啟用 Functions
          - 建立 staging 和 production 環境
        - *Requirements*: 部署要求

    - [x] 1.2. 配置 Firebase CLI 和本地開發環境
        - *Goal*: 設定本地開發工具鏈
        - *Details*:
          - 安裝 Firebase CLI: `npm install -g firebase-tools`
          - 登入 Firebase: `firebase login`
          - 初始化專案: `firebase init`
          - 配置 Firestore, Storage, Functions, Hosting
          - 設定 emulator: `firebase emulators:start`
        - *Requirements*: 開發環境要求

    - [x] 1.3. 建立專案目錄結構
        - *Goal*: 建立清晰的專案結構
        - *Details*:
          ```
          autoDocGen/
          ├── frontend/          # React app
          │   ├── src/
          │   │   ├── components/
          │   │   ├── pages/
          │   │   ├── hooks/
          │   │   ├── utils/
          │   │   ├── types/
          │   │   └── App.tsx
          │   ├── public/
          │   └── package.json
          ├── functions/         # Cloud Functions
          │   ├── src/
          │   │   ├── projects/
          │   │   ├── templates/
          │   │   ├── documents/
          │   │   └── utils/
          │   └── requirements.txt
          ├── firestore.rules
          ├── storage.rules
          └── firebase.json
          ```
        - *Requirements*: 可維護性要求

- [x] **2. 前端專案設置**
    - [x] 2.1. 建立 React + TypeScript 專案
        - *Goal*: 初始化前端專案並安裝依賴
        - *Details*:
          - `npx create-react-app frontend --template typescript`
          - 安裝依賴:
            - `react-router-dom` (路由)
            - `firebase` (Firebase SDK)
            - `tailwindcss` (樣式)
            - `react-hook-form` (表單管理)
            - `@tanstack/react-query` (資料獲取)
            - `axios` (HTTP client)
            - `date-fns` (日期處理)
        - *Requirements*: 技術選型

    - [x] 2.2. 配置 Tailwind CSS
        - *Goal*: 設定樣式框架
        - *Details*:
          - 安裝 Tailwind: `npm install -D tailwindcss postcss autoprefixer`
          - 初始化配置: `npx tailwindcss init -p`
          - 配置 `tailwind.config.js` (參考 Google Analytics 配色)
          - 設定 `index.css` 引入 Tailwind directives
        - *Requirements*: UI 設計要求

    - [x] 2.3. 設定 Firebase SDK
        - *Goal*: 整合 Firebase 到前端
        - *Details*:
          - 建立 `src/firebase/config.ts` (Firebase 配置)
          - 建立 `src/firebase/auth.ts` (Authentication helper)
          - 建立 `src/firebase/firestore.ts` (Firestore helper)
          - 建立 `src/firebase/storage.ts` (Storage helper)
          - 建立 `src/firebase/functions.ts` (Functions helper)
        - *Requirements*: 技術選型

- [x] **3. 後端專案設置**
    - [x] 3.1. 建立 Cloud Functions 專案 (Python)
        - *Goal*: 初始化後端專案
        - *Details*:
          - `cd functions && python -m venv venv`
          - 建立 `requirements.txt`:
            - `firebase-functions`
            - `firebase-admin`
            - `python-docx`
            - `google-cloud-storage`
            - `google-cloud-firestore`
          - 安裝依賴: `pip install -r requirements.txt`
        - *Requirements*: 技術選型

    - [x] 3.2. 建立 Functions 基礎模組
        - *Goal*: 設定 Cloud Functions 結構
        - *Details*:
          - 建立 `functions/src/main.py` (入口檔)
          - 建立 `functions/src/utils/` (工具函數)
          - 建立 `functions/src/projects/` (專案相關)
          - 建立 `functions/src/templates/` (模板相關)
          - 建立 `functions/src/documents/` (文件生成)
        - *Requirements*: 模組化要求

    - [x] 3.3. 配置 Firestore Security Rules
        - *Goal*: 設定資料庫安全規則
        - *Details*:
          - 編寫 `firestore.rules` (參考設計文檔)
          - 實作權限檢查函數 (isAuthenticated, hasAccess)
          - 測試 Security Rules (使用 emulator)
        - *Requirements*: 安全性要求

    - [x] 3.4. 配置 Storage Security Rules
        - *Goal*: 設定檔案儲存安全規則
        - *Details*:
          - 編寫 `storage.rules` (參考設計文檔)
          - 限制模板檔案存取權限
          - 限制專案文件存取權限
        - *Requirements*: 安全性要求

### Phase 2: 資料模型與遷移 (Data & Migration)

- [ ] **4. Firestore Collections 建立**
    - [x] 4.1. 定義 TypeScript 型別
        - *Goal*: 建立資料型別定義
        - *Details*:
          - 建立 `frontend/src/types/project.ts`
          - 建立 `frontend/src/types/template.ts`
          - 建立 `frontend/src/types/company.ts`
          - 建立 `frontend/src/types/contact.ts`
          - 建立 `frontend/src/types/user.ts`
          - 建立 `frontend/src/types/activity.ts`
        - *Requirements*: 型別安全要求

    - [x] 4.2. 建立 Firestore 索引
        - *Goal*: 配置資料庫索引以優化查詢
        - *Details*:
          - 編寫 `firestore.indexes.json`:
            - projects: status + updated_at
            - projects: created_by + created_at
            - templates: is_active + updated_at
            - activities: timestamp DESC
          - 部署索引: `firebase deploy --only firestore:indexes`
        - *Requirements*: 效能要求

- [x] **5. 資料遷移腳本**
    - [x] 5.1. 遷移公司資料
        - *Goal*: 將 `config/companies.json` 匯入 Firestore
        - *Details*:
          - 建立 `scripts/migrate_companies.py`
          - 讀取 `config/companies.json`
          - 轉換資料格式並寫入 Firestore
          - 記錄遷移日誌
        - *Requirements*: AC-8 資料遷移

    - [x] 5.2. 遷移聯絡人資料
        - *Goal*: 將 `config/contacts.json` 匯入 Firestore
        - *Details*:
          - 建立 `scripts/migrate_contacts.py`
          - 讀取 `config/contacts.json`
          - 轉換資料格式並寫入 Firestore
        - *Requirements*: AC-8 資料遷移

    - [x] 5.3. 遷移歷史專案資料
        - *Goal*: 將 20 個 `input/*/projects.json` 匯入 Firestore
        - *Details*:
          - 建立 `scripts/migrate_projects.py`
          - 遍歷 `input/` 目錄
          - 解析每個 `projects.json`
          - 建立 project documents (不上傳實際文件)
          - 關聯 company 和 contact references
          - 驗證資料完整性
        - *Requirements*: AC-8 資料遷移

    - [x] 5.4. 遷移模板檔案
        - *Goal*: 上傳現有模板到 Firebase Storage
        - *Details*:
          - 上傳 `templates/template.docx` 和 `template2.docx`
          - 建立對應的 template documents in Firestore
          - 執行 `analyzeTemplate` 掃描變數
          - 設定模板為 active
        - *Requirements*: AC-8 資料遷移

### Phase 3: 核心功能 - 認證與權限 (Auth)

- [x] **6. 用戶認證系統**
    - [x] 6.1. 實作登入/註冊 UI
        - *Goal*: 建立登入和註冊介面
        - *Details*:
          - 建立 `frontend/src/pages/Auth/Login.tsx`
          - 建立 `frontend/src/pages/Auth/Register.tsx`
          - 使用 `react-hook-form` 處理表單
          - 表單驗證 (email 格式、密碼強度)
          - 錯誤處理和提示
        - *Requirements*: AC-6 用戶權限

    - [x] 6.2. 整合 Firebase Authentication
        - *Goal*: 實作認證邏輯
        - *Details*:
          - 建立 `frontend/src/hooks/useAuth.ts`
          - 實作 `signUp(email, password)`
          - 實作 `signIn(email, password)`
          - 實作 `signOut()`
          - 實作 `onAuthStateChanged` listener
          - 建立 AuthContext (React Context API)
        - *Requirements*: AC-6 用戶權限

    - [x] 6.3. 實作 Protected Routes
        - *Goal*: 保護需要登入的頁面
        - *Details*:
          - 建立 `frontend/src/components/PrivateRoute.tsx`
          - 檢查 auth state
          - 未登入自動導向登入頁
          - 儲存原始目標 URL (登入後返回)
        - *Requirements*: AC-6 用戶權限

    - [x] 6.4. 實作權限管理 UI
        - *Goal*: 建立分享和權限設定介面
        - *Details*:
          - 建立 `frontend/src/components/ShareDialog.tsx`
          - 輸入 Email 邀請用戶
          - 選擇權限等級 (owner/member/viewer)
          - 顯示已分享用戶列表
          - 移除分享權限
        - *Requirements*: US-15, US-16

### Phase 4: 核心功能 - 專案管理 (Projects)

- [x] **7. 專案 CRUD 功能**
    - [x] 7.1. 專案列表頁面
        - *Goal*: 顯示所有專案並支援篩選/搜尋
        - *Details*:
          - 建立 `frontend/src/pages/Projects/ProjectList.tsx`
          - 使用 `@tanstack/react-query` 獲取資料
          - 實作分頁 (每頁 20 筆)
          - 實作狀態篩選器 (dropdown)
          - 實作搜尋功能 (專案名稱/公司名稱)
          - 實作排序功能 (日期/金額)
          - 顯示專案卡片 (包含狀態標籤)
        - *Requirements*: AC-1 專案管理

    - [x] 7.2. 建立專案表單
        - *Goal*: 實作新增專案功能
        - *Details*:
          - 建立 `frontend/src/pages/Projects/CreateProject.tsx`
          - 基本資料表單 (專案名稱、公司、聯絡人、金額、日期)
          - 公司和聯絡人下拉選單 (可搜尋)
          - 模板選擇 (checkbox 多選)
          - 動態顯示額外欄位 (根據選中的模板)
          - 表單驗證
          - 呼叫 `create_project` Cloud Function
        - *Requirements*: US-1, AC-1

    - [x] 7.3. 專案詳情頁面
        - *Goal*: 顯示專案完整資訊
        - *Details*:
          - 建立 `frontend/src/pages/Projects/ProjectDetail.tsx`
          - 顯示基本資料
          - 顯示狀態歷史 (timeline)
          - 顯示已生成的文件列表
          - 下載文件按鈕
          - 刪除文件按鈕
          - 重新生成文件按鈕
          - 補生成文件按鈕
        - *Requirements*: US-11, AC-3

    - [x] 7.4. 編輯專案功能
        - *Goal*: 實作編輯專案資料
        - *Details*:
          - 建立 `frontend/src/pages/Projects/EditProject.tsx`
          - 預填現有資料
          - 允許修改基本資料
          - 不允許修改已生成的文件
          - 呼叫 `update_project` Cloud Function
        - *Requirements*: AC-1

    - [x] 7.5. 狀態管理功能
        - *Goal*: 實作專案狀態變更
        - *Details*:
          - 建立狀態選擇 dropdown
          - 顯示當前狀態
          - 變更狀態時記錄時間戳和操作者
          - 呼叫 `update_project_status` Cloud Function
          - 更新狀態歷史
        - *Requirements*: US-3, AC-1

### Phase 5: 核心功能 - 模板管理 (Templates)

- [x] **8. 模板 CRUD 功能**
    - [x] 8.1. 模板列表頁面
        - *Goal*: 顯示所有模板
        - *Details*:
          - 建立 `frontend/src/pages/Templates/TemplateList.tsx`
          - 顯示模板卡片 (名稱、類型、版本、變數數量)
          - 顯示啟用/停用狀態
          - 啟用/停用切換按鈕
          - 編輯按鈕
          - 刪除按鈕
        - *Requirements*: AC-2

    - [x] 8.2. 上傳模板功能
        - *Goal*: 實作上傳新模板
        - *Details*:
          - 建立 `frontend/src/pages/Templates/UploadTemplate.tsx`
          - 檔案上傳元件 (拖放或點擊)
          - 限制檔案類型 (.docx)
          - 限制檔案大小 (10 MB)
          - 上傳到 Firebase Storage
          - 呼叫 `analyze_template` Cloud Function
          - 顯示偵測到的變數
          - 顯示系統建議的配置
          - 允許用戶修改配置
          - 儲存模板 metadata 到 Firestore
        - *Requirements*: US-5, US-6, AC-2

    - [x] 8.3. 變數配置器元件
        - *Goal*: 建立動態變數配置 UI
        - *Details*:
          - 建立 `frontend/src/components/Templates/VariableConfigurator.tsx`
          - 顯示每個變數的配置表單:
            - 欄位名稱 (input)
            - 資料類型 (select: text/number/date/email/tel/select/textarea)
            - 選項 (for select type, 可動態新增)
            - 必填 (checkbox)
            - 預設值 (input)
          - 驗證配置完整性
        - *Requirements*: US-7, AC-2

    - [x] 8.4. 模板變數推斷邏輯
        - *Goal*: 實作 Regex-based 變數推斷
        - *Details*:
          - 實作 `infer_variable_config()` (參考設計文檔)
          - 日期類型推斷 (date, 日期)
          - 金額類型推斷 (price, amount, cost, fee)
          - 電話類型推斷 (phone, tel)
          - Email 類型推斷 (email, mail)
          - 選項類型推斷 (terms, type, status, category)
          - 預設為 text
        - *Requirements*: AC-2

    - [x] 8.5. 模板版本管理
        - *Goal*: 實作模板更新和版本控制
        - *Details*:
          - 上傳新版本時自動遞增 version 號
          - 保留舊版本檔案 (Storage 中)
          - Firestore 只記錄最新版本 metadata
          - 顯示版本歷史
        - *Requirements*: US-8, AC-2

### Phase 6: 核心功能 - 文件生成 (Documents)

- [x] **9. 文件生成引擎**
    - [x] 9.1. Cloud Function: generate_documents
        - *Goal*: 實作文件生成核心邏輯
        - *Details*:
          - 取得專案、公司、聯絡人資料
          - 準備標準變數 (使用 `prepare_standard_variables`)
          - 遍歷每個模板:
            - 下載模板檔案
            - 合併標準變數和額外變數
            - 替換佔位符 (使用 `replace_placeholders`)
            - 儲存生成的文件到 Storage
            - 記錄文件 metadata
          - 更新專案的 `generated_docs` 陣列
          - 記錄活動到 activities collection
        - *Requirements*: US-9, AC-3

    - [x] 9.2. 佔位符替換邏輯
        - *Goal*: 正確替換 Word 文件中的變數
        - *Details*:
          - 實作 `replace_placeholders()` (參考設計文檔)
          - 處理段落 (paragraphs)
          - 處理表格 (tables)
          - 處理頁首頁尾 (header/footer)
          - 保留文字格式 (使用 runs)
          - 處理跨 run 的 placeholder
        - *Requirements*: AC-3

    - [x] 9.3. 標準變數準備邏輯
        - *Goal*: 從資料庫取得並計算標準變數
        - *Details*:
          - 實作 `prepare_standard_variables()` (參考設計文檔)
          - 計算未稅金額和稅額
          - 生成文件編號 (使用 `generate_code`)
          - 轉換民國年月日
          - 組合聯絡人資訊 (名稱 + 電話)
        - *Requirements*: AC-3, AC-5

    - [x] 9.4. 文件編號生成邏輯
        - *Goal*: 實作 HIYES 編號規則
        - *Details*:
          - 實作 `generate_code()` (參考現有 main.py)
          - 年份: 西元後 2 碼
          - 月份: A-L (1-12月)
          - 日期: 雙字母 (AA-ZZ, BA-...)
          - 流水號: 3 碼 (001-999)
          - 實作 `get_date_counter()` 查詢同日期專案數量
        - *Requirements*: AC-5

    - [x] 9.5. 補生成文件功能
        - *Goal*: 為現有專案補生成新模板文件
        - *Details*:
          - 建立 "生成更多文件" UI
          - 顯示尚未生成的模板清單
          - 選擇要生成的模板
          - 填寫該模板需要的額外欄位
          - 呼叫 `generate_documents` (只傳選中的模板 ID)
        - *Requirements*: US-10, AC-3

    - [x] 9.6. 重新生成文件功能
        - *Goal*: 重新生成已存在的文件
        - *Details*:
          - 建立 `regenerate_document` Cloud Function
          - 刪除舊版本檔案
          - 使用原始 `generation_data` 重新生成
          - 更新 Firestore metadata
        - *Requirements*: US-12, AC-3

    - [x] 9.7. 文件下載功能
        - *Goal*: 實作文件下載
        - *Details*:
          - 建立 Cloud Function 產生 signed URL
          - 前端呼叫 function 取得下載連結
          - 自動下載檔案 (使用 `<a download>`)
        - *Requirements*: US-11, AC-3

### Phase 7: 核心功能 - 公司與聯絡人 (Companies & Contacts)

- [ ] **10. 公司管理功能**
    - [x] 10.1. 公司列表頁面
        - *Goal*: 顯示所有公司
        - *Details*:
          - 建立 `frontend/src/pages/Companies/CompanyList.tsx`
          - 顯示公司卡片 (名稱、統編、負責人)
          - 搜尋功能
          - 編輯按鈕
          - 刪除按鈕
        - *Requirements*: US-13, AC-4

    - [x] 10.2. 新增/編輯公司表單
        - *Goal*: 實作公司 CRUD
        - *Details*:
          - 建立 `frontend/src/pages/Companies/CompanyForm.tsx`
          - 表單欄位: 公司名稱、統編、負責人、地址、電話、Email
          - 表單驗證 (統編格式)
          - 呼叫 `create_company` / `update_company` Cloud Function
        - *Requirements*: AC-4

- [ ] **11. 聯絡人管理功能**
    - [x] 11.1. 聯絡人列表頁面
        - *Goal*: 顯示所有聯絡人
        - *Details*:
          - 建立 `frontend/src/pages/Contacts/ContactList.tsx`
          - 顯示聯絡人卡片 (名稱、電話、Email、公司)
          - 搜尋功能
          - 編輯按鈕
          - 刪除按鈕
        - *Requirements*: US-14, AC-4

    - [x] 11.2. 新增/編輯聯絡人表單
        - *Goal*: 實作聯絡人 CRUD
        - *Details*:
          - 建立 `frontend/src/pages/Contacts/ContactForm.tsx`
          - 表單欄位: 姓名、電話、Email、職稱、關聯公司
          - 表單驗證 (電話格式、Email 格式)
          - 呼叫 `create_contact` / `update_contact` Cloud Function
        - *Requirements*: AC-4

### Phase 8: UI/UX - Dashboard 與 Layout (UI)

- [ ] **12. 主版面與導航**
    - [x] 12.1. 主版面結構
        - *Goal*: 建立應用程式主框架
        - *Details*:
          - 建立 `frontend/src/components/Layout/MainLayout.tsx`
          - Sidebar 導航列
          - Header (用戶資訊、登出按鈕)
          - Main content area
          - 響應式設計 (手機版摺疊 sidebar)
        - *Requirements*: 可用性要求

    - [x] 12.2. Sidebar 導航
        - *Goal*: 實作側邊欄選單
        - *Details*:
          - 建立 `frontend/src/components/Layout/Sidebar.tsx`
          - 選單項目: Dashboard、專案、模板、公司、聯絡人
          - 使用 react-router-dom NavLink
          - 高亮當前頁面
          - Icon + 文字
        - *Requirements*: 可用性要求

    - [x] 12.3. Header 元件
        - *Goal*: 建立頁首工具列
        - *Details*:
          - 建立 `frontend/src/components/Layout/Header.tsx`
          - 顯示當前頁面標題
          - 顯示用戶頭像和名稱
          - 登出按鈕
          - 設定按鈕 (未來擴展)
        - *Requirements*: 可用性要求

- [x] **13. Dashboard 儀表板**
    - [x] 13.1. 統計卡片
        - *Goal*: 顯示專案統計數據
        - *Details*:
          - 建立 `frontend/src/components/Dashboard/StatsCards.tsx`
          - 顯示各狀態專案數量 (卡片式)
          - 使用 Tailwind 實作 GA 風格卡片
          - 點擊卡片導向對應狀態的專案列表
        - *Requirements*: US-2, AC-7

    - [x] 13.2. 本月收入圖表
        - *Goal*: 顯示本月專案金額統計
        - *Details*:
          - 建立 `frontend/src/components/Dashboard/RevenueChart.tsx`
          - 顯示本月建立專案數量
          - 顯示本月總金額
          - 簡單長條圖或數字卡片
        - *Requirements*: AC-7

    - [x] 13.3. 最近活動列表
        - *Goal*: 顯示最近操作紀錄
        - *Details*:
          - 建立 `frontend/src/components/Dashboard/RecentActivities.tsx`
          - 從 activities collection 讀取最近 10 筆
          - 顯示操作類型、時間、操作者
          - 點擊跳轉到對應資源
        - *Requirements*: AC-7

    - [x] 13.4. 快速操作按鈕
        - *Goal*: 提供常用功能快捷入口
        - *Details*:
          - 建立 "新增專案" 按鈕
          - 建立 "上傳模板" 按鈕
          - 導向對應頁面
        - *Requirements*: AC-7

### Phase 9: UI/UX - 通用元件 (Components)

- [x] **14. 通用元件開發**
    - [x] 14.1. Button 元件
        - *Goal*: 建立統一的按鈕樣式
        - *Details*:
          - 建立 `frontend/src/components/Common/Button.tsx`
          - Variants: primary, secondary, danger
          - Sizes: small, medium, large
          - Loading state
          - Disabled state
        - *Requirements*: 可用性要求

    - [x] 14.2. Input 元件
        - *Goal*: 建立表單輸入元件
        - *Details*:
          - 建立 `frontend/src/components/Common/Input.tsx`
          - 支援各種類型: text, number, date, email, tel
          - Error state 和錯誤訊息
          - Label 和 placeholder
        - *Requirements*: 可用性要求

    - [x] 14.3. Select / Dropdown 元件
        - *Goal*: 建立下拉選單元件
        - *Details*:
          - 建立 `frontend/src/components/Common/Select.tsx`
          - 支援搜尋 (for 公司/聯絡人選擇)
          - 多選模式 (for 模板選擇)
          - 自訂選項渲染
        - *Requirements*: 可用性要求

    - [x] 14.4. Modal / Dialog 元件
        - *Goal*: 建立彈窗元件
        - *Details*:
          - 建立 `frontend/src/components/Common/Modal.tsx`
          - 背景遮罩
          - 關閉按鈕
          - 標題、內容、操作按鈕區域
          - ESC 鍵關閉
        - *Requirements*: 可用性要求

    - [x] 14.5. Toast 通知元件
        - *Goal*: 建立訊息提示元件
        - *Details*:
          - 建立 `frontend/src/components/Common/Toast.tsx`
          - 類型: success, error, warning, info
          - 自動消失 (3 秒)
          - 手動關閉按鈕
          - 堆疊顯示多個 toast
        - *Requirements*: 可用性要求

    - [x] 14.6. Loading 元件
        - *Goal*: 建立載入指示器
        - *Details*:
          - 建立 `frontend/src/components/Common/Loading.tsx`
          - Spinner 動畫
          - 全螢幕遮罩版本
          - Inline 版本
        - *Requirements*: 可用性要求

    - [x] 14.7. 確認對話框元件
        - *Goal*: 建立刪除確認對話框
        - *Details*:
          - 建立 `frontend/src/components/Common/ConfirmDialog.tsx`
          - 顯示警告訊息
          - 確認和取消按鈕
          - 危險操作用紅色強調
        - *Requirements*: 可用性要求

### Phase 10: 測試與部署 (Testing & Deployment)

- [ ] **15. 測試實作**
    - [x] 15.1. 前端 Unit Tests
        - *Goal*: 撰寫前端單元測試
        - *Details*:
          - 測試 utility functions (`codeGenerator`, `validators`)
          - 測試 hooks (`useAuth`, `useProjects`)
          - 測試 components (使用 React Testing Library)
          - 目標覆蓋率 > 80%
        - *Requirements*: 測試策略

    - [x] 15.2. 後端 Unit Tests
        - *Goal*: 撰寫後端單元測試
        - *Details*:
          - 測試 `generate_code()`
          - 測試 `infer_variable_config()`
          - 測試 `validate_project_data()`
          - 測試 `replace_placeholders()`
          - 目標覆蓋率 > 90%
        - *Requirements*: 測試策略

    - [x] 15.3. Integration Tests
        - *Goal*: 撰寫整合測試
        - *Details*:
          - 使用 Firebase Emulator
          - 測試 `create_project` → `generate_documents` 流程
          - 測試 `analyze_template` 流程
          - 測試權限檢查
        - *Requirements*: 測試策略

    - [ ] 15.4. E2E Tests
        - *Goal*: 撰寫端對端測試
        - *Details*:
          - 使用 Cypress
          - 測試完整的建立專案流程
          - 測試上傳模板流程
          - 測試登入/登出流程
        - *Requirements*: 測試策略

- [ ] **16. 部署配置**
    - [x] 16.1. 配置 CI/CD Pipeline
        - *Goal*: 設定自動化測試和部署
        - *Details*:
          - 建立 `.github/workflows/test.yml`
          - 前端測試 job
          - 後端測試 job
          - E2E 測試 job
          - 覆蓋率上傳到 Codecov
        - *Requirements*: 部署要求

    - [x] 16.2. 配置 Staging 環境
        - *Goal*: 建立測試環境
        - *Details*:
          - 建立獨立的 Firebase 專案 (staging)
          - 配置 `.env.staging`
          - 部署腳本: `npm run deploy:staging`
        - *Requirements*: 部署要求

    - [x] 16.3. 配置 Production 環境
        - *Goal*: 建立正式環境
        - *Details*:
          - 建立獨立的 Firebase 專案 (production)
          - 配置 `.env.production`
          - 部署腳本: `npm run deploy:production`
        - *Requirements*: 部署要求

    - [ ] 16.4. 部署到 Firebase
        - *Goal*: 首次部署應用程式
        - *Details*:
          - 建置前端: `npm run build`
          - 部署 Firestore Rules: `firebase deploy --only firestore:rules`
          - 部署 Storage Rules: `firebase deploy --only storage`
          - 部署 Functions: `firebase deploy --only functions`
          - 部署 Hosting: `firebase deploy --only hosting`
        - *Requirements*: 部署要求

### Phase 11: 優化與文檔 (Optimization & Documentation)

- [ ] **17. 效能優化**
    - [x] 17.1. 前端效能優化
        - *Goal*: 提升前端載入和渲染速度
        - *Details*:
          - Code splitting (React.lazy + Suspense)
          - 圖片壓縮和 lazy loading
          - React Query 快取策略
          - 避免不必要的 re-render (React.memo, useMemo)
        - *Requirements*: 效能要求

    - [x] 17.2. Firestore 查詢優化
        - *Goal*: 優化資料庫查詢
        - *Details*:
          - 使用複合索引
          - 分頁載入 (limit + cursor)
          - 避免 N+1 查詢問題
        - *Requirements*: 效能要求

    - [x] 17.3. Cloud Functions 優化
        - *Goal*: 減少 Cold Start 時間
        - *Details*:
          - 使用最小依賴
          - 設定適當的 memory 和 timeout
          - 考慮使用 2nd gen functions
        - *Requirements*: 效能要求

- [ ] **18. 文檔撰寫**
    - [x] 18.1. 用戶使用手冊
        - *Goal*: 編寫使用說明
        - *Details*:
          - 如何建立專案
          - 如何上傳模板
          - 如何管理公司/聯絡人
          - 常見問題 FAQ
        - *Requirements*: 可用性要求

    - [x] 18.2. 開發者文檔
        - *Goal*: 編寫技術文檔
        - *Details*:
          - 專案結構說明
          - 本地開發環境設定
          - 部署流程
          - API 文檔
        - *Requirements*: 可維護性要求

    - [x] 18.3. README 更新
        - *Goal*: 更新專案 README
        - *Details*:
          - 專案簡介
          - 功能清單
          - 技術架構
          - 安裝和運行指南
          - 貢獻指南
        - *Requirements*: 可維護性要求

## Task Dependencies

### 依賴關係圖

```
Phase 1 (Foundation)
  ├─ Task 1, 2, 3 必須最先完成
  └─ 可並行執行

Phase 2 (Data & Migration)
  ├─ 依賴 Phase 1 完成
  ├─ Task 4.1 必須在其他任務前完成 (型別定義)
  └─ Task 5.1, 5.2, 5.3, 5.4 可並行執行

Phase 3 (Auth)
  ├─ 依賴 Phase 1 完成
  └─ Task 6.1, 6.2 必須先完成才能做 6.3, 6.4

Phase 4, 5, 6, 7 (Core Features)
  ├─ 依賴 Phase 1, 2, 3 完成
  ├─ Task 7 (Projects) 依賴 Task 10, 11 (Companies, Contacts)
  ├─ Task 9 (Documents) 依賴 Task 7 (Projects) 和 Task 8 (Templates)
  └─ Task 8 (Templates) 可獨立開發

Phase 8, 9 (UI/UX)
  ├─ Task 14 (Common Components) 優先開發
  ├─ 其他 UI 任務依賴 Task 14
  └─ 可與 Phase 4-7 並行開發

Phase 10 (Testing & Deployment)
  ├─ Task 15.1, 15.2 可在開發階段同步進行
  ├─ Task 15.3, 15.4 依賴核心功能完成
  └─ Task 16 部署依賴所有測試通過

Phase 11 (Optimization & Documentation)
  └─ 依賴所有功能完成
```

### 關鍵路徑

1. **必須先完成**: Phase 1 → Phase 2 → Phase 3
2. **核心功能**: Phase 4-7 可部分並行
3. **UI 開發**: Phase 8-9 可與核心功能並行
4. **測試部署**: Phase 10-11 最後完成

### 並行建議

**Sprint 1 (Foundation)**
- 並行: Task 1, 2, 3

**Sprint 2 (Data Setup)**
- 並行: Task 4.1 先完成 → Task 5.1-5.4 並行

**Sprint 3 (Auth & UI Foundation)**
- 並行: Task 6 (Auth) + Task 14 (Common Components)

**Sprint 4-6 (Core Features)**
- 並行: Task 10, 11 (Companies, Contacts) → Task 7 (Projects) → Task 8 (Templates) → Task 9 (Documents)
- 同時: Task 12, 13 (Dashboard & Layout)

**Sprint 7 (Testing & Deployment)**
- 並行: Task 15.1, 15.2 (Unit Tests)
- 序列: Task 15.3 → 15.4 → Task 16

**Sprint 8 (Polish)**
- 並行: Task 17 (Optimization) + Task 18 (Documentation)

## Estimated Timeline

### 工時估算 (以小時為單位)

#### Phase 1: 基礎設施設置
- Task 1: Firebase 專案初始化 - **4 小時**
- Task 2: 前端專案設置 - **4 小時**
- Task 3: 後端專案設置 - **6 小時**
- **小計: 14 小時**

#### Phase 2: 資料模型與遷移
- Task 4: Firestore Collections 建立 - **6 小時**
- Task 5: 資料遷移腳本 - **12 小時**
- **小計: 18 小時**

#### Phase 3: 認證與權限
- Task 6: 用戶認證系統 - **16 小時**
- **小計: 16 小時**

#### Phase 4: 專案管理
- Task 7: 專案 CRUD 功能 - **32 小時**
  - 7.1 列表頁 (8h)
  - 7.2 建立表單 (10h)
  - 7.3 詳情頁 (6h)
  - 7.4 編輯功能 (4h)
  - 7.5 狀態管理 (4h)
- **小計: 32 小時**

#### Phase 5: 模板管理
- Task 8: 模板 CRUD 功能 - **24 小時**
  - 8.1 列表頁 (4h)
  - 8.2 上傳功能 (8h)
  - 8.3 變數配置器 (6h)
  - 8.4 推斷邏輯 (4h)
  - 8.5 版本管理 (2h)
- **小計: 24 小時**

#### Phase 6: 文件生成
- Task 9: 文件生成引擎 - **28 小時**
  - 9.1 generate_documents (10h)
  - 9.2 替換邏輯 (6h)
  - 9.3 標準變數 (4h)
  - 9.4 編號生成 (2h)
  - 9.5 補生成 (3h)
  - 9.6 重新生成 (2h)
  - 9.7 下載功能 (1h)
- **小計: 28 小時**

#### Phase 7: 公司與聯絡人
- Task 10: 公司管理 - **8 小時**
- Task 11: 聯絡人管理 - **8 小時**
- **小計: 16 小時**

#### Phase 8: Dashboard & Layout
- Task 12: 主版面與導航 - **12 小時**
- Task 13: Dashboard 儀表板 - **16 小時**
- **小計: 28 小時**

#### Phase 9: 通用元件
- Task 14: 通用元件開發 - **20 小時**
  - 14.1-14.7 各種元件
- **小計: 20 小時**

#### Phase 10: 測試與部署
- Task 15: 測試實作 - **24 小時**
  - 15.1 前端測試 (8h)
  - 15.2 後端測試 (8h)
  - 15.3 整合測試 (4h)
  - 15.4 E2E 測試 (4h)
- Task 16: 部署配置 - **8 小時**
- **小計: 32 小時**

#### Phase 11: 優化與文檔
- Task 17: 效能優化 - **12 小時**
- Task 18: 文檔撰寫 - **8 小時**
- **小計: 20 小時**

---

### 總計

**總工時: 248 小時 (約 31 個工作天)**

### 建議時程 (以 Sprint 為單位,每 Sprint 2 週)

- **Sprint 1** (Week 1-2): Phase 1, 2 → 完成基礎設施和資料遷移
- **Sprint 2** (Week 3-4): Phase 3, 9 (部分) → 完成認證和通用元件
- **Sprint 3** (Week 5-6): Phase 7, 8 → 完成公司/聯絡人和 Layout
- **Sprint 4** (Week 7-8): Phase 4 → 完成專案管理
- **Sprint 5** (Week 9-10): Phase 5 → 完成模板管理
- **Sprint 6** (Week 11-12): Phase 6 → 完成文件生成
- **Sprint 7** (Week 13-14): Phase 10 → 完成測試和部署
- **Sprint 8** (Week 15-16): Phase 11 → 優化和文檔

**預計總時程: 16 週 (4 個月)**

### 注意事項

1. 以上估算基於**單人全職開發**
2. 如果是兼職或多人協作,時程需要調整
3. 預留 20% buffer 時間處理未預期的問題
4. 測試應該在開發過程中同步進行,不要等到最後
