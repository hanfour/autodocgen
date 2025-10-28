# AutoDocGen Web Platform - Design Document

## Overview

AutoDocGen Web Platform 採用前後端分離架構,基於 Firebase 生態系統建構。系統核心理念遵循 Linus Torvalds 的設計哲學:

1. **數據結構優先** - Firestore 作為唯一資料來源 (Single Source of Truth)
2. **簡單清晰** - 避免過度設計,使用最直接的實作方式
3. **零破壞性** - 保留現有功能,向後兼容所有歷史資料
4. **實用主義** - 解決真實問題,不追求理論完美

### 技術選型

- **前端**: React 18 + TypeScript + Tailwind CSS
- **後端**: Firebase Cloud Functions (Python 3.11)
- **資料庫**: Firestore (NoSQL)
- **儲存**: Firebase Storage
- **認證**: Firebase Authentication
- **部署**: Firebase Hosting + Functions

### 設計原則

- **關注點分離**: UI、業務邏輯、資料層嚴格分離
- **模組化**: 每個功能獨立 Cloud Function
- **型別安全**: TypeScript + Firestore Schema 驗證
- **效能優化**: 資料分頁、快取策略、延遲載入

## Architecture

### 系統架構圖

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            React SPA (TypeScript)                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
│  │  │Dashboard │  │ Projects │  │Templates │  ...      │  │
│  │  └──────────┘  └──────────┘  └──────────┘           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │ HTTPS
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Services                         │
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Firebase        │         │  Firebase        │          │
│  │  Hosting         │←────────│  Authentication  │          │
│  └──────────────────┘         └──────────────────┘          │
│           │                             │                    │
│           │                             ↓                    │
│           │                    ┌──────────────────┐          │
│           │                    │  Firestore       │          │
│           │                    │  (Database)      │          │
│           │                    └──────────────────┘          │
│           │                             ↑                    │
│           ↓                             │                    │
│  ┌──────────────────────────────────────┴─────────────────┐ │
│  │         Cloud Functions (Python)                       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │ │
│  │  │generateDocs  │  │analyzeTemplate│ │updateStatus │  │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │ │
│  │  ┌──────────────┐  ┌──────────────┐                   │ │
│  │  │migrateData   │  │ ... more ... │                   │ │
│  │  └──────────────┘  └──────────────┘                   │ │
│  └───────────────────────────────────────────────────────┘ │
│                             ↕                                │
│                    ┌──────────────────┐                     │
│                    │  Firebase        │                     │
│                    │  Storage         │                     │
│                    │  (Files)         │                     │
│                    └──────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

### 資料流程

#### 1. 建立專案並生成文件

```
User → React UI → Cloud Function (createProject)
                         ↓
                  Validate Data
                         ↓
                  Create Project in Firestore
                         ↓
                  Trigger generateDocuments
                         ↓
                  For each selected template:
                    1. Fetch template from Storage
                    2. Merge data (standard + extra)
                    3. Replace placeholders
                    4. Save to Storage
                    5. Update Firestore metadata
                         ↓
                  Return success + download URLs
```

#### 2. 上傳模板

```
User → Upload .docx → Cloud Function (uploadTemplate)
                             ↓
                      Save to Storage
                             ↓
                      analyzeTemplate Function
                             ↓
                      Scan {{placeholders}}
                             ↓
                      Regex inference
                             ↓
                      Return suggested config
                             ↓
User confirms/edits → Save template metadata to Firestore
```

## Components and Interfaces

### Frontend Components (React)

#### 1. Core Layout

```typescript
// src/components/Layout/MainLayout.tsx
interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header />
        {children}
      </main>
    </div>
  );
};
```

#### 2. Dashboard

```typescript
// src/pages/Dashboard.tsx
interface DashboardStats {
  totalProjects: number;
  byStatus: Record<ProjectStatus, number>;
  monthlyRevenue: number;
  recentActivities: Activity[];
}

const Dashboard: React.FC = () => {
  const { data: stats, loading } = useDashboardStats();

  return (
    <div className="p-6">
      <StatsCards stats={stats?.byStatus} />
      <RevenueChart revenue={stats?.monthlyRevenue} />
      <RecentActivities activities={stats?.recentActivities} />
    </div>
  );
};
```

