import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Save, X, Loader, CheckCircle } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/config';
import { getDocuments } from '../../firebase/firestore';
import { inferVariableConfigs, type VariableConfig } from '../../utils/variableInference';

interface Company {
  id: string;
  company_name: string;
}

interface Contact {
  id: string;
  contact_name: string;
  email: string;
  company_ref?: string;
}

interface Template {
  id: string;
  name: string;
  type: string;
  variables: {
    standard: string[];
    extra: string[];
  };
  is_active: boolean;
}

interface CreateProjectFormData {
  project_name: string;
  company_ref: string;
  contact_ref: string;
  price: number;
  date: string;
}

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CreateProjectFormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0]
    }
  });

  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);

  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [extraFields, setExtraFields] = useState<Record<string, VariableConfig[]>>({});
  const [extraData, setExtraData] = useState<Record<string, Record<string, string>>>({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'creating' | 'generating' | 'done'>('creating');

  const selectedCompany = watch('company_ref');

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Filter contacts by company
  useEffect(() => {
    if (selectedCompany) {
      const filtered = contacts.filter(c => c.company_ref === selectedCompany);
      setFilteredContacts(filtered);

      // Reset contact if not in filtered list
      const currentContact = watch('contact_ref');
      if (currentContact && !filtered.find(c => c.id === currentContact)) {
        setValue('contact_ref', '');
      }
    } else {
      setFilteredContacts(contacts);
    }
  }, [selectedCompany, contacts]);

  // Update extra fields when templates change
  useEffect(() => {
    const newExtraFields: Record<string, VariableConfig[]> = {};
    const newExtraData: Record<string, Record<string, string>> = {};

    selectedTemplates.forEach(templateId => {
      const template = templates.find(t => t.id === templateId);
      if (template && template.variables.extra.length > 0) {
        // Infer configurations for extra variables
        const configs = inferVariableConfigs(template.variables.extra);
        newExtraFields[templateId] = configs;

        // Initialize data
        newExtraData[templateId] = extraData[templateId] || {};
      }
    });

    setExtraFields(newExtraFields);
    setExtraData(prev => ({ ...prev, ...newExtraData }));
  }, [selectedTemplates, templates]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      const [companiesData, contactsData, templatesData] = await Promise.all([
        getDocuments<Company>('companies'),
        getDocuments<Contact>('contacts'),
        getDocuments<Template>('templates')
      ]);

      setCompanies(companiesData);
      setContacts(contactsData);
      setTemplates(templatesData.filter(t => t.is_active));

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const toggleTemplate = (templateId: string) => {
    setSelectedTemplates(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const updateExtraField = (templateId: string, fieldName: string, value: string) => {
    setExtraData(prev => ({
      ...prev,
      [templateId]: {
        ...prev[templateId],
        [fieldName]: value
      }
    }));
  };

  const onSubmit = async (data: CreateProjectFormData) => {
    try {
      setSubmitting(true);
      setError('');
      setStep('creating');

      // Validate
      if (selectedTemplates.length === 0) {
        setError('Please select at least one template');
        return;
      }

      // Create project
      const createProject = httpsCallable(functions, 'create_project');
      const createResult = await createProject({
        project_name: data.project_name,
        company_ref: `companies/${data.company_ref}`,
        contact_ref: `contacts/${data.contact_ref}`,
        price: data.price,
        date: data.date,
        extra_data: extraData
      });

      const projectId = (createResult.data as any).project_id;

      // Generate documents
      setStep('generating');

      const generateDocs = httpsCallable(functions, 'generate_documents');
      await generateDocs({
        project_id: projectId,
        template_ids: selectedTemplates
      });

      setStep('done');

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/projects/${projectId}`);
      }, 2000);

    } catch (err: any) {
      console.error('Error creating project:', err);
      setError(err.message || 'Failed to create project');
      setStep('creating');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
        <p className="text-gray-600 mt-1">Fill in the details to create a project and generate documents</p>
      </div>

      {/* Progress */}
      {submitting && (
        <div className="card mb-6 bg-primary-50 border-primary-200">
          <div className="flex items-center gap-3">
            {step === 'done' ? (
              <CheckCircle className="w-6 h-6 text-success-600" />
            ) : (
              <Loader className="w-6 h-6 text-primary-600 animate-spin" />
            )}
            <div>
              <p className="font-medium text-gray-900">
                {step === 'creating' && 'Creating project...'}
                {step === 'generating' && 'Generating documents...'}
                {step === 'done' && 'Success! Redirecting...'}
              </p>
              <p className="text-sm text-gray-600">
                {step === 'creating' && 'Setting up your project'}
                {step === 'generating' && 'Processing templates and creating documents'}
                {step === 'done' && 'Project created successfully'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-700">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

          <div className="space-y-4">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                {...register('project_name', { required: 'Project name is required' })}
                className={`input ${errors.project_name ? 'input-error' : ''}`}
                placeholder="Enter project name"
                disabled={submitting}
              />
              {errors.project_name && (
                <p className="text-error-600 text-sm mt-1">{errors.project_name.message}</p>
              )}
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <select
                {...register('company_ref', { required: 'Company is required' })}
                className={`input ${errors.company_ref ? 'input-error' : ''}`}
                disabled={submitting}
              >
                <option value="">Select a company</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.company_name}
                  </option>
                ))}
              </select>
              {errors.company_ref && (
                <p className="text-error-600 text-sm mt-1">{errors.company_ref.message}</p>
              )}
            </div>

            {/* Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact *
              </label>
              <select
                {...register('contact_ref', { required: 'Contact is required' })}
                className={`input ${errors.contact_ref ? 'input-error' : ''}`}
                disabled={!selectedCompany || submitting}
              >
                <option value="">
                  {selectedCompany ? 'Select a contact' : 'Select a company first'}
                </option>
                {filteredContacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.contact_name} ({contact.email})
                  </option>
                ))}
              </select>
              {errors.contact_ref && (
                <p className="text-error-600 text-sm mt-1">{errors.contact_ref.message}</p>
              )}
            </div>

            {/* Price and Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (NT$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('price', {
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  })}
                  className={`input ${errors.price ? 'input-error' : ''}`}
                  placeholder="0.00"
                  disabled={submitting}
                />
                {errors.price && (
                  <p className="text-error-600 text-sm mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  {...register('date', { required: 'Date is required' })}
                  className={`input ${errors.date ? 'input-error' : ''}`}
                  disabled={submitting}
                />
                {errors.date && (
                  <p className="text-error-600 text-sm mt-1">{errors.date.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Template Selection */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Select Templates</h2>
          <p className="text-sm text-gray-600 mb-4">
            Choose which document templates to generate for this project
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(template => (
              <div
                key={template.id}
                onClick={() => !submitting && toggleTemplate(template.id)}
                className={`
                  p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${selectedTemplates.includes(template.id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                  ${submitting ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedTemplates.includes(template.id)}
                    onChange={() => {}}
                    className="mt-1"
                    disabled={submitting}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{template.type}</p>
                    {template.variables.extra.length > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        {template.variables.extra.length} custom field(s)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedTemplates.length === 0 && (
            <p className="text-sm text-gray-500 mt-4">No templates selected</p>
          )}
        </div>

        {/* Extra Fields */}
        {Object.keys(extraFields).length > 0 && (
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Additional Fields</h2>
            <p className="text-sm text-gray-600 mb-4">
              Fill in template-specific fields
            </p>

            {Object.entries(extraFields).map(([templateId, configs]) => {
              const template = templates.find(t => t.id === templateId);
              return (
                <div key={templateId} className="mb-6 last:mb-0">
                  <h3 className="font-medium text-gray-900 mb-3">
                    {template?.name}
                  </h3>
                  <div className="space-y-3">
                    {configs.map(config => (
                      <div key={config.name}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {config.label}
                          {config.required && <span className="text-error-600"> *</span>}
                        </label>
                        {config.type === 'textarea' ? (
                          <textarea
                            value={extraData[templateId]?.[config.name] || ''}
                            onChange={(e) => updateExtraField(templateId, config.name, e.target.value)}
                            placeholder={config.placeholder}
                            className="input"
                            rows={3}
                            disabled={submitting}
                          />
                        ) : config.type === 'select' ? (
                          <select
                            value={extraData[templateId]?.[config.name] || ''}
                            onChange={(e) => updateExtraField(templateId, config.name, e.target.value)}
                            className="input"
                            disabled={submitting}
                          >
                            <option value="">Select {config.label.toLowerCase()}</option>
                            {config.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={config.type}
                            value={extraData[templateId]?.[config.name] || ''}
                            onChange={(e) => updateExtraField(templateId, config.name, e.target.value)}
                            placeholder={config.placeholder}
                            className="input"
                            disabled={submitting}
                          />
                        )}
                        {config.helpText && (
                          <p className="text-xs text-gray-500 mt-1">{config.helpText}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="btn-secondary flex items-center gap-2"
            disabled={submitting}
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                {step === 'creating' ? 'Creating...' : 'Generating...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create & Generate
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProject;
