# 部署后验证和监控指南

## 🎉 部署成功！

**部署时间**: 2025-10-28
**环境**: 生产环境 (autodocgen-prod)
**前端 URL**: https://autodocgen-prod.web.app
**提交**: 995c6cf

---

## ✅ 立即验证清单

### 1. 前端应用验证 (5分钟)

```bash
# 访问前端应用
open https://autodocgen-prod.web.app
```

**检查项目**:
- [ ] 页面能否正常加载
- [ ] 是否显示正确的样式（Tailwind CSS）
- [ ] 控制台是否有 JavaScript 错误
- [ ] 网络请求是否正常（DevTools → Network）

### 2. Cloud Functions 验证

#### 方式 1: Firebase Console
```bash
# 打开 Functions 控制台
open https://console.firebase.google.com/project/autodocgen-prod/functions
```

**检查每个 Function**:
- [ ] analyze_template - 状态: Active
- [ ] create_project - 状态: Active
- [ ] generate_documents - 状态: Active
- [ ] regenerate_document - 状态: Active
- [ ] update_project_status - 状态: Active

#### 方式 2: 命令行
```bash
# 列出所有已部署的 Functions
firebase functions:list

# 查看特定 Function 的日志
firebase functions:log --only create_project --limit 10
```

### 3. Firestore 验证

```bash
# 打开 Firestore 控制台
open https://console.firebase.google.com/project/autodocgen-prod/firestore
```

**检查**:
- [ ] 数据库名称: autodocgen
- [ ] 位置: asia-east1
- [ ] 规则已更新（查看 Rules 标签）
- [ ] 集合是否存在: projects, companies, contacts, templates

### 4. Storage 验证

```bash
# 打开 Storage 控制台
open https://console.firebase.google.com/project/autodocgen-prod/storage
```

**检查**:
- [ ] Bucket: autodocgen-prod.appspot.com
- [ ] 规则已更新（查看 Rules 标签）
- [ ] 文件夹结构: templates/, generated_docs/

---

## 🧪 功能测试指南

### 测试 1: 创建项目 (10分钟)

#### 准备测试数据

1. **访问 Firestore 控制台添加测试数据**:
   ```
   https://console.firebase.google.com/project/autodocgen-prod/firestore
   ```

2. **创建测试公司**:
   - Collection: `companies`
   - Document ID: 自动生成
   - 字段:
     ```json
     {
       "company_name": "测试公司",
       "address": "台北市信义區",
       "created_at": [Firestore Timestamp - 现在]
     }
     ```

3. **创建测试联系人**:
   - Collection: `contacts`
   - Document ID: 自动生成
   - 字段:
     ```json
     {
       "contact_name": "张三",
       "email": "zhang@test.com",
       "phone": "0912-345-678",
       "company_ref": "companies/[刚创建的公司ID]",
       "created_at": [Firestore Timestamp - 现在]
     }
     ```

4. **创建测试模板**:
   - Collection: `templates`
   - Document ID: 自动生成
   - 字段:
     ```json
     {
       "template_name": "测试报价单",
       "template_type": "quotation",
       "fields": ["payment_terms", "delivery_date"],
       "created_at": [Firestore Timestamp - 现在]
     }
     ```

#### 执行测试

1. **访问前端应用**: https://autodocgen-prod.web.app

2. **测试创建项目流程**:
   - [ ] 点击 "New Project" 按钮
   - [ ] 填写项目信息
   - [ ] 选择刚创建的测试公司
   - [ ] 选择刚创建的测试联系人
   - [ ] 选择刚创建的测试模板
   - [ ] 提交表单

3. **观察结果**:
   - [ ] 是否显示成功消息
   - [ ] 是否自动跳转到项目详情页
   - [ ] Firestore 中是否创建了新项目记录
   - [ ] Functions 日志是否正常

### 测试 2: 查看 Functions 日志

```bash
# 实时查看所有 Functions 日志
firebase functions:log

# 查看特定 Function
firebase functions:log --only create_project

# 查看最近的错误
firebase functions:log --only create_project --limit 50 | grep ERROR
```

---

## 📊 监控设置

### 1. 设置 Cloud Functions 监控

#### 在 Firebase Console:
```bash
open https://console.firebase.google.com/project/autodocgen-prod/functions
```

**设置告警**:
1. 点击任意 Function → "Metrics" 标签
2. 查看:
   - 调用次数 (Invocations)
   - 错误率 (Error rate)
   - 执行时间 (Execution time)
   - 内存使用 (Memory usage)

3. 点击 "Create Alert" 设置告警:
   - 错误率 > 5%
   - 平均执行时间 > 10 秒
   - 内存使用 > 80%

### 2. 设置预算告警

```bash
# 打开 Billing & Usage
open https://console.firebase.google.com/project/autodocgen-prod/usage
```

**推荐设置**:
- 每日预算告警: $5
- 每月预算告警: $100

### 3. 启用 Performance Monitoring

```bash
# 打开 Performance
open https://console.firebase.google.com/project/autodocgen-prod/performance
```

**监控指标**:
- [ ] 页面加载时间
- [ ] 网络请求时间
- [ ] 首次渲染时间 (FCP)
- [ ] 最大内容渲染时间 (LCP)

### 4. 启用 Error Reporting

```bash
# 打开 Crashlytics
open https://console.firebase.google.com/project/autodocgen-prod/crashlytics
```

---

## 🔍 日常监控检查清单

### 每日检查 (5分钟)