#### 3. Project Management

```typescript
// src/pages/Projects/ProjectList.tsx
interface ProjectListProps {
  status?: ProjectStatus;
}

const ProjectList: React.FC<ProjectListProps> = ({ status }) => {
  const [filters, setFilters] = useState<ProjectFilters>({
    status,
    search: '',
    sortBy: 'updated_at',
    sortOrder: 'desc'
  });

  const { data: projects, loading } = useProjects(filters);

  return (
    <div>
      <ProjectFilters filters={filters} onChange={setFilters} />
      <ProjectTable projects={projects} />
    </div>
  );
};
```

```typescript
// src/pages/Projects/CreateProject.tsx
interface CreateProjectFormData {
  project_name: string;
  company_ref: string;
  contact_ref: string;
  price: number;
  date: string;
  selected_templates: string[];
  extra_data: Record<string, any>;
}

const CreateProject: React.FC = () => {
  const [formData, setFormData] = useState<CreateProjectFormData>({...});
  const [selectedTemplates, setSelectedTemplates] = useState<Template[]>([]);

  const handleSubmit = async () => {
    await createProject(formData);
    await generateDocuments(projectId, formData.selected_templates);
  };

  return (
    <form onSubmit={handleSubmit}>
      <BasicInfoSection />
      <TemplateSelection
        selected={selectedTemplates}
        onChange={setSelectedTemplates}
      />
      <DynamicExtraFields
        templates={selectedTemplates}
        values={formData.extra_data}
        onChange={(data) => setFormData({...formData, extra_data: data})}
      />
    </form>
  );
};
```

#### 4. Template Management

```typescript
// src/pages/Templates/UploadTemplate.tsx
interface TemplateUploadState {
  file: File | null;
  name: string;
  type: 'quote' | 'contract' | 'invoice' | 'custom';
  analyzedVariables: AnalyzedVariable[];
  variableConfigs: Record<string, VariableConfig>;
}

const UploadTemplate: React.FC = () => {
  const [state, setState] = useState<TemplateUploadState>({...});

  const handleFileUpload = async (file: File) => {
    // 1. Upload to Storage
    const fileUrl = await uploadFile(file);

    // 2. Analyze variables
    const analyzed = await analyzeTemplate(fileUrl);

    setState({
      ...state,
      file,
      analyzedVariables: analyzed.extra_variables
    });
  };

  return (
    <div>
      <FileUploader onUpload={handleFileUpload} />
      {state.analyzedVariables.length > 0 && (
        <VariableConfigurator
          variables={state.analyzedVariables}
          configs={state.variableConfigs}
          onChange={(configs) => setState({...state, variableConfigs: configs})}
        />
      )}
    </div>
  );
};
```

### Backend Cloud Functions (Python)

#### 1. Project Management Functions

```python
# functions/projects/create_project.py
from firebase_functions import https_fn
from firebase_admin import firestore
from typing import TypedDict

class ProjectData(TypedDict):
    project_name: str
    company_ref: str
    contact_ref: str
    price: float
    date: str
    selected_templates: list[str]
    extra_data: dict

@https_fn.on_call()
def create_project(req: https_fn.CallableRequest) -> dict:
    """建立新專案"""

    # 驗證 auth
    if not req.auth:
        raise https_fn.HttpsError('unauthenticated', 'Must be authenticated')

    data: ProjectData = req.data
    db = firestore.client()

    # 驗證資料
    validate_project_data(data)

    # 建立專案
    project_ref = db.collection('projects').document()
    project_ref.set({
        **data,
        'status': 'draft',
        'status_history': [{
            'status': 'draft',
            'timestamp': firestore.SERVER_TIMESTAMP,
            'updated_by': req.auth.uid
        }],
        'generated_docs': [],
        'created_by': req.auth.uid,
        'created_at': firestore.SERVER_TIMESTAMP,
        'updated_at': firestore.SERVER_TIMESTAMP
    })

    return {'success': True, 'project_id': project_ref.id}
```

