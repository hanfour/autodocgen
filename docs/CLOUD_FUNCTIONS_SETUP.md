# Cloud Functions Setup Guide

## 已完成的 Cloud Functions

我们已经实现了以下核心 Cloud Functions：

### 1. 文档生成
- ✅ `generate_documents` - 生成多个文档
- ✅ `regenerate_document` - 重新生成单个文档
- ✅ `replace_placeholders` - 变量替换逻辑

### 2. 模板管理
- ✅ `analyze_template` - 分析模板变量

### 3. 项目管理
- ✅ `create_project` - 创建项目
- ✅ `update_project_status` - 更新项目状态

### 4. 工具函数
- ✅ `prepare_standard_variables` - 准备标准变量
- ✅ `generate_document_number` - HIYES 编号生成
- ✅ `find_placeholders` - 查找模板变量

## 设置步骤

### 1. 安装 Python 依赖

```bash
cd functions
python3 -m venv venv
source venv/bin/activate  # Mac/Linux
# 或 venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### 2. 配置 Firebase

确保 `firebase.json` 中已配置 Python runtime：

```json
{
  "functions": [
    {
      "codebase": "default",
      "source": "functions",
      "runtime": "python311",
      "ignore": ["venv", ".git"]
    }
  ]
}
```

### 3. 本地测试（使用 Emulator）

```bash
# 启动 Firebase Emulators
firebase emulators:start

# 在另一个终端测试 Function
curl -X POST http://localhost:5001/autodocgen-prod/us-central1/create_project \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "project_name": "Test Project",
      "company_ref": "companies/test-company-id",
      "contact_ref": "contacts/test-contact-id",
      "price": 10000,
      "date": "2025-10-28"
    }
  }'
```

### 4. 部署到 Firebase

```bash
# 部署所有 Functions
firebase deploy --only functions

# 或部署特定 Function
firebase deploy --only functions:generate_documents
```

## 使用示例

### 前端调用 Cloud Function

```typescript
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/firebase/config';

// 创建项目
const createProject = httpsCallable(functions, 'create_project');
const result = await createProject({
  project_name: 'New Project',
  company_ref: 'companies/company-123',
  contact_ref: 'contacts/contact-456',
  price: 50000,
  date: '2025-10-28'
});

console.log('Project created:', result.data.project_id);

// 生成文档
const generateDocs = httpsCallable(functions, 'generate_documents');
const docResult = await generateDocs({
  project_id: result.data.project_id,
  template_ids: ['template-1', 'template-2']
});

console.log('Documents generated:', docResult.data.document_ids);
```

## 文件结构

```
functions/
├── requirements.txt                 # Python 依赖
├── src/
│   ├── main.py                     # 入口文件
│   ├── documents/
│   │   ├── generate.py             # 文档生成
│   │   ├── regenerate.py           # 重新生成
│   │   └── placeholders.py         # 变量替换
│   ├── projects/
│   │   ├── create.py               # 创建项目
│   │   ├── update_status.py        # 更新状态
│   │   └── variables.py            # 标准变量
│   ├── templates/
│   │   └── analyze.py              # 模板分析
│   └── utils/
│       └── document_number.py      # 编号生成
```

## 环境变量

Cloud Functions 会自动获取 Firebase 配置，无需额外设置。

## 错误处理

所有 Functions 都包含：
- ✅ 身份验证检查
- ✅ 参数验证
- ✅ 权限检查
- ✅ 详细错误消息
- ✅ 活动日志记录

## 下一步

1. **本地测试** Cloud Functions
2. **部署到 Firebase**
3. **集成到前端**：创建调用这些 Functions 的 React 组件
4. **端到端测试**：完整流程测试

## 注意事项

- ⚠️ 确保 Firebase Storage 已启用
- ⚠️ 确保 Firestore 已配置正确的 Security Rules
- ⚠️ 本地测试时使用 Firebase Emulators
- ⚠️ 生产环境需要配置适当的计费方案（Functions 需要 Blaze 计划）
