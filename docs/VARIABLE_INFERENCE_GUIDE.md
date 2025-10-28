# Variable Inference Guide

## Overview

The Variable Inference system provides intelligent, Regex-based heuristics for automatically determining variable types and configurations from template variable names. This eliminates manual configuration work and provides sensible defaults that users can customize.

## Core Concept

When a template is uploaded, the system:
1. Extracts all `{{variable_name}}` placeholders
2. Analyzes each variable name using pattern matching
3. Infers the most appropriate input type and configuration
4. Provides these as smart defaults to the user
5. Allows users to override any inferred settings

## Supported Variable Types

### 1. Text (`text`)
**Default type** for unrecognized variables.

**Examples**:
- `project_name` → Text input
- `company_name` → Text input
- `custom_field` → Text input

**Configuration**:
- Max length: 255 characters
- Generic placeholder generated from variable name

### 2. Number (`number`)
For numeric values like prices, amounts, quantities.

**Trigger Patterns**:
```
price, amount, cost, fee, total, subtotal,
tax, discount, quantity, count, number,
金額, 價格, 數量, 總計, 小計, 稅金
```

**Examples**:
- `price` → Number input (0.00)
- `total_amount` → Number input
- `quantity` → Number input

**Configuration**:
- Min value: 0
- Placeholder: "0.00" or "0"
- Validation: Must be numeric

### 3. Date (`date`)
For date selections.

**Trigger Patterns**:
```
date, 日期, deadline, due_date, start_date,
end_date, created_at, updated_at, 時間
```

**Examples**:
- `date` → Date picker
- `deadline` → Date picker
- `start_date` → Date picker

**Configuration**:
- Format: YYYY-MM-DD
- Placeholder: "YYYY-MM-DD"
- HTML5 date picker

### 4. Email (`email`)
For email addresses.

**Trigger Patterns**:
```
email, mail, e_mail, 電郵, 郵箱, 信箱
```

**Examples**:
- `email` → Email input
- `contact_email` → Email input
- `user_mail` → Email input

**Configuration**:
- Pattern validation: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- Placeholder: "example@company.com"
- Error message: "Invalid email format"

### 5. Tel (`tel`)
For phone numbers.

**Trigger Patterns**:
```
phone, tel, mobile, cell, telephone,
電話, 手機, 聯絡電話, fax, 傳真
```

**Examples**:
- `phone` → Phone input
- `mobile` → Phone input
- `contact_tel` → Phone input

**Configuration**:
- Pattern validation: `^[\d\s()+-]+$`
- Placeholder: "02-1234-5678" or "0912-345-678"
- Allows: digits, spaces, parentheses, plus, hyphen

### 6. Select (`select`)
For dropdown selections with predefined options.

**Trigger Patterns and Options**:

#### Status
```
Variable: status, 狀態
Options: draft, in_progress, paused, pending_invoice, pending_payment, completed
Required: true
```

#### Type/Category
```
Variable: type, 類型, category, 分類, kind, 種類
Options: quote, contract, invoice, custom
```

#### Payment Terms
```
Variable: terms, payment_terms, 付款條件
Options: Cash, NET 30, NET 60, Installment, Upon Completion
```

#### Priority
```
Variable: priority, 優先級
Options: Low, Medium, High, Urgent
```

**Examples**:
- `status` → Dropdown with project statuses
- `payment_terms` → Dropdown with payment options
- `type` → Dropdown with document types

**Configuration**:
- Predefined option lists
- Users can customize options
- Help text provided

### 7. Textarea (`textarea`)
For longer text content.

**Trigger Patterns**:
```
description, desc, notes, note, remark,
remarks, comment, comments, details,
說明, 備註, 詳情
```

**Examples**:
- `description` → Multi-line textarea
- `notes` → Textarea
- `remark` → Textarea

**Configuration**:
- Max length: 2000 characters
- Placeholder: "Enter detailed description..."
- Multi-line input

## Inference Rules

### Rule Priority

Rules are evaluated in order of **specificity** (most specific first):

```typescript
1. Exact matches (e.g., "date", "email", "status")
2. Suffix matches (e.g., "*_date", "*_email")
3. Partial matches (e.g., "*date*", "*mail*")
4. Generic patterns
5. Default fallback (text)
```

### Rule Matching Examples

```typescript
// Exact match - highest priority
"date" → matches /^(date|日期|...)$/ → date type with specific helpText

// Suffix match
"start_date" → matches /(.*)date$/i → date type

// Partial match
"quotation_date" → matches /(.*)date(.*)$/i → date type

// No match - default
"custom_xyz" → no pattern match → text type
```

