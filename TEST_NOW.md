# 🚀 立即測試 AutoDocGen - 5 分鐘快速指南

## ✅ 當前狀態

- ✅ 代碼已推送到 GitHub
- ⚠️ **尚未部署到生產環境**
- ✅ 可以安全地在本地測試

---

## 🎯 推薦測試方式：本地 Emulator（100% 安全）

### 為什麼推薦 Emulator？

- ✅ **完全免費** - 無需付費
- ✅ **100% 安全** - 不影響生產環境
- ✅ **可重置數據** - 隨時重新開始
- ✅ **快速啟動** - 一個命令即可
- ✅ **完整功能** - 所有功能都可測試

---

## 📋 立即開始測試

### 步驟 1: 啟動開發環境（2 分鐘）

```bash
cd /Users/hanfourhuang/Projects/OTHER/autoDocGen

# 一鍵啟動（會自動安裝依賴並啟動服務）
./scripts/start-dev.sh
```

**會看到**：
```
================================
  AutoDocGen Development Server
================================

✓ All prerequisites met
✓ Python environment ready
✓ Frontend dependencies installed

🚀 Starting services...

✓ Firebase Emulators started
✓ Frontend Dev Server started

✅ All services started successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Access URLs:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🌐 Frontend:        http://localhost:3000
  🔥 Emulator UI:     http://localhost:4000
  ⚡ Functions:       http://localhost:5001
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 步驟 2: 導入測試數據（1 分鐘）

**開啟新終端**（保持上面的終端運行）：

```bash
cd /Users/hanfourhuang/Projects/OTHER/autoDocGen

# 導入測試數據
python3 scripts/seed-test-data.py
```

**會看到**：
```
==========================================
  AutoDocGen Test Data Seeder
==========================================

📊 Seeding companies...
✓ Created company: 測試科技有限公司
✓ Created company: 創新設計股份有限公司
✓ Created company: 智能解決方案有限公司

📊 Seeding contacts...
✓ Created contact: 張三 (專案經理)
✓ Created contact: 李四 (技術總監)
✓ Created contact: 王五 (設計主管)
✓ Created contact: 趙六 (業務經理)

📊 Seeding templates...
✓ Created template: 標準報價單 (quotation)
✓ Created template: 合約書模板 (contract)
✓ Created template: 發票模板 (invoice)

📊 Creating sample projects...
✓ Created project: 網站重新設計專案 (in_progress)
✓ Created project: 品牌識別設計 (pending_invoice)

==========================================
✅ Test data seeded successfully!
==========================================

✓ Companies: 3
✓ Contacts: 4
✓ Templates: 3
✓ Projects: 2