```python
# functions/projects/update_status.py
@https_fn.on_call()
def update_project_status(req: https_fn.CallableRequest) -> dict:
    """更新專案狀態"""

    project_id = req.data['project_id']
    new_status = req.data['status']

    db = firestore.client()
    project_ref = db.collection('projects').document(project_id)

    # 檢查權限
    check_permission(req.auth.uid, project_ref, 'edit')

    # 更新狀態
    project_ref.update({
        'status': new_status,
        'status_history': firestore.ArrayUnion([{
            'status': new_status,
            'timestamp': firestore.SERVER_TIMESTAMP,
            'updated_by': req.auth.uid
        }]),
        'updated_at': firestore.SERVER_TIMESTAMP
    })

    return {'success': True}
```

#### 2. Document Generation Functions

```python
# functions/documents/generate_documents.py
from docx import Document
from google.cloud import storage
import os

@https_fn.on_call()
def generate_documents(req: https_fn.CallableRequest) -> dict:
    """生成文件"""

    project_id = req.data['project_id']
    template_ids = req.data['template_ids']

    db = firestore.client()
    storage_client = storage.Client()
    bucket = storage_client.bucket(os.environ['STORAGE_BUCKET'])

    # 取得專案資料
    project = db.collection('projects').document(project_id).get().to_dict()
    company = db.document(project['company_ref']).get().to_dict()
    contact = db.document(project['contact_ref']).get().to_dict()

    # 準備標準變數
    standard_data = prepare_standard_variables(project, company, contact)

    generated_docs = []

    for template_id in template_ids:
        template = db.collection('templates').document(template_id).get().to_dict()

        # 合併資料
        template_data = {
            **standard_data,
            **project.get('extra_data', {}).get(template_id, {})
        }

        # 下載模板
        template_blob = bucket.blob(template['file_path'])
        template_file = f"/tmp/{template_id}.docx"
        template_blob.download_to_filename(template_file)

        # 生成文件
        doc = Document(template_file)
        replace_placeholders(doc, template_data)

        # 上傳到 Storage
        output_filename = f"{project['project_name']}_{template['name']}.docx"
        output_path = f"projects/{project_id}/{template_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx"
        output_file = f"/tmp/output_{template_id}.docx"
        doc.save(output_file)

        blob = bucket.blob(output_path)
        blob.upload_from_filename(output_file)

        # 記錄文件資訊
        doc_info = {
            "id": f"DOC-{uuid.uuid4().hex[:8]}",
            "template_id": template_id,
            "template_name": template['name'],
            "file_url": f"gs://{bucket.name}/{output_path}",
            "file_name": output_filename,
            "file_size": os.path.getsize(output_file),
            "created_at": firestore.SERVER_TIMESTAMP,
            "created_by": req.auth.uid,
            "generation_data": template_data
        }

        generated_docs.append(doc_info)

        # 清理暫存檔
        os.remove(template_file)
        os.remove(output_file)

    # 更新專案
    db.collection('projects').document(project_id).update({
        'generated_docs': firestore.ArrayUnion(generated_docs),
        'updated_at': firestore.SERVER_TIMESTAMP
    })

    return {'success': True, 'documents': generated_docs}


def replace_placeholders(doc: Document, data: dict):
    """替換文件中的佔位符"""

    for paragraph in doc.paragraphs:
        for key, value in data.items():
            if f"{{{{{key}}}}}" in paragraph.text:
                replace_in_paragraph(paragraph, key, str(value))

    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for paragraph in cell.paragraphs:
                    for key, value in data.items():
                        if f"{{{{{key}}}}}" in paragraph.text:
                            replace_in_paragraph(paragraph, key, str(value))

    for section in doc.sections:
        for paragraph in section.header.paragraphs:
            for key, value in data.items():
                if f"{{{{{key}}}}}" in paragraph.text:
                    replace_in_paragraph(paragraph, key, str(value))
        for paragraph in section.footer.paragraphs:
            for key, value in data.items():
                if f"{{{{{key}}}}}" in paragraph.text:
                    replace_in_paragraph(paragraph, key, str(value))


def replace_in_paragraph(paragraph, placeholder: str, text: str):
    """在段落中替換文字並保留格式"""

    full_text = paragraph.text
    if f"{{{{{placeholder}}}}}" not in full_text:
        return

    # 簡化版本:保留第一個 run 的格式
    new_text = full_text.replace(f"{{{{{placeholder}}}}}", text)

    for i, run in enumerate(paragraph.runs):
        if i == 0:
            run.text = new_text
        else:
            run.text = ''
```

