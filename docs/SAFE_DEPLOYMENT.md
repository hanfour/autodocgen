# 安全部署指南

## 🎯 部署策略概覽

### 環境分離策略

```
本地開發環境 (Emulators)
    ↓ 測試通過
開發環境 (Firebase Dev Project)
    ↓ 驗證通過
生產環境 (Firebase Production Project)
```

---

## 🧪 方案 A: 本地 Emulator 測試（推薦開始）

### 優點
- ✅ 完全免費
- ✅ 100% 安全
- ✅ 可以重置數據
- ✅ 快速迭代

### 步驟

```bash
# 1. 啟動 Emulators
cd /Users/hanfourhuang/Projects/OTHER/autoDocGen
./scripts/start-dev.sh

# 2. 導入測試數據
# 等 Emulators 啟動後，在新終端執行：
python3 scripts/seed-test-data.py

# 3. 訪問應用
# 前端: http://localhost:3000
# Emulator UI: http://localhost:4000
```

### 測試檢查清單

#### 基礎功能
- [ ] 訪問項目列表頁
- [ ] 查看測試數據是否正確顯示
- [ ] 測試搜索功能
- [ ] 測試篩選功能
- [ ] 測試排序功能

#### 創建項目
- [ ] 點擊 "New Project"
- [ ] 選擇公司（應該看到 3 個測試公司）
- [ ] 選擇聯繫人（級聯選擇）
- [ ] 選擇模板
- [ ] 填寫額外字段
- [ ] 提交並觀察三步流程

#### 項目管理
- [ ] 查看項目詳情
- [ ] 編輯項目信息
- [ ] 更改項目狀態
- [ ] 查看狀態歷史

#### Cloud Functions
- [ ] 檢查 Emulator UI 的 Functions 日誌
- [ ] 確認 `create_project` 被調用
- [ ] 確認 `generate_documents` 被調用
- [ ] 檢查是否有錯誤

---

## 🔧 方案 B: 創建開發環境（適合深度測試）

### 1. 創建新的 Firebase 開發項目

```bash
# 訪問 Firebase Console
# https://console.firebase.google.com/

# 點擊 "Add project"
# 項目名稱: autodocgen-dev
# 項目 ID: autodocgen-dev（或其他可用 ID）
```

### 2. 配置開發環境

#### 創建 .firebaserc.dev
```json
{
  "projects": {
    "default": "autodocgen-prod",
    "dev": "autodocgen-dev"
  }
}
```

#### 創建 frontend/.env.development
```env
# 開發環境配置
VITE_USE_EMULATOR=false
VITE_FIREBASE_API_KEY=開發環境的 API Key
VITE_FIREBASE_AUTH_DOMAIN=autodocgen-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=autodocgen-dev
VITE_FIREBASE_STORAGE_BUCKET=autodocgen-dev.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=開發環境的 ID
VITE_FIREBASE_APP_ID=開發環境的 App ID
```

### 3. 部署到開發環境

```bash
# 切換到開發項目
firebase use dev

# 部署 Firestore 規則
firebase deploy --only firestore:rules

# 部署 Storage 規則
firebase deploy --only storage

# 部署 Functions
firebase deploy --only functions

# 部署前端
cd frontend
npm run build
firebase deploy --only hosting
```

### 4. 驗證部署

```bash
# 訪問開發環境
https://autodocgen-dev.web.app

# 檢查 Firebase Console
https://console.firebase.google.com/project/autodocgen-dev
```

---

## 🚀 方案 C: 部署到生產環境（謹慎操作）

### ⚠️ 重要警告

**在部署到生產環境前，確保：**
- ✅ 已在 Emulator 中完整測試
- ✅ 已在開發環境驗證
- ✅ 已備份現有生產數據
- ✅ 已審查所有代碼變更
- ✅ 已測試回滾流程

### 準備工作

#### 1. 備份生產數據

```bash
# 導出 Firestore 數據
gcloud firestore export gs://autodocgen-prod.appspot.com/backups/$(date +%Y%m%d)

# 或使用 Firebase Console 手動導出
```

#### 2. 配置 GitHub Secrets

訪問：https://github.com/hanfour/autodocgen/settings/secrets/actions

添加以下 Secrets：

| Secret 名稱 | 值 | 如何獲取 |
|------------|-----|---------|
| `VITE_FIREBASE_API_KEY` | 從 Firebase Console | Project Settings → General |
| `VITE_FIREBASE_AUTH_DOMAIN` | `autodocgen-prod.firebaseapp.com` | Project Settings |
| `VITE_FIREBASE_PROJECT_ID` | `autodocgen-prod` | Project Settings |
| `VITE_FIREBASE_STORAGE_BUCKET` | `autodocgen-prod.appspot.com` | Project Settings |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | 從 Firebase Console | Project Settings |
| `VITE_FIREBASE_APP_ID` | 從 Firebase Console | Project Settings |
| `FIREBASE_TOKEN` | 運行 `firebase login:ci` | 命令行 |