```bash
#!/bin/bash
# 保存为 scripts/daily-check.sh

echo "🔍 AutoDocGen 每日健康检查"
echo "=============================="
echo ""

# 1. 检查 Functions 状态
echo "📊 Functions 状态:"
firebase functions:list

echo ""

# 2. 查看最近的错误日志
echo "⚠️  最近的错误 (最近 24 小时):"
firebase functions:log --limit 100 | grep -i "error" | tail -20

echo ""

# 3. 检查 Firestore 使用量
echo "💾 Firestore 使用情况:"
echo "访问: https://console.firebase.google.com/project/autodocgen-prod/usage"

echo ""
echo "✅ 健康检查完成！"
```

**运行**:
```bash
chmod +x scripts/daily-check.sh
./scripts/daily-check.sh
```

### 每周检查 (15分钟)

- [ ] 审查 Functions 调用次数和费用
- [ ] 检查 Firestore 读写次数
- [ ] 检查 Storage 使用量
- [ ] 审查错误日志模式
- [ ] 检查安全规则是否需要更新
- [ ] 审查性能指标趋势

---

## 🚨 常见问题排查

### 问题 1: Frontend 无法访问

**症状**: https://autodocgen-prod.web.app 无法打开

**排查步骤**:
```bash
# 1. 检查 Hosting 状态
firebase hosting:releases:list

# 2. 检查最近的部署
firebase hosting:releases:list --limit 5

# 3. 如果需要回滚
firebase hosting:rollback
```

### 问题 2: Functions 调用失败

**症状**: 前端调用 Functions 返回错误

**排查步骤**:
```bash
# 1. 查看 Function 日志
firebase functions:log --only [function-name] --limit 50

# 2. 检查 Function 状态
firebase functions:list

# 3. 如果需要重新部署
firebase deploy --only functions:[function-name]
```

### 问题 3: Firestore 权限错误

**症状**: 前端显示 "permission denied"

**排查步骤**:
```bash
# 1. 查看当前规则
firebase firestore:rules

# 2. 重新部署规则
firebase deploy --only firestore:rules

# 3. 在 Console 测试规则
open https://console.firebase.google.com/project/autodocgen-prod/firestore/rules
```

### 问题 4: 性能问题

**症状**: 页面加载缓慢或 Functions 超时

**排查步骤**:
```bash
# 1. 查看 Performance Monitoring
open https://console.firebase.google.com/project/autodocgen-prod/performance

# 2. 查看 Functions 执行时间
firebase functions:log --only [function-name] | grep "execution took"

# 3. 优化建议
# - 检查 Firestore 索引
# - 优化 Functions 代码
# - 考虑使用缓存
# - 增加 Functions 内存/超时设置
```

---

## 🔄 回滚流程

### 回滚 Hosting

```bash
# 1. 查看历史版本
firebase hosting:releases:list

# 2. 回滚到上一个版本
firebase hosting:rollback

# 3. 验证
open https://autodocgen-prod.web.app
```

### 回滚 Functions

```bash
# 方式 1: 使用 Firebase Console
open https://console.firebase.google.com/project/autodocgen-prod/functions

# 选择 Function → 点击 "Rollback"

# 方式 2: 重新部署之前的代码
git checkout [previous-commit-hash]
firebase deploy --only functions
git checkout main
```

### 回滚 Firestore Rules

```bash
# 在 Firebase Console 手动恢复
open https://console.firebase.google.com/project/autodocgen-prod/firestore/rules

# 点击 "Version History" 并恢复之前的版本
```

---

## 📈 优化建议

### 短期优化 (1-2周)

1. **设置 Functions Cleanup Policy**
   ```bash
   firebase functions:artifacts:setpolicy
   ```

2. **添加 Firebase Analytics**
   - 追踪用户行为
   - 监控转化率
   - 分析使用模式

3. **创建测试套件**
   - E2E 测试 (Cypress/Playwright)
   - 集成测试
   - 负载测试

### 中期优化 (1-2个月)

1. **性能优化**
   - 实现 Code Splitting
   - 添加 Service Worker
   - 优化图片加载
   - 实现懒加载

2. **安全增强**
   - 实现用户认证
   - 添加 Rate Limiting
   - 审计安全规则
   - 实现日志审计

3. **功能扩展**
   - 添加更多模板类型
   - 实现文档预览
   - 添加批量操作
   - 实现数据导出

### 长期优化 (3-6个月)

1. **架构升级**
   - 考虑多区域部署
   - 实现 CDN 加速
   - 添加备份策略
   - 实现灾难恢复

2. **成本优化**
   - 分析使用模式
   - 优化 Functions 配置
   - 实现智能缓存
   - 审查定价策略

---

## 📞 支持和联系

### 获取帮助

1. **Firebase 支持**
   - 文档: https://firebase.google.com/docs
   - 社区: https://firebase.google.com/support

2. **项目文档**
   - README: `/README.md`
   - 架构文档: `/docs/ARCHITECTURE.md`
   - API 文档: `/docs/API.md`

3. **问题报告**
   - GitHub Issues: https://github.com/hanfour/autodocgen/issues

---

## 🎯 下一步行动

### 立即执行 (今天)
- [x] 验证所有服务正常运行
- [ ] 执行功能测试
- [ ] 设置基本监控告警
- [ ] 创建测试数据

### 本周完成
- [ ] 完成完整的端到端测试
- [ ] 设置 Functions Cleanup Policy
- [ ] 配置预算告警
- [ ] 文档用户操作手册

### 下周开始
- [ ] 收集用户反馈
- [ ] 规划下一步功能开发
- [ ] 优化性能瓶颈
- [ ] 准备生产环境备份策略

---

**记住**:
- 🔒 生产环境谨慎操作
- 📊 定期检查监控指标
- 💾 定期备份重要数据
- 🐛 及时修复发现的问题
- 📝 记录所有重要变更

**祝贺你成功部署 AutoDocGen 到生产环境！** 🎉