ℹ You can view the data in Firebase Emulator UI:
ℹ http://localhost:4000
```

### 步驟 3: 開始測試（2 分鐘）

#### 3.1 訪問前端應用

打開瀏覽器訪問：
```
http://localhost:3000/projects
```

你會看到：
- 2 個預先創建的測試項目
- 項目列表頁面
- 搜索和篩選功能

#### 3.2 測試創建新項目

1. **點擊 "New Project" 按鈕**

2. **填寫表單**：
   - 項目名稱：`測試項目 001`
   - 公司：選擇 `測試科技有限公司`
   - 聯繫人：選擇 `張三`（會自動篩選該公司的聯繫人）
   - 價格：`100000`
   - 日期：選擇今天

3. **選擇模板**：
   - 勾選 `標準報價單`
   - 勾選 `合約書模板`

4. **填寫額外字段**（如果有）：
   - 付款條件：`貨到付款`
   - 交付日期：`2025-12-31`

5. **點擊 "Create & Generate"**

6. **觀察三步流程**：
   ```
   ⏳ 創建中... → 設置項目
   ⏳ 生成中... → 調用 Cloud Function 生成文檔
   ✅ 完成！ → 自動跳轉到項目詳情
   ```

#### 3.3 查看項目詳情

自動跳轉後，你會看到：
- ✅ 項目基本信息
- ✅ 公司和聯繫人詳情
- ✅ 生成的文檔列表
- ✅ 下載/重新生成按鈕
- ✅ 狀態管理

#### 3.4 測試其他功能

**編輯項目**：
- 點擊 "Edit" 按鈕
- 修改項目信息
- 保存

**更改狀態**：
- 點擊 "Change Status"
- 選擇新狀態（如 `in_progress`）
- 確認

**查看 Emulator UI**：
訪問 http://localhost:4000
- 查看 Firestore 數據
- 查看 Functions 執行日誌
- 查看 Storage 文件

---

## 🔍 查看背後發生了什麼

### Emulator UI (http://localhost:4000)

#### Firestore 標籤
- 查看所有集合（projects, companies, contacts, templates）
- 查看實時數據變化
- 手動編輯數據

#### Functions 標籤
- 查看 Function 執行日誌
- 查看 `create_project` 調用
- 查看 `generate_documents` 調用
- 查看任何錯誤信息

#### Storage 標籤
- 查看上傳的模板文件
- 查看生成的文檔（如果有）

---

## ✅ 測試檢查清單

### 基礎功能
- [ ] 訪問項目列表頁
- [ ] 看到 2 個預先創建的項目
- [ ] 搜索功能正常
- [ ] 篩選功能正常
- [ ] 排序功能正常

### 創建項目
- [ ] 點擊 "New Project" 成功
- [ ] 表單正確顯示
- [ ] 公司列表顯示 3 個選項
- [ ] 選擇公司後聯繫人自動篩選
- [ ] 模板列表顯示 3 個選項
- [ ] 選擇模板後額外字段正確顯示
- [ ] 提交後看到三步進度
- [ ] 自動跳轉到詳情頁

### 項目詳情
- [ ] 項目信息正確顯示
- [ ] 公司信息正確顯示
- [ ] 聯繫人信息正確顯示
- [ ] 生成的文檔列表顯示
- [ ] "Edit" 按鈕可點擊
- [ ] "Change Status" 可用

### 編輯項目
- [ ] 表單預填充當前數據
- [ ] 可以修改信息
- [ ] 保存後成功跳轉
- [ ] 數據已更新

### 狀態管理
- [ ] 狀態更改模態框打開
- [ ] 6 個狀態選項顯示
- [ ] 更改成功
- [ ] 狀態歷史記錄更新

---

## 🐛 如果遇到問題

### 前端無法訪問

```bash
# 檢查前端是否運行
ps aux | grep vite

# 手動啟動
cd frontend
npm run dev
```

### Emulators 無法啟動

```bash
# 檢查端口是否被佔用
lsof -i :4000
lsof -i :5001
lsof -i :8080

# 重新啟動
firebase emulators:start
```

### 測試數據導入失敗

```bash
# 確保 Emulators 正在運行
# 查看錯誤信息
python3 scripts/seed-test-data.py

# 手動在 Emulator UI 添加數據
# 訪問 http://localhost:4000
```

### Cloud Functions 錯誤

```bash
# 查看 Functions 日誌
# 訪問 http://localhost:4000
# 點擊 "Logs" 標籤

# 或查看終端輸出
```

---

## 🎯 下一步

### 如果測試成功

1. **探索更多功能**
   - 創建多個項目
   - 測試不同的模板組合
   - 測試搜索和篩選

2. **查看代碼**
   - 前端代碼：`frontend/src/pages/Projects/`
   - 後端代碼：`functions/src/`

3. **考慮部署**
   - 閱讀 `docs/SAFE_DEPLOYMENT.md`
   - 先部署到開發環境測試
   - 再考慮生產環境

### 如果想部署到真實環境

參閱詳細指南：
```
docs/SAFE_DEPLOYMENT.md
```

---

## 📞 需要幫助？

- 📖 查看文檔：`docs/`
- 🐙 查看 GitHub：https://github.com/hanfour/autodocgen
- 📧 報告問題：https://github.com/hanfour/autodocgen/issues

---

## 🎉 享受測試！

**記住**：
- ✅ Emulator 是完全安全的
- ✅ 可以隨時重置數據
- ✅ 不會影響任何生產環境
- ✅ 所有功能都可以測試

**現在就開始**：
```bash
./scripts/start-dev.sh
```

祝測試愉快！🚀
