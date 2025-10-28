# 貢獻指南

感謝你考慮為 AutoDocGen 做出貢獻！

## 📋 目錄

- [行為準則](#行為準則)
- [如何貢獻](#如何貢獻)
- [開發流程](#開發流程)
- [代碼規範](#代碼規範)
- [提交指南](#提交指南)
- [測試要求](#測試要求)

---

## 📜 行為準則

本項目遵循 [Contributor Covenant](https://www.contributor-covenant.org/) 行為準則。參與此項目即表示你同意遵守其條款。

### 我們的承諾

- 尊重不同的觀點和經驗
- 接受建設性的批評
- 關注對社群最有利的事情
- 對其他社群成員表現同理心

---

## 🤝 如何貢獻

### 報告 Bug

1. 檢查 [Issues](https://github.com/hanfour/autodocgen/issues) 確保問題未被報告
2. 使用 Bug Report 模板創建新 issue
3. 提供詳細的重現步驟
4. 包含環境資訊和錯誤日誌

### 建議新功能

1. 檢查現有的 feature requests
2. 使用 Feature Request 模板
3. 清楚描述功能和使用場景
4. 討論實現方案

### 提交 Pull Request

1. Fork 此倉庫
2. 創建功能分支：`git checkout -b feature/AmazingFeature`
3. 進行變更並提交
4. 推送到你的 fork：`git push origin feature/AmazingFeature`
5. 開啟 Pull Request

---

## 🔄 開發流程

### 1. 環境設置

```bash
# 克隆你的 fork
git clone git@github.com:YOUR_USERNAME/autodocgen.git
cd autodocgen

# 添加上游倉庫
git remote add upstream git@github.com:hanfour/autodocgen.git

# 安裝依賴
cd functions && pip install -r requirements.txt && cd ..
cd frontend && npm install && cd ..
```

### 2. 創建分支

```bash
# 從 main 分支創建新分支
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

### 3. 開發

```bash
# 啟動開發環境
./scripts/start-dev.sh

# 前端開發服務器：http://localhost:3000
# Emulator UI：http://localhost:4000
```

### 4. 測試

```bash
# 運行後端測試
cd functions
source venv/bin/activate
python test_functions.py

# 運行前端測試（待實現）
cd frontend
npm test
```

### 5. 提交

```bash
# 添加變更
git add .

# 提交（遵循提交規範）
git commit -m "feat: add amazing feature"

# 推送到你的 fork
git push origin feature/your-feature-name
```

### 6. 開啟 Pull Request

1. 前往 GitHub 上你的 fork
2. 點擊 "New Pull Request"
3. 選擇你的分支
4. 填寫 PR 模板
5. 等待審查

---

## 📝 代碼規範

### Python (後端)

**風格指南**: PEP 8

```python
# ✅ 好的例子
def calculate_tax(price: float) -> float:
    """
    Calculate 5% tax amount.

    Args:
        price: The base price

    Returns:
        The tax amount
    """
    return price * 0.05


# ❌ 壞的例子
def calc_tax(p):
    return p*0.05
```

**關鍵原則:**
- 使用類型註解
- 編寫完整的 docstrings
- 函數名使用 snake_case
- 類名使用 PascalCase
- 每行最多 88 字符

### TypeScript (前端)

**風格指南**: ESLint + Prettier

```typescript
// ✅ 好的例子
interface Project {
  id: string;
  name: string;
  status: ProjectStatus;
}

const createProject = async (data: CreateProjectData): Promise<Project> => {
  // Implementation
};


// ❌ 壞的例子
const createProject = async (data: any) => {
  // Implementation
};
```

**關鍵原則:**
- 嚴格的類型檢查
- 函數式組件優先
- 使用 camelCase
- 接口/類型使用 PascalCase
- 避免使用 `any`

### 文件命名

**Python:**
- 模組: `snake_case.py`
- 類: `PascalCase` 在文件中

**TypeScript/React:**
- 組件: `PascalCase.tsx`
- 工具: `camelCase.ts`
- 類型: `types.ts` 或 `*.types.ts`

---

## 💬 提交規範

我們使用 [Conventional Commits](https://www.conventionalcommits.org/) 規範。

### 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat`: 新功能
- `fix`: Bug 修復
- `docs`: 文檔變更
- `style`: 代碼格式（不影響功能）
- `refactor`: 重構
- `test`: 測試相關
- `chore`: 構建過程或輔助工具變更
- `perf`: 性能優化

### Scope (可選)

- `frontend`: 前端變更
- `backend`: 後端變更
- `functions`: Cloud Functions
- `docs`: 文檔
- `ci`: CI/CD

### 範例

```bash
# 新功能
git commit -m "feat(frontend): add project status filter"

# Bug 修復
git commit -m "fix(backend): resolve document generation error"

# 文檔
git commit -m "docs: update quick start guide"

# 重構
git commit -m "refactor(functions): simplify variable replacement logic"
```

---

## 🧪 測試要求

### 必要測試

所有 PR 必須包含：

**後端 (Python):**
- 單元測試覆蓋新代碼
- 所有現有測試通過
- 測試關鍵路徑和邊界情況

**前端 (TypeScript):**
- 組件測試（待實現框架）
- 關鍵功能測試
- 類型檢查通過

### 運行測試

```bash
# 後端測試
cd functions
source venv/bin/activate
python test_functions.py

# 前端類型檢查
cd frontend
npm run lint

# 前端構建測試
npm run build
```

---

## 📊 Pull Request 審查流程

### 審查標準

你的 PR 將根據以下標準審查：

1. **代碼質量**
   - 遵循代碼規範
   - 清晰的命名和註釋
   - 無不必要的複雜性

2. **功能完整性**
   - 實現完整
   - 處理邊界情況
   - 錯誤處理完善

3. **測試覆蓋**
   - 包含適當的測試
   - 測試通過
   - 覆蓋關鍵路徑

4. **文檔**
   - 代碼註釋完整
   - 更新相關文檔
   - PR 描述清晰

### 審查時間

- 初次審查：通常 2-3 個工作日
- 後續回覆：1-2 個工作日

### 反饋處理

1. 閱讀所有審查意見
2. 回覆或標記已解決
3. 推送更新代碼
4. 請求重新審查

---

## 🎯 優先級指南

### 高優先級

- 🐛 關鍵 Bug 修復
- 🔒 安全性問題
- 📚 文檔錯誤
- ⚡ 性能問題

### 中優先級

- ✨ 新功能
- ♻️ 重構
- 🎨 UI 改進

### 低優先級

- 💅 代碼風格
- 📝 註釋改進
- 🔧 配置優化

---

## 📚 資源

### 文檔

- [快速開始](QUICK_START.md)
- [項目完成報告](PROJECT_COMPLETE.md)
- [集成指南](docs/INTEGRATION_GUIDE.md)
- [Cloud Functions 指南](docs/CLOUD_FUNCTIONS_SETUP.md)

### 技術資源

- [React 文檔](https://react.dev)
- [TypeScript 手冊](https://www.typescriptlang.org/docs)
- [Firebase 文檔](https://firebase.google.com/docs)
- [Python 官方文檔](https://docs.python.org/3/)

---

## 🙋 獲取幫助

### 問題

- 查看現有 [Issues](https://github.com/hanfour/autodocgen/issues)
- 創建新 issue 並清楚描述問題
- 標記適當的 labels

### 討論

- 使用 [Discussions](https://github.com/hanfour/autodocgen/discussions) 進行一般討論
- 提問和分享想法
- 幫助其他貢獻者

### 聯繫

- 📧 Email: support@autodocgen.com
- 🐙 GitHub: [@hanfour](https://github.com/hanfour)

---

## 🎉 感謝你的貢獻！

每一個貢獻，無論大小，都對項目很重要。我們期待看到你的貢獻！

---

<p align="center">Made with ❤️ by AutoDocGen Team</p>
