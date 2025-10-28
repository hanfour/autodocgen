/**
 * Unit tests for variable inference logic
 */

import {
  inferVariableConfig,
  inferVariableConfigs,
  generateLabel,
  validateVariableValue,
  getHtmlInputType,
  type VariableConfig,
} from './variableInference';

describe('generateLabel', () => {
  it('should convert snake_case to Title Case', () => {
    expect(generateLabel('project_name')).toBe('Project Name');
    expect(generateLabel('company_name')).toBe('Company Name');
  });

  it('should convert kebab-case to Title Case', () => {
    expect(generateLabel('contact-email')).toBe('Contact Email');
  });

  it('should handle single words', () => {
    expect(generateLabel('price')).toBe('Price');
    expect(generateLabel('date')).toBe('Date');
  });

  it('should handle mixed case', () => {
    expect(generateLabel('custom_field_1')).toBe('Custom Field 1');
  });
});

describe('inferVariableConfig', () => {
  describe('Date type inference', () => {
    it('should infer date type for common date variable names', () => {
      const dateVars = ['date', 'deadline', 'start_date', 'end_date', '日期'];

      dateVars.forEach((varName) => {
        const config = inferVariableConfig(varName);
        expect(config.type).toBe('date');
        expect(config.name).toBe(varName);
      });
    });

    it('should provide date-specific placeholder', () => {
      const config = inferVariableConfig('date');
      expect(config.placeholder).toBe('YYYY-MM-DD');
    });
  });

  describe('Email type inference', () => {
    it('should infer email type for email variable names', () => {
      const emailVars = ['email', 'mail', 'contact_email', 'user_email'];

      emailVars.forEach((varName) => {
        const config = inferVariableConfig(varName);
        expect(config.type).toBe('email');
      });
    });

    it('should provide email-specific placeholder', () => {
      const config = inferVariableConfig('email');
      expect(config.placeholder).toContain('@');
    });
  });

  describe('Phone/Tel type inference', () => {
    it('should infer tel type for phone variable names', () => {
      const telVars = ['phone', 'tel', 'mobile', 'telephone', '電話'];

      telVars.forEach((varName) => {
        const config = inferVariableConfig(varName);
        expect(config.type).toBe('tel');
      });
    });
  });

  describe('Number type inference', () => {
    it('should infer number type for numeric variable names', () => {
      const numVars = ['price', 'amount', 'cost', 'fee', 'total', 'quantity', '金額'];

      numVars.forEach((varName) => {
        const config = inferVariableConfig(varName);
        expect(config.type).toBe('number');
      });
    });
  });

  describe('Select type inference', () => {
    it('should infer select type for status', () => {
      const config = inferVariableConfig('status');
      expect(config.type).toBe('select');
      expect(config.options).toBeDefined();
      expect(config.options?.length).toBeGreaterThan(0);
    });

    it('should infer select type for type/category', () => {
      const config = inferVariableConfig('type');
      expect(config.type).toBe('select');
      expect(config.options).toBeDefined();
    });

    it('should provide predefined options for payment_terms', () => {
      const config = inferVariableConfig('payment_terms');
      expect(config.type).toBe('select');
      expect(config.options).toContain('Cash');
      expect(config.options).toContain('NET 30');
    });
  });

  describe('Textarea type inference', () => {
    it('should infer textarea type for description fields', () => {
      const textareaVars = ['description', 'notes', 'remark', 'comment', 'details', '備註'];

      textareaVars.forEach((varName) => {
        const config = inferVariableConfig(varName);
        expect(config.type).toBe('textarea');
      });
    });
  });

  describe('Default text type', () => {
    it('should default to text type for unknown variables', () => {
      const config = inferVariableConfig('custom_field');
      expect(config.type).toBe('text');
    });

    it('should provide generic placeholder for text type', () => {
      const config = inferVariableConfig('project_name');
      expect(config.placeholder).toContain('project name');
    });
  });
});

describe('inferVariableConfigs', () => {
  it('should infer configs for multiple variables', () => {
    const variables = ['project_name', 'email', 'price', 'date'];
    const configs = inferVariableConfigs(variables);

    expect(configs).toHaveLength(4);
    expect(configs[0].type).toBe('text');
    expect(configs[1].type).toBe('email');
    expect(configs[2].type).toBe('number');
    expect(configs[3].type).toBe('date');
  });

  it('should preserve variable order', () => {
    const variables = ['a', 'b', 'c'];
    const configs = inferVariableConfigs(variables);

    expect(configs[0].name).toBe('a');
    expect(configs[1].name).toBe('b');
    expect(configs[2].name).toBe('c');
  });
});