#### 3. Template Management Functions

```python
# functions/templates/analyze_template.py
import re
from docx import Document

@https_fn.on_call()
def analyze_template(req: https_fn.CallableRequest) -> dict:
    """分析模板變數"""

    file_url = req.data['file_url']

    # 下載檔案
    storage_client = storage.Client()
    bucket = storage_client.bucket(os.environ['STORAGE_BUCKET'])
    blob = bucket.blob(file_url.replace(f"gs://{bucket.name}/", ""))

    temp_file = "/tmp/template.docx"
    blob.download_to_filename(temp_file)

    # 掃描變數
    doc = Document(temp_file)
    placeholders = set()

    # 掃描段落
    for paragraph in doc.paragraphs:
        matches = re.findall(r'\{\{(\w+)\}\}', paragraph.text)
        placeholders.update(matches)

    # 掃描表格
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for paragraph in cell.paragraphs:
                    matches = re.findall(r'\{\{(\w+)\}\}', paragraph.text)
                    placeholders.update(matches)

    # 掃描頁首頁尾
    for section in doc.sections:
        for paragraph in section.header.paragraphs:
            matches = re.findall(r'\{\{(\w+)\}\}', paragraph.text)
            placeholders.update(matches)
        for paragraph in section.footer.paragraphs:
            matches = re.findall(r'\{\{(\w+)\}\}', paragraph.text)
            placeholders.update(matches)

    # 分類變數
    STANDARD_VARS = {
        "project_name", "company_name", "company_head", "taxID",
        "company_address", "contacts", "price", "untaxed", "taxes",
        "date", "contact_date", "code", "now_year", "now_month", "now_day"
    }

    standard = [v for v in placeholders if v in STANDARD_VARS]
    extra = [v for v in placeholders if v not in STANDARD_VARS]

    # Regex 推斷配置
    extra_configs = [infer_variable_config(v) for v in extra]

    os.remove(temp_file)

    return {
        'standard_variables': standard,
        'extra_variables': extra_configs,
        'all_variables': list(placeholders)
    }


def infer_variable_config(var_name: str) -> dict:
    """基於 Regex 推斷變數配置"""

    var_lower = var_name.lower()

    # 日期
    if 'date' in var_lower or '日期' in var_name:
        return {
            "key": var_name,
            "label": var_name.replace('_', ' ').title(),
            "type": "date",
            "required": False
        }

    # 金額
    if any(word in var_lower for word in ['price', 'amount', 'cost', 'fee']):
        return {
            "key": var_name,
            "label": var_name.replace('_', ' ').title(),
            "type": "number",
            "required": True
        }

    # 電話
    if 'phone' in var_lower or 'tel' in var_lower:
        return {
            "key": var_name,
            "label": var_name.replace('_', ' ').title(),
            "type": "tel",
            "required": False
        }

    # Email
    if 'email' in var_lower or 'mail' in var_lower:
        return {
            "key": var_name,
            "label": var_name.replace('_', ' ').title(),
            "type": "email",
            "required": False
        }

    # 選項類型
    if any(word in var_lower for word in ['terms', 'type', 'status', 'category']):
        return {
            "key": var_name,
            "label": var_name.replace('_', ' ').title(),
            "type": "select",
            "options": [],
            "required": False
        }

    # 預設文字
    return {
        "key": var_name,
        "label": var_name.replace('_', ' ').title(),
        "type": "text",
        "required": False
    }
```