### Multilingual Support

The system supports both English and Chinese (Traditional) variable names:

```
date / 日期 → date type
price / 金額 → number type
email / 電郵 → email type
phone / 電話 → tel type
status / 狀態 → select type
description / 說明 → textarea type
```

## API Reference

### `inferVariableConfig(variableName: string): VariableConfig`

Infer configuration for a single variable.

**Parameters**:
- `variableName` (string): The variable name from template

**Returns**:
```typescript
{
  name: string;              // Original variable name
  type: VariableType;        // Inferred type
  label: string;             // Human-readable label
  required: boolean;         // Whether required
  defaultValue?: string;     // Default value
  options?: string[];        // For 'select' type
  placeholder?: string;      // Input placeholder
  helpText?: string;         // Hint text
}
```

**Example**:
```typescript
const config = inferVariableConfig('contact_email');
// {
//   name: 'contact_email',
//   type: 'email',
//   label: 'Contact Email',
//   required: false,
//   placeholder: 'user@example.com',
//   helpText: 'Enter a valid email address'
// }
```

### `inferVariableConfigs(variableNames: string[]): VariableConfig[]`

Infer configurations for multiple variables at once.

**Parameters**:
- `variableNames` (string[]): Array of variable names

**Returns**: Array of `VariableConfig` objects

**Example**:
```typescript
const configs = inferVariableConfigs([
  'project_name',
  'price',
  'date',
  'status'
]);
// Returns 4 configs with appropriate types
```

### `generateLabel(variableName: string): string`

Generate human-readable label from variable name.

**Transformations**:
- Replaces `_` and `-` with spaces
- Capitalizes first letter of each word

**Examples**:
```typescript
generateLabel('project_name')    // → "Project Name"
generateLabel('contact-email')   // → "Contact Email"
generateLabel('total_amount')    // → "Total Amount"
```

### `validateVariableValue(value: string, config: VariableConfig): { valid: boolean; error?: string }`

Validate a value against variable configuration.

**Validation Checks**:
1. Required field check
2. Type-specific format validation
3. Length limits
4. Option validity (for select)

**Example**:
```typescript
const config = inferVariableConfig('email');
const result = validateVariableValue('invalid-email', config);
// { valid: false, error: 'Invalid email format' }

const result2 = validateVariableValue('user@example.com', config);
// { valid: true }
```

### `getHtmlInputType(type: VariableType): string`

Get HTML input type for rendering form fields.

**Mapping**:
```typescript
text     → "text"
number   → "number"
date     → "date"
email    → "email"
tel      → "tel"
select   → "select"
textarea → "textarea"
```

## Usage Examples

### Example 1: Template Upload Flow

```typescript
import { inferVariableConfigs } from '@/utils/variableInference';

// After extracting variables from template
const extractedVariables = [
  'project_name',
  'company_name',
  'contact_email',
  'phone',
  'price',
  'date',
  'payment_terms',
  'description'
];

// Infer configurations
const configs = inferVariableConfigs(extractedVariables);

// Show configurations to user for review/editing
setTemplateConfig({
  variables: {
    standard: standardVars,
    extra: configs
  }
});
```

### Example 2: Dynamic Form Generation

```typescript
import { inferVariableConfig, getHtmlInputType } from '@/utils/variableInference';

function DynamicField({ variableName, value, onChange }) {
  const config = inferVariableConfig(variableName);
  const inputType = getHtmlInputType(config.type);

  if (config.type === 'select') {
    return (
      <select value={value} onChange={onChange} required={config.required}>
        <option value="">Select {config.label}</option>
        {config.options?.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }

  if (config.type === 'textarea') {
    return (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={config.placeholder}
        required={config.required}
        maxLength={2000}
      />
    );
  }

  return (
    <input
      type={inputType}
      value={value}
      onChange={onChange}
      placeholder={config.placeholder}
      required={config.required}
    />
  );
}
```

### Example 3: Form Validation

```typescript
import { validateVariableValue, inferVariableConfig } from '@/utils/variableInference';

function validateForm(formData) {
  const errors = {};

  Object.entries(formData).forEach(([varName, value]) => {
    const config = inferVariableConfig(varName);
    const validation = validateVariableValue(value, config);

    if (!validation.valid) {
      errors[varName] = validation.error;
    }
  });

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
```

### Example 4: User Override

