# 项目管理模块集成指南

## 概述

我们已经完成了项目管理模块的核心功能开发，包括后端 Cloud Functions 和前端页面。本指南将帮助你完成最终的集成和测试。

## 已完成的组件

### 后端 Cloud Functions ✅

所有 Cloud Functions 已实现并位于 `functions/src/`:

1. **文档生成**
   - `generate_documents` - 批量生成文档
   - `regenerate_document` - 重新生成单个文档
   - `replace_placeholders` - 变量替换核心逻辑

2. **项目管理**
   - `create_project` - 创建新项目
   - `update_project_status` - 更新项目状态

3. **模板分析**
   - `analyze_template` - 分析模板中的变量

### 前端页面 ✅

所有项目页面已创建并位于 `frontend/src/pages/Projects/`:

1. **ProjectList.tsx** - 项目列表页
   - 筛选、搜索、排序功能
   - 状态徽章显示
   - 点击导航到详情

2. **CreateProject.tsx** - 创建项目表单
   - 公司/联系人级联选择
   - 模板多选
   - 动态额外字段
   - 三步提交流程

3. **ProjectDetail.tsx** - 项目详情页
   - 完整项目信息展示
   - 文档下载/重新生成
   - 状态管理
   - 分享功能

4. **EditProject.tsx** - 编辑项目
   - 表单预填充
   - 级联选择
   - 验证和保存

## 集成步骤

### 步骤 1: 配置路由

**选项 A: 简单配置（推荐用于快速测试）**

将 `frontend/src/App.example.tsx` 重命名为 `App.tsx`:

```bash
cd frontend/src
mv App.example.tsx App.tsx
```

**选项 B: 完整配置（推荐用于生产环境）**

1. 重命名路由示例文件:
```bash
mv routes.example.tsx routes.tsx
```

2. 在 `App.tsx` 中导入并使用路由配置

### 步骤 2: 创建主入口文件

创建 `frontend/src/index.tsx` (如果不存在):

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 步骤 3: 配置 package.json

确保 `frontend/package.json` 包含所有必要的依赖:

```json
{
  "name": "autodocgen-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "react-hook-form": "^7.48.0",
    "firebase": "^10.7.0",
    "lucide-react": "^0.292.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

### 步骤 4: 配置环境变量

确保 `frontend/.env.local` 已正确配置:

```env
# Firebase 配置
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=autodocgen-prod.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=autodocgen-prod
REACT_APP_FIREBASE_STORAGE_BUCKET=autodocgen-prod.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id

# 使用 Firebase Emulators (本地开发)
REACT_APP_USE_EMULATOR=true
REACT_APP_FIRESTORE_EMULATOR_HOST=localhost:8080
REACT_APP_AUTH_EMULATOR_HOST=localhost:9099
REACT_APP_STORAGE_EMULATOR_HOST=localhost:9199
REACT_APP_FUNCTIONS_EMULATOR_HOST=localhost:5001
```

## 本地测试

### 1. 启动 Firebase Emulators

在项目根目录:

```bash
firebase emulators:start
```

这将启动:
- Firestore: `http://localhost:8080`
- Auth: `http://localhost:9099`
- Storage: `http://localhost:9199`
- Functions: `http://localhost:5001`
- Emulator UI: `http://localhost:4000`

### 2. 启动前端开发服务器

在另一个终端:

```bash
cd frontend
npm install  # 首次运行
npm start
```

前端将运行在 `http://localhost:3000`

### 3. 测试流程

#### 3.1 准备测试数据

在 Emulator UI (`http://localhost:4000`) 中创建测试数据:

**公司数据** (companies 集合):
```json
{
  "company_name": "测试公司",
  "address": "台北市信义区",
  "tax_id": "12345678",
  "created_at": "2025-10-28T00:00:00Z"
}
```

**联系人数据** (contacts 集合):
```json
{
  "contact_name": "张三",
  "email": "test@example.com",
  "phone": "0912-345-678",
  "company_ref": "companies/{company_id}",
  "created_at": "2025-10-28T00:00:00Z"
}
```

**模板数据** (templates 集合):
```json
{
  "name": "测试模板",
  "type": "contract",
  "file_path": "templates/test-template.docx",
  "variables": {
    "standard": ["project_name", "company_name", "price", "date"],
    "extra": ["custom_field_1", "custom_field_2"]
  },
  "is_active": true,
  "created_at": "2025-10-28T00:00:00Z"
}
```

#### 3.2 测试用例

**测试 1: 创建项目**
1. 访问 `http://localhost:3000/projects`
2. 点击 "New Project"
3. 填写表单:
   - 项目名称: "测试项目 001"
   - 选择公司
   - 选择联系人
   - 输入价格: 50000
   - 选择日期
   - 选择模板