#### 4. Utility Functions

```python
# functions/utils/code_generator.py
from datetime import datetime

def generate_code(date: datetime, counter: int) -> str:
    """生成文件編號: HIYES{年2碼}{月字母}{日字母2碼}{流水號3碼}"""

    year = date.strftime("%y")
    month = chr(64 + date.month)  # A-L

    day_num = date.day
    first_letter = chr(64 + (day_num // 26) + (1 if day_num % 26 != 0 else 0))
    second_letter = chr(64 + (day_num % 26) if day_num % 26 != 0 else 26)
    day = first_letter + second_letter

    serial_number = f'{counter:03}'

    return f'HIYES{year}{month}{day}{serial_number}'


def get_date_counter(date: datetime) -> int:
    """取得該日期的流水號"""

    db = firestore.client()
    date_str = date.strftime('%Y-%m-%d')

    # 查詢該日期的專案數量
    projects = db.collection('projects')\
        .where('date', '==', date_str)\
        .get()

    return len(list(projects)) + 1


# functions/utils/validators.py
def validate_project_data(data: dict) -> None:
    """驗證專案資料"""

    required_fields = ['project_name', 'company_ref', 'contact_ref', 'price', 'date']

    for field in required_fields:
        if field not in data:
            raise https_fn.HttpsError('invalid-argument', f'Missing field: {field}')

    if not isinstance(data['price'], (int, float)) or data['price'] <= 0:
        raise https_fn.HttpsError('invalid-argument', 'Price must be a positive number')


# functions/utils/permissions.py
def check_permission(user_id: str, resource_ref, required_permission: str) -> None:
    """檢查用戶權限"""

    resource = resource_ref.get().to_dict()

    # Owner 有所有權限
    if resource.get('created_by') == user_id:
        return

    # 檢查 shared_with
    shared_with = resource.get('shared_with', {})
    user_role = shared_with.get(user_id)

    if not user_role:
        raise https_fn.HttpsError('permission-denied', 'No access to this resource')

    # 檢查權限等級
    if required_permission == 'delete' and user_role != 'owner':
        raise https_fn.HttpsError('permission-denied', 'Only owner can delete')

    if required_permission == 'edit' and user_role == 'viewer':
        raise https_fn.HttpsError('permission-denied', 'Viewer cannot edit')
```

## Data Models

### Firestore Collections Schema

#### 1. Projects Collection

```typescript
interface Project {
  // 基本資料
  project_name: string;
  company_ref: string;  // Reference to companies/{companyId}
  contact_ref: string;  // Reference to contacts/{contactId}
  price: number;
  date: string;  // YYYY-MM-DD
  contact_date?: string;  // YYYY-MM-DD

  // 狀態管理
  status: 'draft' | 'in_progress' | 'paused' | 'pending_invoice' | 'pending_payment' | 'completed';
  status_history: StatusChange[];

  // 模板與文件
  selected_templates: string[];  // Template IDs
  extra_data: Record<string, Record<string, any>>;  // { [templateId]: { [variableKey]: value } }
  generated_docs: GeneratedDocument[];

  // 權限
  created_by: string;  // User ID
  shared_with?: Record<string, 'owner' | 'member' | 'viewer'>;  // { [userId]: role }

  // 時間戳
  created_at: Timestamp;
  updated_at: Timestamp;
}

interface StatusChange {
  status: Project['status'];
  timestamp: Timestamp;
  updated_by: string;  // User ID
  note?: string;
}

interface GeneratedDocument {
  id: string;
  template_id: string;
  template_name: string;
  template_version: number;
  file_url: string;  // gs://bucket/path
  file_name: string;
  file_size: number;  // bytes
  mime_type: string;
  created_at: Timestamp;
  created_by: string;
  generation_data: Record<string, any>;  // 生成時使用的資料
}
```