```typescript
// Start with inferred config
const config = inferVariableConfig('custom_status');
// { type: 'text', ... }

// User can override
const customConfig = {
  ...config,
  type: 'select',
  options: ['New', 'Active', 'Archived'],
  required: true
};

// Save custom configuration
await saveTemplateConfig(templateId, {
  variables: {
    extra: [customConfig]
  }
});
```

## Configuration Storage

Inferred configurations are stored in Firestore template documents:

```json
{
  "id": "template-123",
  "name": "Quotation Template",
  "variables": {
    "standard": ["project_name", "company_name", ...],
    "extra": [
      {
        "name": "delivery_date",
        "type": "date",
        "label": "Delivery Date",
        "required": false,
        "placeholder": "YYYY-MM-DD"
      },
      {
        "name": "payment_terms",
        "type": "select",
        "label": "Payment Terms",
        "required": true,
        "options": ["Cash", "NET 30", "NET 60"]
      }
    ]
  }
}
```

## Testing

Run unit tests:
```bash
npm test -- variableInference.test.ts
```

**Test Coverage**:
- ✅ Label generation
- ✅ Type inference for all types
- ✅ Rule specificity and priority
- ✅ Validation logic
- ✅ HTML input type mapping
- ✅ Multilingual support
- ✅ Edge cases

## Best Practices

### 1. Variable Naming Conventions

For best inference results, use descriptive variable names:

**Good**:
```
{{project_start_date}}  → Correctly inferred as date
{{contact_email}}       → Correctly inferred as email
{{total_price}}         → Correctly inferred as number
```

**Not Ideal**:
```
{{d1}}      → Defaults to text (unclear intent)
{{field1}}  → Defaults to text (unclear intent)
{{xyz}}     → Defaults to text (unclear intent)
```

### 2. Template Design

Structure your templates for optimal inference:

```docx
Project: {{project_name}}
Company: {{company_name}}
Contact: {{contact_name}}
Email: {{contact_email}}
Phone: {{contact_phone}}
Price: {{price}}
Date: {{date}}
Status: {{status}}
Payment Terms: {{payment_terms}}
Notes: {{notes}}
```

### 3. User Review

Always show inferred configurations to users for review:

```tsx
<div className="inferred-config">
  <h3>Detected Variables</h3>
  <p className="text-sm text-gray-600">
    We've automatically configured these variables. Review and modify as needed.
  </p>

  {configs.map(config => (
    <ConfigEditor
      key={config.name}
      config={config}
      onUpdate={(updated) => handleUpdate(config.name, updated)}
    />
  ))}
</div>
```

### 4. Custom Overrides

Provide easy customization:

```tsx
<select
  value={config.type}
  onChange={(e) => updateConfigType(config.name, e.target.value)}
>
  <option value="text">Text</option>
  <option value="number">Number</option>
  <option value="date">Date</option>
  <option value="email">Email</option>
  <option value="tel">Phone</option>
  <option value="select">Dropdown</option>
  <option value="textarea">Long Text</option>
</select>
```

## Extending the System

### Adding New Inference Rules

Add rules to `INFERENCE_RULES` array in order of specificity:

```typescript
const INFERENCE_RULES: InferenceRule[] = [
  // Add new rule here (more specific)
  {
    pattern: /^(invoice_number|發票號碼)$/i,
    type: 'text',
    required: true,
    placeholder: 'INV-YYYY-XXXX',
    helpText: 'Enter invoice number',
  },

  // Existing rules...
  {
    pattern: /(date|日期)$/i,
    type: 'date',
    // ...
  },
];
```

### Adding New Variable Types

1. Add to `VariableType`:
```typescript
export type VariableType =
  | 'text'
  | 'number'
  // ... existing types
  | 'url'        // New type
  | 'color';     // New type
```

2. Add validation logic:
```typescript
case 'url': {
  const urlPattern = /^https?:\/\/.+/;
  if (!urlPattern.test(value)) {
    return { valid: false, error: 'Invalid URL format' };
  }
  break;
}
```

3. Add HTML input type mapping:
```typescript
const htmlTypes: Record<VariableType, string> = {
  // ... existing types
  url: 'url',
  color: 'color',
};
```

## Performance Considerations

- **Inference is fast**: Regex-based, O(n) complexity
- **No external API calls**: All inference happens client-side
- **Minimal dependencies**: Standard JavaScript only
- **Cacheable**: Results can be cached per template

## Future Enhancements

Documented but not yet implemented:

- [ ] AI-assisted inference (GPT-4 based)
- [ ] Learning from user corrections
- [ ] Context-aware inference (based on surrounding text)
- [ ] Industry-specific rule sets
- [ ] Multi-language NLP inference
- [ ] Historical data analysis
