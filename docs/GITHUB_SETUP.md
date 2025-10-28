# GitHub 倉庫設置指南

本指南幫助你將 AutoDocGen 推送到 GitHub 並配置 CI/CD。

---

## 📦 首次推送到 GitHub

### 步驟 1: 初始化 Git (如果還沒有)

```bash
cd /Users/hanfourhuang/Projects/OTHER/autoDocGen

# 初始化 git (如果還沒有)
git init

# 添加所有文件
git add .

# 首次提交
git commit -m "feat: initial commit - complete project management module"
```

### 步驟 2: 連接到 GitHub

```bash
# 添加遠程倉庫
git remote add origin git@github.com:hanfour/autodocgen.git

# 檢查遠程倉庫
git remote -v
```

### 步驟 3: 推送代碼

```bash
# 推送到 main 分支
git branch -M main
git push -u origin main
```

---

## 🔐 配置 GitHub Secrets

為了讓 GitHub Actions 正常工作，需要配置以下 Secrets：

### 導航到 Settings

1. 前往 https://github.com/hanfour/autodocgen
2. 點擊 "Settings"
3. 側邊欄點擊 "Secrets and variables" → "Actions"
4. 點擊 "New repository secret"

### 需要配置的 Secrets

#### Firebase 配置

| Secret 名稱 | 值 | 描述 |
|------------|-----|------|
| `VITE_FIREBASE_API_KEY` | `AIzaSy...` | Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `autodocgen-prod.firebaseapp.com` | Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | `autodocgen-prod` | Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `autodocgen-prod.firebasestorage.app` | Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `853262845197` | Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | `1:853262845197:web:...` | App ID |

#### Firebase 部署 Token

```bash
# 在本地生成 Firebase token
firebase login:ci

# 複製輸出的 token
```

| Secret 名稱 | 值 | 描述 |
|------------|-----|------|
| `FIREBASE_TOKEN` | `1//...` | Firebase CI Token |

### 配置步驟

```bash
# 1. 生成 Firebase Token
firebase login:ci

# 2. 複製顯示的 token

# 3. 在 GitHub 添加 Secret:
#    - Name: FIREBASE_TOKEN
#    - Value: [粘貼 token]
```

---

## ⚙️ GitHub Actions 工作流

我們已經創建了兩個工作流：

### 1. CI 工作流 (`.github/workflows/ci.yml`)

**觸發條件:**
- Push 到 `main` 或 `develop` 分支
- Pull Request 到 `main` 或 `develop` 分支

**執行內容:**
- ✅ 後端測試 (Python)
- ✅ 前端構建和類型檢查
- ✅ 代碼質量檢查

### 2. Deploy 工作流 (`.github/workflows/deploy.yml`)

**觸發條件:**
- Push 到 `main` 分支
- 手動觸發

**執行內容:**
- ✅ 構建前端
- ✅ 部署到 Firebase Hosting
- ✅ 部署 Cloud Functions
- ✅ 更新 Firestore/Storage 規則

---

## 🌿 分支策略

### 主要分支

```
main          # 生產環境
  ↑
develop       # 開發環境
  ↑
feature/*     # 功能分支
```

### 工作流程

```bash
# 1. 從 develop 創建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/your-feature

# 2. 開發並提交
git add .
git commit -m "feat: your feature"

# 3. 推送到遠程
git push origin feature/your-feature

# 4. 在 GitHub 創建 PR (feature → develop)

# 5. 審查通過後合併到 develop

# 6. 測試完成後，PR (develop → main) 觸發部署
```

---

## 📋 提交前檢查清單

在推送代碼前，確保：

### 代碼質量

- [ ] 所有測試通過
  ```bash
  cd functions && python test_functions.py
  ```

- [ ] 前端類型檢查通過
  ```bash
  cd frontend && npm run lint
  ```

- [ ] 前端構建成功
  ```bash
  cd frontend && npm run build
  ```

### 安全性

- [ ] 沒有提交敏感信息
  ```bash
  # 檢查 git 狀態
  git status

  # 檢查將要提交的內容
  git diff --cached
  ```

- [ ] `.env.local` 沒有被追蹤
  ```bash
  git ls-files | grep env.local
  # 應該沒有輸出
  ```

- [ ] `serviceAccountKey.json` 沒有被追蹤
  ```bash
  git ls-files | grep serviceAccountKey
  # 應該沒有輸出
  ```

### 文檔

- [ ] 更新了相關文檔
- [ ] PR 描述清晰
- [ ] 提交訊息符合規範

---

## 🔍 常見問題

### Q: 推送失敗: "Permission denied"

**A:** 檢查 SSH key 配置

```bash
# 測試 SSH 連接
ssh -T git@github.com

# 應該看到: Hi hanfour! You've successfully authenticated...
```

如果失敗，設置 SSH key：
```bash
# 生成新的 SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# 添加到 ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 複製公鑰到 GitHub
cat ~/.ssh/id_ed25519.pub
# 前往 GitHub Settings → SSH Keys → Add SSH Key
```

### Q: GitHub Actions 失敗

**A:** 檢查 Secrets 配置

1. 確認所有 Secrets 都已添加
2. 檢查 Secret 名稱拼寫
3. 查看 Actions 日誌了解具體錯誤

### Q: 部署失敗

**A:** 檢查 Firebase Token

```bash
# 重新生成 token
firebase login:ci

# 更新 GitHub Secret: FIREBASE_TOKEN
```

### Q: 如何回滾部署？

**A:** 使用 Firebase Console 或 CLI

```bash
# 查看部署歷史
firebase hosting:releases:list

# 回滾到特定版本
firebase hosting:rollback
```

---

## 📊 監控部署狀態

### GitHub Actions

查看工作流狀態：
- https://github.com/hanfour/autodocgen/actions

### Firebase Console

查看部署狀態：
- https://console.firebase.google.com/project/autodocgen-prod

### 部署網址

- **Production**: https://autodocgen-prod.web.app
- **Preview**: 每個 PR 會自動生成預覽 URL

---

## 🎯 下一步

完成 GitHub 設置後：

1. **設置分支保護**
   - Settings → Branches → Add rule
   - 要求 PR review
   - 要求 status checks 通過

2. **配置 Dependabot**
   - Settings → Security → Dependabot
   - 啟用自動依賴更新

3. **添加 README badges**
   - Build status
   - Coverage
   - Version

4. **設置項目板**
   - Projects → New project
   - 使用 Kanban 模板
   - 追蹤開發進度

---

## 📚 相關資源

- [GitHub Actions 文檔](https://docs.github.com/en/actions)
- [Firebase CI/CD 文檔](https://firebase.google.com/docs/hosting/github-integration)
- [Git 工作流程](https://www.atlassian.com/git/tutorials/comparing-workflows)

---

## 🎉 完成！

你的 GitHub 倉庫現在已經完全配置好了！

**推送代碼:**
```bash
git add .
git commit -m "docs: add GitHub setup guide"
git push origin main
```

前往 https://github.com/hanfour/autodocgen 查看你的項目！