**索引 (Indexes)**:
```
- status ASC, updated_at DESC
- created_by ASC, created_at DESC
- date ASC
```

#### 2. Templates Collection

```typescript
interface Template {
  // 基本資料
  name: string;
  type: 'quote' | 'contract' | 'invoice' | 'custom';
  description?: string;

  // 檔案資訊
  file_url: string;  // gs://bucket/templates/xxx.docx
  file_name: string;
  file_path: string;  // Storage path
  file_size: number;

  // 變數配置
  variables: VariableConfig[];

  // 狀態
  is_active: boolean;
  version: number;

  // 權限
  created_by: string;
  shared_with?: Record<string, 'owner' | 'member' | 'viewer'>;

  // 時間戳
  created_at: Timestamp;
  updated_at: Timestamp;
}

interface VariableConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'email' | 'tel' | 'select' | 'textarea';
  options?: string[];  // for select type
  required: boolean;
  placeholder?: string;
  default_value?: any;
  validation_rule?: string;  // regex pattern
}
```

**索引**:
```
- is_active ASC, updated_at DESC
- type ASC, is_active ASC
```

#### 3. Companies Collection

```typescript
interface Company {
  companyName: string;
  taxID: string;
  companyHead: string;
  address: string;
  phone?: string;
  email?: string;

  // 權限
  created_by: string;
  shared_with?: Record<string, 'owner' | 'member' | 'viewer'>;

  // 時間戳
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

**索引**:
```
- companyName ASC
- taxID ASC
```

#### 4. Contacts Collection

```typescript
interface Contact {
  name: string;
  phone?: string;
  email?: string;
  title?: string;  // 職稱
  company_ref?: string;  // Reference to companies/{companyId}

  // 權限
  created_by: string;
  shared_with?: Record<string, 'owner' | 'member' | 'viewer'>;

  // 時間戳
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

#### 5. Users Collection

```typescript
interface User {
  uid: string;  // Firebase Auth UID
  email: string;
  display_name?: string;
  photo_url?: string;

  // 設定
  preferences?: {
    theme?: 'light' | 'dark';
    language?: 'zh-TW' | 'en';
  };

  // 時間戳
  created_at: Timestamp;
  last_login_at: Timestamp;
}
```

#### 6. Activities Collection (活動記錄)

```typescript
interface Activity {
  type: 'project_created' | 'project_updated' | 'project_deleted' |
        'document_generated' | 'status_changed' |
        'template_created' | 'template_updated';

  user_id: string;
  user_name: string;

  resource_type: 'project' | 'template' | 'company' | 'contact';
  resource_id: string;
  resource_name: string;

  details?: any;

  timestamp: Timestamp;
}
```

**索引**:
```
- timestamp DESC
- user_id ASC, timestamp DESC
- resource_type ASC, resource_id ASC, timestamp DESC
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(resource) {
      return request.auth.uid == resource.data.created_by;
    }

    function hasAccess(resource, requiredRole) {
      let userRole = resource.data.shared_with[request.auth.uid];
      return isOwner(resource) ||
             (userRole != null &&
              (requiredRole == 'viewer' ||
               (requiredRole == 'member' && userRole in ['member', 'owner']) ||
               (requiredRole == 'owner' && userRole == 'owner')));
    }

    // Projects
    match /projects/{projectId} {
      allow read: if isAuthenticated() && hasAccess(resource, 'viewer');
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && hasAccess(resource, 'member');
      allow delete: if isAuthenticated() && hasAccess(resource, 'owner');
    }

    // Templates
    match /templates/{templateId} {
      allow read: if isAuthenticated() && resource.data.is_active == true;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && hasAccess(resource, 'member');
      allow delete: if isAuthenticated() && hasAccess(resource, 'owner');
    }

    // Companies
    match /companies/{companyId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && hasAccess(resource, 'member');
      allow delete: if isAuthenticated() && hasAccess(resource, 'owner');
    }

    // Contacts
    match /contacts/{contactId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && hasAccess(resource, 'member');
      allow delete: if isAuthenticated() && hasAccess(resource, 'owner');
    }

    // Users
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && request.auth.uid == userId;
    }

    // Activities
    match /activities/{activityId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
    }
  }
}
```

### Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Helper function
    function isAuthenticated() {
      return request.auth != null;
    }