#### 3. 生成 Firebase Token

```bash
# 登出當前用戶
firebase logout

# 重新登錄並生成 CI token
firebase login:ci

# 複製輸出的 token
# 例如: 1//0gxxxxxxxxxxxxxxxxxxx

# 添加到 GitHub Secrets:
# Name: FIREBASE_TOKEN
# Value: [貼上 token]
```

### 手動部署流程

#### 選項 1: 本地手動部署

```bash
# 1. 確認當前項目
firebase use default  # 或 firebase use autodocgen-prod

# 2. 運行測試
cd functions
source venv/bin/activate
python test_functions.py
cd ..

# 3. 構建前端
cd frontend
npm run build
cd ..

# 4. 部署（分步驟）
# 先部署規則
firebase deploy --only firestore:rules,storage

# 確認規則正確後，部署 Functions
firebase deploy --only functions

# 最後部署前端
firebase deploy --only hosting

# 5. 驗證部署
# 訪問: https://autodocgen-prod.web.app
```

#### 選項 2: 通過 GitHub Actions 部署

```bash
# 1. 推送到 main 分支會自動觸發
git push origin main

# 2. 或手動觸發
# 訪問: https://github.com/hanfour/autodocgen/actions
# 選擇 "Deploy to Firebase" workflow
# 點擊 "Run workflow"

# 3. 監控部署
# 在 Actions 頁面查看實時日誌
```

### 部署後驗證

```bash
# 1. 檢查網站可訪問
curl -I https://autodocgen-prod.web.app

# 2. 檢查 Functions 部署
firebase functions:list

# 3. 檢查規則更新
firebase firestore:rules
firebase storage:rules

# 4. 功能測試
# 手動在生產環境創建測試項目
# 驗證文檔生成功能
# 測試權限系統
```

### 回滾流程

如果部署出現問題：

```bash
# Functions 回滾
firebase functions:list  # 查看版本
firebase functions:rollback FUNCTION_NAME

# Hosting 回滾
firebase hosting:releases:list
firebase hosting:rollback

# Firestore 規則回滾
# 在 Firebase Console 手動恢復之前的版本
```

---

## 🔄 推薦的工作流程

### 日常開發

```
1. 本地開發 (Emulators)
   ↓
2. 提交到 feature 分支
   ↓
3. 創建 Pull Request
   ↓
4. CI 自動測試通過
   ↓
5. Code Review
   ↓
6. 合併到 develop 分支
   ↓
7. 部署到開發環境測試
   ↓
8. 測試通過後合併到 main
   ↓
9. 部署到生產環境
```

### 緊急修復

```
1. 從 main 創建 hotfix 分支
   ↓
2. 修復 bug
   ↓
3. 在 Emulator 測試
   ↓
4. 直接合併到 main
   ↓
5. 立即部署到生產環境
   ↓
6. 同步到 develop 分支
```

---

## 📋 部署檢查清單

### 部署前

- [ ] 所有測試通過
- [ ] 代碼已審查
- [ ] 文檔已更新
- [ ] 已在 Emulator 測試
- [ ] 已在開發環境驗證
- [ ] 已備份生產數據
- [ ] 已通知團隊成員

### 部署中

- [ ] 監控部署日誌
- [ ] 檢查錯誤信息
- [ ] 驗證每個步驟成功

### 部署後

- [ ] 驗證網站可訪問
- [ ] 測試關鍵功能
- [ ] 檢查 Functions 日誌
- [ ] 監控錯誤率
- [ ] 驗證性能指標
- [ ] 通知團隊部署完成

---

## 🚨 緊急情況處理

### 如果生產環境出現問題

1. **立即回滾**
   ```bash
   firebase hosting:rollback
   ```

2. **禁用有問題的 Function**
   ```bash
   firebase functions:delete FUNCTION_NAME
   ```

3. **恢復數據庫**
   ```bash
   gcloud firestore import gs://autodocgen-prod.appspot.com/backups/BACKUP_ID
   ```

4. **通知用戶**
   - 更新狀態頁面
   - 發送通知郵件
   - 在社交媒體更新狀態

---

## 💡 最佳實踐

1. **總是使用 Emulator 開發**
   - 快速迭代
   - 零成本
   - 可重置

2. **使用分支策略**
   - `main` - 生產環境
   - `develop` - 開發環境
   - `feature/*` - 功能開發

3. **自動化測試**
   - 單元測試
   - 集成測試
   - E2E 測試

4. **監控和日誌**
   - Firebase Analytics
   - Error Reporting
   - Performance Monitoring

5. **定期備份**
   - 每日自動備份
   - 重要操作前手動備份
   - 定期測試恢復流程

---

## 📞 獲取幫助

如果遇到部署問題：

1. 查看 Firebase Console 錯誤日誌
2. 查看 GitHub Actions 日誌
3. 查看本地 Emulator 日誌
4. 參考 Firebase 文檔

---

**記住：謹慎部署，安全第一！** 🔒
