# 手动添加测试数据指南

由于自动脚本需要额外的认证设置，最简单的方式是通过 Firebase Console 手动添加测试数据。

## 🎯 快速开始（5-10分钟）

### 步骤 1: 打开 Firestore Console

访问: https://console.firebase.google.com/project/autodocgen-prod/firestore

### 步骤 2: 创建公司数据

1. 点击 "**Start collection**" (如果是第一次) 或 "**+ Add collection**"
2. Collection ID 输入: `companies`
3. 点击 "Next"
4. 添加第一个文档（可以让 Firebase 自动生成 Document ID）

#### 公司 1: 测试科技有限公司

| 字段名 | 类型 | 值 |
|--------|------|-----|
| `company_name` | string | 测试科技有限公司 |
| `address` | string | 台北市信义区信义路五段7号 |
| `phone` | string | 02-2345-6789 |
| `email` | string | info@test-tech.com |
| `tax_id` | string | 12345678 |
| `created_at` | timestamp | (点击添加当前时间) |
| `updated_at` | timestamp | (点击添加当前时间) |

**保存后，复制这个文档的 ID**（例如: `abc123def456`）

#### 公司 2: 创新设计股份有限公司

重复上述步骤，使用以下数据:

| 字段名 | 类型 | 值 |
|--------|------|-----|
| `company_name` | string | 创新设计股份有限公司 |
| `address` | string | 台北市中山区南京东路三段168号 |
| `phone` | string | 02-8765-4321 |
| `email` | string | contact@innovation-design.com |
| `tax_id` | string | 87654321 |
| `created_at` | timestamp | (当前时间) |
| `updated_at` | timestamp | (当前时间) |

**保存后，也复制这个文档的 ID**

---

### 步骤 3: 创建联系人数据

1. 回到 Firestore 主页
2. 点击 "**+ Add collection**"
3. Collection ID 输入: `contacts`
4. 点击 "Next"

#### 联系人 1: 张三

| 字段名 | 类型 | 值 |
|--------|------|-----|
| `contact_name` | string | 张三 |
| `email` | string | zhang.san@test-tech.com |
| `phone` | string | 0912-345-678 |
| `position` | string | 项目经理 |
| `company_ref` | string | companies/[公司1的ID] |
| `created_at` | timestamp | (当前时间) |
| `updated_at` | timestamp | (当前时间) |

**重要**: `company_ref` 的格式是 `companies/` 加上公司文档的 ID
例如: `companies/abc123def456`

#### 联系人 2: 李四

| 字段名 | 类型 | 值 |
|--------|------|-----|
| `contact_name` | string | 李四 |
| `email` | string | li.si@test-tech.com |
| `phone` | string | 0923-456-789 |
| `position` | string | 技术总监 |
| `company_ref` | string | companies/[公司1的ID] |
| `created_at` | timestamp | (当前时间) |
| `updated_at` | timestamp | (当前时间) |

#### 联系人 3: 王五

| 字段名 | 类型 | 值 |
|--------|------|-----|
| `contact_name` | string | 王五 |
| `email` | string | wang.wu@innovation-design.com |
| `phone` | string | 0934-567-890 |
| `position` | string | 设计主管 |
| `company_ref` | string | companies/[公司2的ID] |
| `created_at` | timestamp | (当前时间) |
| `updated_at` | timestamp | (当前时间) |

---

### 步骤 4: 创建模板数据

1. 回到 Firestore 主页
2. 点击 "**+ Add collection**"
3. Collection ID 输入: `templates`
4. 点击 "Next"

#### 模板 1: 标准报价单

| 字段名 | 类型 | 值 |
|--------|------|-----|
| `template_name` | string | 标准报价单 |
| `template_type` | string | quotation |
| `description` | string | 适用于一般项目的标准报价单模板 |
| `fields` | array | [点击添加 array，然后逐个添加 string 值] |
| `is_active` | boolean | true |
| `created_at` | timestamp | (当前时间) |
| `updated_at` | timestamp | (当前时间) |

**`fields` array 的内容**（每个都是 string 类型）:
- `payment_terms`
- `delivery_date`
- `warranty_period`
- `notes`

**`field_labels` map 的内容**（添加 map 类型字段）:

点击 "Add field" → 选择类型 "map" → 字段名 `field_labels`

然后在 map 里添加以下键值对（都是 string → string）:
- `payment_terms` → `付款条件`
- `delivery_date` → `交付日期`
- `warranty_period` → `保固期限`
- `notes` → `备注`

#### 模板 2: 合约书模板

| 字段名 | 类型 | 值 |
|--------|------|-----|
| `template_name` | string | 合约书模板 |
| `template_type` | string | contract |
| `description` | string | 正式合约文件模板 |
| `fields` | array | contract_start_date, contract_end_date, payment_terms, special_terms |
| `field_labels` | map | (见下方) |
| `is_active` | boolean | true |
| `created_at` | timestamp | (当前时间) |
| `updated_at` | timestamp | (当前时间) |

**`field_labels` map**:
- `contract_start_date` → `合约开始日期`
- `contract_end_date` → `合约结束日期`
- `payment_terms` → `付款条件`
- `special_terms` → `特殊条款`

---

## ✅ 完成！

现在你已经有了:
- ✅ 2 个公司
- ✅ 3 个联系人
- ✅ 2 个模板

### 🌐 测试应用

1. 访问: https://autodocgen-prod.web.app

2. 你应该能够:
   - 看到项目列表页（目前是空的）
   - 点击 "New Project" 创建新项目
   - 在表单中选择刚创建的公司、联系人和模板
   - 提交后创建第一个项目！

---

## 📊 快速参考

### 数据结构总结

```
Firestore Collections:
├── companies/
│   ├── [auto-id]
│   │   ├── company_name: string
│   │   ├── address: string
│   │   ├── phone: string
│   │   ├── email: string
│   │   ├── tax_id: string
│   │   ├── created_at: timestamp
│   │   └── updated_at: timestamp
│
├── contacts/
│   ├── [auto-id]
│   │   ├── contact_name: string
│   │   ├── email: string
│   │   ├── phone: string
│   │   ├── position: string
│   │   ├── company_ref: string  (格式: "companies/[company-id]")
│   │   ├── created_at: timestamp
│   │   └── updated_at: timestamp
│
└── templates/
    ├── [auto-id]
    │   ├── template_name: string
    │   ├── template_type: string
    │   ├── description: string
    │   ├── fields: array<string>
    │   ├── field_labels: map<string, string>
    │   ├── is_active: boolean
    │   ├── created_at: timestamp
    │   └── updated_at: timestamp
```

---

## 💡 提示

### Firestore Console 快捷操作

1. **快速添加相同结构的文档**:
   - 创建第一个文档
   - 点击文档右侧的三个点 "..."
   - 选择 "Copy"
   - 粘贴到新文档，然后修改值

2. **批量操作**:
   - 可以导出为 JSON
   - 在本地编辑
   - 再导入回来

3. **查看引用关系**:
   - 点击 `company_ref` 字段的值
   - 如果格式正确，会显示为可点击的链接

---

## 🔍 验证数据

### 检查 company_ref 格式

在 contacts 集合中，`company_ref` 必须是以下格式:
```
companies/[实际的公司文档ID]
```

**正确示例**:
```
companies/abc123def456
companies/xyz789ghi012
```

**错误示例**（这些会导致应用出错）:
```
abc123def456          ❌ (缺少 "companies/" 前缀)
/companies/abc123     ❌ (前面多了斜杠)
companies/            ❌ (没有 ID)
```

---

## 📞 遇到问题？

### 常见问题

**Q: 创建项目时找不到公司/联系人？**
A: 检查 Firestore Console，确保:
1. 集合名称正确 (companies, contacts, templates)
2. 所有必需字段都已填写
3. company_ref 格式正确

**Q: 字段类型选错了怎么办？**
A:
1. 点击字段右侧的 "..."
2. 选择 "Delete field"
3. 重新添加正确类型的字段

**Q: 如何批量导入数据？**
A: 如果需要导入大量数据，可以:
1. 导出现有数据为 JSON
2. 使用脚本批量生成
3. 使用 Firebase CLI 导入

---

**准备好了吗？现在就开始添加数据，然后测试你的应用吧！** 🚀