    function hasProjectAccess(projectId) {
      return firestore.get(/databases/(default)/documents/projects/$(projectId))
        .data.created_by == request.auth.uid ||
        firestore.get(/databases/(default)/documents/projects/$(projectId))
        .data.shared_with[request.auth.uid] != null;
    }

    // Templates (公開讀取,僅管理員上傳)
    match /templates/{fileName} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }

    // Project documents (僅有權限者可存取)
    match /projects/{projectId}/{fileName} {
      allow read: if isAuthenticated() && hasProjectAccess(projectId);
      allow write: if isAuthenticated() && hasProjectAccess(projectId);
    }
  }
}
```

## Error Handling

### Frontend Error Handling

```typescript
// src/utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleFirebaseError(error: any): AppError {
  switch (error.code) {
    case 'permission-denied':
      return new AppError('PERMISSION_DENIED', '您沒有權限執行此操作');
    case 'not-found':
      return new AppError('NOT_FOUND', '找不到指定的資源');
    case 'unauthenticated':
      return new AppError('UNAUTHENTICATED', '請先登入');
    case 'invalid-argument':
      return new AppError('INVALID_DATA', error.message);
    default:
      return new AppError('UNKNOWN', '發生未知錯誤', error);
  }
}

// Error boundary component
export class ErrorBoundary extends React.Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    // 記錄到監控系統
    logErrorToMonitoring(error, errorInfo);

    this.setState({ hasError: true, error });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Backend Error Handling

```python
# functions/utils/errors.py
from firebase_functions import https_fn

class ValidationError(Exception):
    pass

class PermissionError(Exception):
    pass

def handle_errors(func):
    """Decorator for error handling"""

    def wrapper(req: https_fn.CallableRequest):
        try:
            return func(req)
        except ValidationError as e:
            raise https_fn.HttpsError('invalid-argument', str(e))
        except PermissionError as e:
            raise https_fn.HttpsError('permission-denied', str(e))
        except Exception as e:
            # Log error
            print(f"Unexpected error: {str(e)}")
            raise https_fn.HttpsError('internal', 'Internal server error')

    return wrapper
```

### 錯誤提示 UI

```typescript
// src/components/Toast/ErrorToast.tsx
interface ToastProps {
  error: AppError;
  onClose: () => void;
}

const ErrorToast: React.FC<ToastProps> = ({ error, onClose }) => {
  const getMessage = (error: AppError) => {
    switch (error.code) {
      case 'PERMISSION_DENIED':
        return '您沒有權限執行此操作';
      case 'NOT_FOUND':
        return '找不到指定的資源';
      case 'INVALID_DATA':
        return `資料驗證失敗: ${error.message}`;
      default:
        return '發生錯誤,請稍後再試';
    }
  };

  return (
    <div className="toast toast-error">
      <span>{getMessage(error)}</span>
      <button onClick={onClose}>✕</button>
    </div>
  );
};
```

## Testing Strategy

### Frontend Testing

#### 1. Unit Tests (Jest + React Testing Library)

```typescript
// src/utils/__tests__/codeGenerator.test.ts
describe('generateCode', () => {
  it('should generate correct code for given date and counter', () => {
    const date = new Date('2025-09-30');
    const code = generateCode(date, 1);
    expect(code).toBe('HIYES25IAE001');
  });

  it('should handle day > 26 correctly', () => {
    const date = new Date('2025-01-27');
    const code = generateCode(date, 1);
    expect(code).toBe('HIYES25ABA001');
  });
});
```

