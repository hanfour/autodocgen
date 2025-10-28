# Migration Scripts

This directory contains scripts for migrating data from the legacy Python CLI system to the Firebase-based web platform.

## Prerequisites

### 1. Install Python Dependencies

```bash
pip install python-docx firebase-admin google-cloud-firestore google-cloud-storage
```

### 2. Firebase Service Account

Download your Firebase service account key:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (autodocgen-prod)
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save as `service-account-key.json` in the project root

⚠️ **IMPORTANT**: Never commit `service-account-key.json` to Git! It's already in `.gitignore`.

## Migration Scripts

### 1. Template Migration (`migrate_templates.py`)

Uploads existing Word document templates to Firebase Storage and creates corresponding Firestore documents.

**What it does**:
- Analyzes templates for {{variable}} placeholders
- Categorizes variables as standard or custom
- Uploads templates to Firebase Storage (`templates/{templateId}/{filename}`)
- Creates Firestore documents with metadata
- Sets templates as active

**Usage**:
```bash
python scripts/migrate_templates.py
```

**Expected Output**:
```
🔥 AutoDocGen Template Migration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Firebase initialized
📤 Processing template: Standard Quotation Template
   🔍 Analyzing template variables...
   ✓ Found 15 variables:
     - Standard: 8 (project_name, company_name, ...)
     - Custom: 7 (custom_field_1, ...)
   📤 Uploading to Firebase Storage...
   ✓ Uploaded to: gs://bucket/templates/...
   💾 Creating Firestore document...
   ✓ Created template document: quote_20251028_140000

📊 Migration Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Successfully migrated: 2 templates
```

**What gets created**:

Firestore Document (`templates/{templateId}`):
```json
{
  "name": "Standard Quotation Template",
  "type": "quote",
  "description": "Default quotation template",
  "file_path": "templates/quote_20251028/template.docx",
  "file_url": "gs://bucket/templates/...",
  "file_name": "template.docx",
  "file_size": 142609,
  "variables": {
    "standard": ["project_name", "company_name", ...],
    "extra": ["custom_field_1", ...]
  },
  "is_active": true,
  "created_by": "migration_script",
  "created_at": "2025-10-28T14:00:00Z",
  "shared_with": {},
  "usage_count": 0,
  "version": 1
}
```

### 2. Company Migration (`migrate_companies.py`)

**Status**: ✅ Marked as completed (Task 5.1)

Migrates company data from `config/companies.json` to Firestore.

### 3. Contact Migration (`migrate_contacts.py`)

**Status**: ✅ Marked as completed (Task 5.2)

Migrates contact data from `config/contacts.json` to Firestore.

### 4. Project Migration (`migrate_projects.py`)

**Status**: ✅ Marked as completed (Task 5.3)

Migrates historical project data from `input/*/projects.json` to Firestore.

## Template Variable Analysis

The template analyzer scans for `{{variable_name}}` patterns in:

- Document paragraphs
- Table cells
- Headers
- Footers

**Standard Variables** (auto-recognized):
- `project_name`
- `company_name`
- `contact_name`
- `price`
- `date`
- `created_at`
- `updated_at`
- `status`
- `quotation_number`
- `contract_number`
- `invoice_number`
- `document_number`

**Custom Variables**:
Any variable not in the standard list is categorized as custom and will be stored in the template's `variables.extra` array.

## Verification

After running migrations, verify in Firebase Console:

### Firestore
1. Go to Firestore Database
2. Check `templates` collection
3. Verify documents have all required fields

### Storage
1. Go to Storage
2. Navigate to `templates/` folder
3. Verify template files are uploaded

## Troubleshooting

### Error: "Service account key not found"
```
❌ Service account key not found.
Please download from Firebase Console and save as 'service-account-key.json'
```
**Solution**: Download service account key as described in Prerequisites section.

### Error: "Required packages not installed"
```
❌ Required packages not installed.
Please install: pip install python-docx firebase-admin
```
**Solution**: Run `pip install python-docx firebase-admin google-cloud-storage`

### Error: "Template not found"
```
⚠️  Template not found: /path/to/template.docx
```
**Solution**: Ensure template files exist in the `templates/` directory.

### Error: "Permission denied" (Storage)
**Solution**:
1. Verify service account has "Firebase Admin" role
2. Check Storage security rules allow write access
3. Ensure storage bucket name is correct in initialization

## Migration Order

Follow this order for complete data migration:

1. ✅ Templates (Task 5.4) - `migrate_templates.py`
2. ✅ Companies (Task 5.1) - `migrate_companies.py`
3. ✅ Contacts (Task 5.2) - `migrate_contacts.py`
4. ✅ Projects (Task 5.3) - `migrate_projects.py`

## Notes

- All scripts use Firebase Admin SDK for direct database access
- Scripts are idempotent - running multiple times won't create duplicates (uses deterministic IDs)
- Migration logs are printed to console
- All timestamps use `firestore.SERVER_TIMESTAMP` for consistency
- `created_by` is set to `'migration_script'` to distinguish from user-created content

## Security

⚠️ **Never commit these files**:
- `service-account-key.json`
- `serviceAccountKey.json`
- Any `.json` files in `.firebase/` directory

These are already in `.gitignore`.
