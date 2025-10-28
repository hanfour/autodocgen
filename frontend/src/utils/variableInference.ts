/**
 * Variable Type Inference Utilities
 *
 * Provides Regex-based heuristics for inferring variable types and configurations
 * from variable names extracted from templates.
 */

export type VariableType =
  | 'text'
  | 'number'
  | 'date'
  | 'email'
  | 'tel'
  | 'select'
  | 'textarea';

export interface VariableConfig {
  name: string;
  type: VariableType;
  label: string;
  required: boolean;
  defaultValue?: string;
  options?: string[]; // For 'select' type
  placeholder?: string;
  helpText?: string;
}

export interface InferenceRule {
  pattern: RegExp;
  type: VariableType;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  helpText?: string;
}

/**
 * Inference rules ordered by specificity (most specific first)
 */
const INFERENCE_RULES: InferenceRule[] = [
  // Date types - Most specific first
  {
    pattern: /^(date|日期|deadline|due_date|start_date|end_date|created_at|updated_at|時間)$/i,
    type: 'date',
    required: false,
    placeholder: 'YYYY-MM-DD',
    helpText: 'Select a date',
  },
  {
    pattern: /(date|日期|time|時間|day|年|月|日)$/i,
    type: 'date',
    required: false,
    placeholder: 'YYYY-MM-DD',
  },

  // Email types
  {
    pattern: /^(email|mail|e_mail|電郵|郵箱|信箱)$/i,
    type: 'email',
    required: false,
    placeholder: 'example@company.com',
    helpText: 'Enter a valid email address',
  },
  {
    pattern: /(email|mail|e_mail)$/i,
    type: 'email',
    required: false,
    placeholder: 'user@example.com',
  },

  // Phone/Tel types
  {
    pattern: /^(phone|tel|mobile|cell|telephone|電話|手機|聯絡電話)$/i,
    type: 'tel',
    required: false,
    placeholder: '02-1234-5678',
    helpText: 'Enter phone number',
  },
  {
    pattern: /(phone|tel|fax|傳真)$/i,
    type: 'tel',
    required: false,
    placeholder: '0912-345-678',
  },

  // Number/Amount types
  {
    pattern: /^(price|amount|cost|fee|total|subtotal|tax|discount|quantity|count|number|金額|價格|數量|總計|小計|稅金)$/i,
    type: 'number',
    required: false,
    placeholder: '0.00',
    helpText: 'Enter numeric value',
  },
  {
    pattern: /(price|amount|cost|fee|金額|價格)$/i,
    type: 'number',
    required: false,
    placeholder: '0',
  },

  // Select types with predefined options
  {
    pattern: /^(status|狀態)$/i,
    type: 'select',
    options: ['draft', 'in_progress', 'paused', 'pending_invoice', 'pending_payment', 'completed'],
    required: true,
    helpText: 'Select project status',
  },
  {
    pattern: /^(type|類型|category|分類|kind|種類)$/i,
    type: 'select',
    options: ['quote', 'contract', 'invoice', 'custom'],
    required: false,
    helpText: 'Select document type',
  },
  {
    pattern: /^(terms|payment_terms|付款條件)$/i,
    type: 'select',
    options: ['Cash', 'NET 30', 'NET 60', 'Installment', 'Upon Completion'],
    required: false,
    helpText: 'Select payment terms',
  },
  {
    pattern: /^(priority|優先級)$/i,
    type: 'select',
    options: ['Low', 'Medium', 'High', 'Urgent'],
    required: false,
  },

  // Textarea types (for longer text)
  {
    pattern: /^(description|desc|notes|note|remark|remarks|comment|comments|details|說明|備註|詳情)$/i,
    type: 'textarea',
    required: false,
    placeholder: 'Enter detailed description...',
    helpText: 'Provide detailed information',
  },
  {
    pattern: /(description|desc|notes|remark|comment)$/i,
    type: 'textarea',
    required: false,
  },

  // Generic select (keywords suggesting options)
  {
    pattern: /(option|choice|selection|選項)$/i,
    type: 'select',
    options: ['Option 1', 'Option 2', 'Option 3'],
    required: false,
    helpText: 'Customize options as needed',
  },
];

/**
 * Generate a human-readable label from variable name
 */
export function generateLabel(variableName: string): string {
  // Replace underscores and hyphens with spaces
  let label = variableName.replace(/[_-]/g, ' ');

  // Capitalize first letter of each word
  label = label.replace(/\b\w/g, (char) => char.toUpperCase());

  return label;
}

/**
 * Infer variable configuration from variable name
 */