describe('validateVariableValue', () => {
  describe('Required validation', () => {
    it('should reject empty value for required field', () => {
      const config: VariableConfig = {
        name: 'project_name',
        type: 'text',
        label: 'Project Name',
        required: true,
      };

      const result = validateVariableValue('', config);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should accept empty value for optional field', () => {
      const config: VariableConfig = {
        name: 'description',
        type: 'text',
        label: 'Description',
        required: false,
      };

      const result = validateVariableValue('', config);
      expect(result.valid).toBe(true);
    });
  });

  describe('Email validation', () => {
    const config: VariableConfig = {
      name: 'email',
      type: 'email',
      label: 'Email',
      required: false,
    };

    it('should accept valid email', () => {
      const result = validateVariableValue('test@example.com', config);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = validateVariableValue('invalid-email', config);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('email');
    });
  });

  describe('Number validation', () => {
    const config: VariableConfig = {
      name: 'price',
      type: 'number',
      label: 'Price',
      required: false,
    };

    it('should accept valid number', () => {
      const result = validateVariableValue('123.45', config);
      expect(result.valid).toBe(true);
    });

    it('should reject non-numeric value', () => {
      const result = validateVariableValue('abc', config);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('number');
    });
  });

  describe('Date validation', () => {
    const config: VariableConfig = {
      name: 'date',
      type: 'date',
      label: 'Date',
      required: false,
    };

    it('should accept valid date', () => {
      const result = validateVariableValue('2025-10-28', config);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid date format', () => {
      const result = validateVariableValue('28/10/2025', config);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid date', () => {
      const result = validateVariableValue('2025-13-45', config);
      expect(result.valid).toBe(false);
    });
  });

  describe('Phone validation', () => {
    const config: VariableConfig = {
      name: 'phone',
      type: 'tel',
      label: 'Phone',
      required: false,
    };

    it('should accept valid phone number', () => {
      const result = validateVariableValue('02-1234-5678', config);
      expect(result.valid).toBe(true);
    });

    it('should accept phone with parentheses', () => {
      const result = validateVariableValue('(02) 1234-5678', config);
      expect(result.valid).toBe(true);
    });

    it('should reject phone with letters', () => {
      const result = validateVariableValue('02-CALL-NOW', config);
      expect(result.valid).toBe(false);
    });
  });

  describe('Select validation', () => {
    const config: VariableConfig = {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: false,
      options: ['draft', 'in_progress', 'completed'],
    };

    it('should accept valid option', () => {
      const result = validateVariableValue('draft', config);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid option', () => {
      const result = validateVariableValue('invalid', config);
      expect(result.valid).toBe(false);
    });
  });

  describe('Length validation', () => {
    it('should reject text exceeding max length', () => {
      const config: VariableConfig = {
        name: 'name',
        type: 'text',
        label: 'Name',
        required: false,
      };

      const longText = 'a'.repeat(300);
      const result = validateVariableValue(longText, config);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('255');
    });

    it('should reject textarea exceeding max length', () => {
      const config: VariableConfig = {
        name: 'description',
        type: 'textarea',
        label: 'Description',
        required: false,
      };

      const longText = 'a'.repeat(2500);
      const result = validateVariableValue(longText, config);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('2000');
    });
  });
});

describe('getHtmlInputType', () => {
  it('should return correct HTML input types', () => {
    expect(getHtmlInputType('text')).toBe('text');
    expect(getHtmlInputType('number')).toBe('number');
    expect(getHtmlInputType('date')).toBe('date');
    expect(getHtmlInputType('email')).toBe('email');
    expect(getHtmlInputType('tel')).toBe('tel');
  });

  it('should return select/textarea for those types', () => {
    expect(getHtmlInputType('select')).toBe('select');
    expect(getHtmlInputType('textarea')).toBe('textarea');
  });
});

describe('Inference rule specificity', () => {
  it('should prioritize exact matches over partial matches', () => {
    // "date" should match the exact pattern, not the partial one
    const config = inferVariableConfig('date');
    expect(config.helpText).toBe('Select a date');
  });

  it('should prioritize specific rules over generic rules', () => {
    // "status" should get project status options, not generic select options
    const config = inferVariableConfig('status');
    expect(config.options).toContain('draft');
    expect(config.options).not.toContain('Option 1');
  });
});