4. 填写额外字段（如果有）
5. 点击 "Create & Generate"
6. 观察三步流程: 创建中 → 生成中 → 完成
7. 自动跳转到项目详情页

**测试 2: 查看项目详情**
1. 在项目详情页检查:
   - 项目基本信息是否正确
   - 公司和联系人信息是否正确
   - 生成的文档是否显示
2. 测试下载按钮（会显示 alert）
3. 测试状态更改:
   - 点击 "Change Status"
   - 选择新状态
   - 点击 "Update Status"
   - 检查状态历史记录

**测试 3: 编辑项目**
1. 在详情页点击 "Edit"
2. 修改项目信息
3. 注意警告消息（如果有生成的文档）
4. 保存更改
5. 确认跳转回详情页且信息已更新

**测试 4: 重新生成文档**
1. 在详情页找到已生成的文档
2. 点击 "Regenerate"
3. 确认对话框
4. 等待重新生成
5. 检查文档列表更新

**测试 5: 项目列表功能**
1. 访问项目列表页
2. 测试搜索功能
3. 测试状态筛选
4. 测试排序（日期/价格/名称）
5. 测试点击项目卡片导航

### 4. 监控 Cloud Functions

在运行测试时，监控 Functions 的日志输出:

```bash
# 查看 Functions 日志
firebase emulators:logs --only functions

# 或者在 Emulator UI 的 Logs 标签页查看
```

## 常见问题排查

### 问题 1: Cloud Functions 调用失败

**症状**: 前端显示 "Failed to create project" 或类似错误

**解决方案**:
1. 检查 Functions Emulator 是否运行
2. 检查 `.env.local` 中的 `REACT_APP_USE_EMULATOR=true`
3. 查看 Functions 日志了解具体错误
4. 确认 Python 虚拟环境已激活且依赖已安装

### 问题 2: Firestore 权限错误

**症状**: 无法读取或写入数据

**解决方案**:
1. 在开发环境中，Emulator 通常允许所有操作
2. 检查 `firestore.rules` 是否正确
3. 确认用户已认证（如果需要）

### 问题 3: 路由不工作

**症状**: 页面刷新后 404 错误

**解决方案**:
1. 确认使用 `BrowserRouter` 而非 `HashRouter`
2. 开发服务器配置正确（Create React App 默认支持）
3. 生产环境需要配置服务器重定向所有路由到 index.html

### 问题 4: 模板变量未替换

**症状**: 生成的文档中仍显示 `{{variable_name}}`

**解决方案**:
1. 检查模板文件是否上传到 Storage
2. 检查变量名称是否完全匹配（包括大小写）
3. 查看 Functions 日志中的变量数据
4. 确认 `replace_placeholders` 函数正确执行

## 性能优化建议

### 前端优化

1. **使用 React Query 缓存数据**:
```tsx
import { useQuery } from '@tanstack/react-query';

const { data: projects } = useQuery({
  queryKey: ['projects'],
  queryFn: () => getDocuments('projects'),
});
```

2. **使用虚拟化列表**（当项目数量很大时）:
```tsx
import { useVirtualizer } from '@tanstack/react-virtual';
```

3. **懒加载页面组件**:
```tsx
const ProjectDetail = lazy(() => import('./pages/Projects/ProjectDetail'));
```

### 后端优化

1. **使用 Firestore 索引**:
   - 已在 `firestore.indexes.json` 中配置
   - 部署后自动创建

2. **Cloud Functions 优化**:
   - 增加内存分配（如果文档处理较慢）
   - 使用批处理写入（当生成多个文档时）

## 下一步

完成集成和测试后，你可以:

1. **实现其他模块**:
   - 模板管理 UI
   - 公司管理 UI
   - 联系人管理 UI
   - Dashboard 页面

2. **添加认证**:
   - Firebase Authentication 集成
   - 登录/注册页面
   - 受保护路由

3. **部署到生产环境**:
   - 部署 Cloud Functions: `firebase deploy --only functions`
   - 部署前端: `npm run build && firebase deploy --only hosting`
   - 配置生产环境变量

4. **增强功能**:
   - 批量操作
   - 文档预览
   - 活动日志查看
   - 分享权限管理

## 支持

如果遇到问题:
1. 查看 Firebase Emulator UI 的日志
2. 检查浏览器控制台的错误
3. 查看 `docs/CLOUD_FUNCTIONS_SETUP.md` 了解 Functions 详情
4. 查看 `docs/PROJECT_STRUCTURE.md` 了解项目结构