```typescript
// src/components/Projects/__tests__/ProjectList.test.tsx
describe('ProjectList', () => {
  it('should render projects', async () => {
    const mockProjects = [
      { id: '1', project_name: 'Test', status: 'draft' }
    ];

    jest.spyOn(api, 'getProjects').mockResolvedValue(mockProjects);

    render(<ProjectList />);

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });

  it('should filter by status', async () => {
    render(<ProjectList status="pending_invoice" />);

    await waitFor(() => {
      expect(api.getProjects).toHaveBeenCalledWith({ status: 'pending_invoice' });
    });
  });
});
```

#### 2. Integration Tests (Cypress)

```typescript
// cypress/e2e/create-project.cy.ts
describe('Create Project Flow', () => {
  beforeEach(() => {
    cy.login();
  });

  it('should create project and generate documents', () => {
    cy.visit('/projects/create');

    // Fill basic info
    cy.get('[name="project_name"]').type('Test Project');
    cy.get('[name="company_ref"]').select('泰瑀行銷股份有限公司');
    cy.get('[name="price"]').type('30000');

    // Select templates
    cy.get('[data-template="quote"]').check();
    cy.get('[data-template="contract"]').check();

    // Fill extra fields
    cy.get('[name="extra_data.quote.payment_terms"]').select('30天');

    // Submit
    cy.get('button[type="submit"]').click();

    // Verify redirect to project detail
    cy.url().should('include', '/projects/');
    cy.contains('Test Project');

    // Verify documents generated
    cy.contains('報價單').should('exist');
    cy.contains('合約').should('exist');
  });
});
```

### Backend Testing

#### 1. Unit Tests (pytest)

```python
# functions/tests/test_code_generator.py
import pytest
from datetime import datetime
from utils.code_generator import generate_code

def test_generate_code():
    date = datetime(2025, 9, 30)
    code = generate_code(date, 1)
    assert code == 'HIYES25IAE001'

def test_generate_code_day_over_26():
    date = datetime(2025, 1, 27)
    code = generate_code(date, 1)
    assert code == 'HIYES25ABA001'
```

```python
# functions/tests/test_analyze_template.py
def test_analyze_template():
    # Mock docx file
    mock_file = create_mock_docx_with_placeholders([
        '{{project_name}}',
        '{{payment_terms}}'
    ])

    result = analyze_template_file(mock_file)

    assert 'project_name' in result['standard_variables']
    assert len(result['extra_variables']) == 1
    assert result['extra_variables'][0]['key'] == 'payment_terms'
```

#### 2. Integration Tests

```python
# functions/tests/test_generate_documents.py
def test_generate_documents_flow(firestore_emulator, storage_emulator):
    # Setup test data
    project_id = create_test_project()
    template_id = create_test_template()

    # Call function
    result = generate_documents({
        'project_id': project_id,
        'template_ids': [template_id]
    })

    assert result['success'] == True
    assert len(result['documents']) == 1

    # Verify file uploaded to storage
    bucket = storage_emulator.bucket()
    blobs = list(bucket.list_blobs(prefix=f'projects/{project_id}/'))
    assert len(blobs) == 1
```

### End-to-End Testing

使用 Firebase Emulator Suite 進行完整流程測試:

```bash
# Start emulators
firebase emulators:start

# Run E2E tests
npm run test:e2e
```

### Performance Testing

```typescript
// performance/load-test.ts
import { check } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '1m', target: 10 },  // Ramp up to 10 users
    { duration: '3m', target: 10 },  // Stay at 10 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
};

export default function() {
  const res = http.get('https://your-app.web.app/api/projects');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
}
```

### 測試覆蓋率目標

- **Frontend**: > 80% 程式碼覆蓋率
- **Backend**: > 90% 程式碼覆蓋率
- **Critical paths**: 100% 覆蓋率 (文件生成、權限檢查)

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: pip install -r functions/requirements.txt
      - name: Run tests
        run: pytest functions/tests --cov

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Start emulators
        run: npm run emulators:start &
      - name: Run Cypress
        run: npm run cypress:run
```
