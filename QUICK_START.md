# 🚀 AutoDocGen 快速启动指南

本指南将帮助你在 5 分钟内启动整个 AutoDocGen 系统。

## 前提条件

确保已安装：
- ✅ Node.js 18+
- ✅ Python 3.11+
- ✅ Firebase CLI (`npm install -g firebase-tools`)

## 步骤 1: 后端准备 (2 分钟)

### 1.1 安装 Python 依赖

```bash
cd functions
python3 -m venv venv
source venv/bin/activate  # Mac/Linux
# 或 venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### 1.2 验证安装

```bash
python test_functions.py
```

应该看到：
```
✓ All tests passed! Functions are ready for deployment.
```

## 步骤 2: 前端准备 (2 分钟)

### 2.1 安装 Node 依赖

```bash
cd ../frontend
npm install
```

### 2.2 配置环境变量

确认 `.env.local` 文件存在并包含：

```env
# 使用 Firebase Emulators (本地开发)
VITE_USE_EMULATOR=true
VITE_FIRESTORE_EMULATOR_HOST=localhost:8080
VITE_AUTH_EMULATOR_HOST=localhost:9099
VITE_STORAGE_EMULATOR_HOST=localhost:9199
VITE_FUNCTIONS_EMULATOR_HOST=localhost:5001

# Firebase 配置（生产环境）
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=autodocgen-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=autodocgen-prod
VITE_FIREBASE_STORAGE_BUCKET=autodocgen-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 步骤 3: 启动系统 (1 分钟)

### 方式 A: 使用启动脚本（推荐）

```bash
# 在项目根目录
./scripts/start-dev.sh
```

### 方式 B: 手动启动

**终端 1 - Firebase Emulators:**
```bash
firebase emulators:start
```

**终端 2 - 前端开发服务器:**
```bash
cd frontend
npm run dev
```

## 步骤 4: 访问系统

- 🌐 **前端界面**: http://localhost:3000
- 🔥 **Firebase Emulator UI**: http://localhost:4000
- ⚡ **Cloud Functions**: http://localhost:5001

## 步骤 5: 准备测试数据

在 Firebase Emulator UI (http://localhost:4000) 中创建测试数据：

### 5.1 创建公司 (companies 集合)

点击 Firestore → Start Collection → 输入 `companies`

添加文档：
```json
{
  "company_name": "测试科技公司",
  "address": "台北市信义区信义路五段7号",
  "tax_id": "12345678",
  "phone": "02-2345-6789",
  "email": "info@test-company.com",
  "created_at": "2025-10-28T00:00:00Z",
  "created_by": "test-user"
}
```

### 5.2 创建联系人 (contacts 集合)

添加到 `contacts` 集合：
```json
{
  "contact_name": "张三",
  "email": "zhang@test-company.com",
  "phone": "0912-345-678",
  "position": "项目经理",
  "company_ref": "companies/{刚创建的公司ID}",
  "created_at": "2025-10-28T00:00:00Z",
  "created_by": "test-user"
}
```

### 5.3 创建模板 (templates 集合)

添加到 `templates` 集合：
```json
{
  "name": "报价单模板",
  "type": "quotation",
  "description": "标准报价单模板",
  "file_path": "templates/quotation-template.docx",
  "file_name": "quotation-template.docx",
  "file_size": 50000,
  "variables": {
    "standard": [
      "project_name",
      "company_name",
      "contact_name",
      "contact_email",
      "contact_phone",
      "price",
      "price_before_tax",
      "tax_amount",
      "date",
      "year",
      "month",
      "day",
      "document_number"
    ],
    "extra": [
      "payment_terms",
      "delivery_date",
      "warranty_period"
    ]
  },
  "is_active": true,
  "created_at": "2025-10-28T00:00:00Z",
  "created_by": "test-user",
  "version": 1
}
```

### 5.4 上传模板文件到 Storage

1. 进入 Storage 标签
2. 创建 `templates` 文件夹
3. 上传一个包含占位符的 Word 文档
   - 占位符格式: `{{project_name}}`, `{{company_name}}` 等

**示例 Word 模板内容：**
```
报价单

项目名称：{{project_name}}
客户公司：{{company_name}}
联系人：{{contact_name}}
联系电话：{{contact_phone}}
电子邮件：{{contact_email}}

报价金额：NT$ {{price}}
未税金额：NT$ {{price_before_tax}}
税额 (5%)：NT$ {{tax_amount}}

日期：{{year}}年{{month}}月{{day}}日
文档编号：{{document_number}}

付款条件：{{payment_terms}}
交付日期：{{delivery_date}}
保固期限：{{warranty_period}}
```

## 步骤 6: 测试完整流程

### 6.1 访问项目列表
打开 http://localhost:3000/projects

### 6.2 创建新项目
1. 点击 "New Project" 按钮
2. 填写表单：
   - 项目名称: "测试项目 001"
   - 选择刚创建的公司
   - 选择刚创建的联系人
   - 价格: 100000
   - 日期: 今天
3. 选择模板
4. 填写额外字段：
   - 付款条件: "货到付款"
   - 交付日期: "2025-11-30"
   - 保固期限: "1年"
5. 点击 "Create & Generate"

### 6.3 观察创建流程
你会看到三步进度：
1. ⏳ 创建中... → 创建项目记录
2. ⏳ 生成中... → 调用 Cloud Function 生成文档
3. ✅ 完成！ → 自动跳转到项目详情页

### 6.4 查看项目详情
在详情页面你可以：
- 查看项目基本信息
- 查看生成的文档列表
- 点击 "Download" 下载文档
- 点击 "Regenerate" 重新生成文档
- 点击 "Change Status" 更改项目状态
- 点击 "Edit" 编辑项目信息

## 常见问题

### Q1: 前端启动失败
**A:** 确保已安装所有依赖：
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Q2: Cloud Functions 调用失败
**A:** 检查 Emulator 是否运行：
```bash
# 终端 1
firebase emulators:start

# 终端 2 - 查看日志
firebase emulators:logs --only functions
```

### Q3: 找不到公司/联系人
**A:** 确保在 Emulator UI 中创建了测试数据，并且 `company_ref` 引用正确。

### Q4: 文档生成失败
**A:**
1. 检查模板文件是否上传到 Storage
2. 检查 `file_path` 是否正确
3. 查看 Functions 日志了解具体错误

### Q5: 环境变量不生效
**A:** Vite 使用 `VITE_` 前缀，确保环境变量名称正确：
- ✅ `VITE_FIREBASE_API_KEY`
- ❌ `REACT_APP_FIREBASE_API_KEY`

## 下一步

- 📖 阅读完整集成指南: `docs/INTEGRATION_GUIDE.md`
- 🔧 查看 Cloud Functions 文档: `docs/CLOUD_FUNCTIONS_SETUP.md`
- 📊 查看部署总结: `docs/DEPLOYMENT_SUMMARY.md`

## 获取帮助

如果遇到问题：
1. 查看 Firebase Emulator UI 的日志
2. 查看浏览器控制台的错误
3. 查看 Functions 终端的输出
4. 参考 `docs/` 目录下的详细文档

---

**祝你使用愉快！** 🎉

如果一切顺利，你现在应该已经有一个完全运行的 AutoDocGen 系统了！