export function inferVariableConfig(variableName: string): VariableConfig {
  // Try each rule in order (most specific first)
  for (const rule of INFERENCE_RULES) {
    if (rule.pattern.test(variableName)) {
      return {
        name: variableName,
        type: rule.type,
        label: generateLabel(variableName),
        required: rule.required ?? false,
        defaultValue: '',
        options: rule.options,
        placeholder: rule.placeholder,
        helpText: rule.helpText,
      };
    }
  }

  // Default fallback: text type
  return {
    name: variableName,
    type: 'text',
    label: generateLabel(variableName),
    required: false,
    defaultValue: '',
    placeholder: `Enter ${generateLabel(variableName).toLowerCase()}`,
  };
}

/**
 * Infer configurations for multiple variables
 */
export function inferVariableConfigs(variableNames: string[]): VariableConfig[] {
  return variableNames.map((name) => inferVariableConfig(name));
}

/**
 * Get type-specific validation rules
 */
export function getValidationRules(type: VariableType): Record<string, any> {
  const rules: Record<VariableType, Record<string, any>> = {
    text: {
      maxLength: 255,
    },
    number: {
      type: 'number',
      min: 0,
    },
    date: {
      pattern: /^\d{4}-\d{2}-\d{2}$/,
      errorMessage: 'Date must be in YYYY-MM-DD format',
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      errorMessage: 'Invalid email format',
    },
    tel: {
      pattern: /^[\d\s()+-]+$/,
      errorMessage: 'Invalid phone number format',
    },
    select: {
      // Options must be provided
    },
    textarea: {
      maxLength: 2000,
    },
  };

  return rules[type] || {};
}

/**
 * Get input type for HTML input element
 */
export function getHtmlInputType(type: VariableType): string {
  const htmlTypes: Record<VariableType, string> = {
    text: 'text',
    number: 'number',
    date: 'date',
    email: 'email',
    tel: 'tel',
    select: 'select',
    textarea: 'textarea',
  };

  return htmlTypes[type] || 'text';
}

/**
 * Validate variable value against its type
 */
export function validateVariableValue(
  value: string,
  config: VariableConfig
): { valid: boolean; error?: string } {
  // Required check
  if (config.required && !value.trim()) {
    return {
      valid: false,
      error: `${config.label} is required`,
    };
  }

  // Skip validation if empty and not required
  if (!value.trim() && !config.required) {
    return { valid: true };
  }

  // Type-specific validation
  switch (config.type) {
    case 'email': {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        return {
          valid: false,
          error: 'Invalid email format',
        };
      }
      break;
    }

    case 'number': {
      const num = Number(value);
      if (isNaN(num)) {
        return {
          valid: false,
          error: 'Must be a valid number',
        };
      }
      break;
    }

    case 'date': {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(value)) {
        return {
          valid: false,
          error: 'Date must be in YYYY-MM-DD format',
        };
      }
      // Verify it's a valid date
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return {
          valid: false,
          error: 'Invalid date',
        };
      }
      break;
    }

    case 'tel': {
      const telPattern = /^[\d\s()+-]+$/;
      if (!telPattern.test(value)) {
        return {
          valid: false,
          error: 'Invalid phone number format',
        };
      }
      break;
    }

    case 'select': {
      if (config.options && !config.options.includes(value)) {
        return {
          valid: false,
          error: 'Invalid selection',
        };
      }
      break;
    }

    case 'textarea':
    case 'text': {
      const maxLength = config.type === 'textarea' ? 2000 : 255;
      if (value.length > maxLength) {
        return {
          valid: false,
          error: `Maximum ${maxLength} characters allowed`,
        };
      }
      break;
    }
  }

  return { valid: true };
}

/**
 * Get icon name for variable type (for UI display)
 */
export function getTypeIcon(type: VariableType): string {
  const icons: Record<VariableType, string> = {
    text: 'Type',
    number: 'Hash',
    date: 'Calendar',
    email: 'Mail',
    tel: 'Phone',
    select: 'List',
    textarea: 'AlignLeft',
  };

  return icons[type] || 'Type';
}

/**
 * Example usage for testing
 */
export const EXAMPLE_VARIABLES = [
  'project_name',
  'company_name',
  'contact_email',
  'phone',
  'price',
  'date',
  'status',
  'payment_terms',
  'description',
  'custom_field',
];

// For development/testing
if (typeof window !== 'undefined') {
  (window as any).variableInference = {
    inferVariableConfig,
    inferVariableConfigs,
    generateLabel,
    validateVariableValue,
    EXAMPLE_VARIABLES,
  };
}
