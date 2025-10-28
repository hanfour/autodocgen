import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Save, X, AlertCircle, Loader } from 'lucide-react';
import { getDocument, updateDocument, getDocuments } from '../../firebase/firestore';
import { buildQuery } from '../../firebase/firestore';

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

interface Project {
  id: string;
  project_name: string;
  company_ref: string;
  contact_ref: string;
  price: number;
  date: string;
  status: string;
  extra_data?: Record<string, any>;
  generated_docs?: any[];
}

interface EditProjectFormData {
  project_name: string;
  company_ref: string;
  contact_ref: string;
  price: number;
  date: string;
  extra_data?: Record<string, any>;
}

const EditProject: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<EditProjectFormData>();

  const selectedCompanyRef = watch('company_ref');

  // Load project data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        if (!projectId) {
          setError('Project ID is required');
          return;
        }

        // Load project
        const projectData = await getDocument<Project>('projects', projectId);
        if (!projectData) {
          setError('Project not found');
          return;
        }

        setProject(projectData);

        // Load companies and contacts
        const [companiesData, contactsData] = await Promise.all([
          getDocuments<Company>('companies'),
          getDocuments<Contact>('contacts'),
        ]);

        setCompanies(companiesData);
        setContacts(contactsData);

        // Pre-fill form with project data
        reset({
          project_name: projectData.project_name,
          company_ref: projectData.company_ref,
          contact_ref: projectData.contact_ref,
          price: projectData.price,
          date: projectData.date,
          extra_data: projectData.extra_data || {},
        });
      } catch (err: any) {
        console.error('Error loading project:', err);
        setError(err.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId, reset]);

  // Filter contacts by selected company
  useEffect(() => {
    if (selectedCompanyRef) {
      const filtered = contacts.filter(
        (contact) => contact.company_ref === selectedCompanyRef
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [selectedCompanyRef, contacts]);

  const onSubmit = async (data: EditProjectFormData) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (!projectId) {
        setError('Project ID is required');
        return;
      }

      // Validate data
      if (!data.project_name.trim()) {
        setError('Project name is required');
        return;
      }

      if (data.price <= 0) {
        setError('Price must be greater than 0');
        return;
      }

      // Update project in Firestore
      await updateDocument('projects', projectId, {
        project_name: data.project_name,
        company_ref: data.company_ref,
        contact_ref: data.contact_ref,
        price: data.price,
        date: data.date,
        extra_data: data.extra_data || {},
      });

      setSuccess('Project updated successfully!');

      // Redirect to project detail after 2 seconds
      setTimeout(() => {
        navigate(`/projects/${projectId}`);
      }, 2000);
    } catch (err: any) {
      console.error('Error updating project:', err);
      setError(err.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-error-50 border border-error-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-error-900">Error Loading Project</h3>
            <p className="text-error-700 text-sm mt-1">{error}</p>
            <button
              onClick={() => navigate('/projects')}
              className="btn-secondary mt-3"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Project</h1>
        <p className="text-gray-600 mt-1">Update project information</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg text-success-700 flex items-center gap-2">
          <Save className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && project && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-700 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Warning about generated documents */}
      {project && project.generated_docs && project.generated_docs.length > 0 && (
        <div className="mb-6 p-4 bg-warning-50 border border-warning-200 rounded-lg text-warning-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Note about generated documents</p>
              <p className="text-sm mt-1">
                This project has {project.generated_docs.length} generated document(s).
                Editing the project will not automatically regenerate these documents.
                You can regenerate them manually from the project detail page.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-card p-6">
        {/* Basic Information */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

            {/* Project Name */}
            <div className="mb-4">
              <label htmlFor="project_name" className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                id="project_name"
                type="text"
                {...register('project_name', { required: 'Project name is required' })}
                className={`input ${errors.project_name ? 'input-error' : ''}`}
                placeholder="Enter project name"
              />
              {errors.project_name && (
                <p className="text-error-600 text-sm mt-1">{errors.project_name.message}</p>
              )}
            </div>

            {/* Company */}
            <div className="mb-4">
              <label htmlFor="company_ref" className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <select
                id="company_ref"
                {...register('company_ref', { required: 'Company is required' })}
                className={`input ${errors.company_ref ? 'input-error' : ''}`}
              >
                <option value="">Select a company</option>
                {companies.map((company) => (
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
            <div className="mb-4">
              <label htmlFor="contact_ref" className="block text-sm font-medium text-gray-700 mb-2">
                Contact *
              </label>
              <select
                id="contact_ref"
                {...register('contact_ref', { required: 'Contact is required' })}
                className={`input ${errors.contact_ref ? 'input-error' : ''}`}
                disabled={!selectedCompanyRef}
              >
                <option value="">
                  {selectedCompanyRef ? 'Select a contact' : 'Select a company first'}
                </option>
                {filteredContacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.contact_name} ({contact.email})
                  </option>
                ))}
              </select>
              {errors.contact_ref && (
                <p className="text-error-600 text-sm mt-1">{errors.contact_ref.message}</p>
              )}
            </div>

            {/* Price */}
            <div className="mb-4">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price (NT$) *
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                {...register('price', {
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be greater than 0' },
                })}
                className={`input ${errors.price ? 'input-error' : ''}`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-error-600 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>

            {/* Date */}
            <div className="mb-4">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                id="date"
                type="date"
                {...register('date', { required: 'Date is required' })}
                className={`input ${errors.date ? 'input-error' : ''}`}
              />
              {errors.date && (
                <p className="text-error-600 text-sm mt-1">{errors.date.message}</p>
              )}
            </div>
          </div>

          {/* Project Status Info (Read-only) */}
          {project && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Project Status</h3>
              <p className="text-sm text-gray-600">
                Current Status:{' '}
                <span className={`badge badge-${project.status}`}>
                  {project.status.replace('_', ' ').toUpperCase()}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Status cannot be changed from this page. Use the project detail page to update status.
              </p>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary flex items-center gap-2"
            disabled={saving}
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProject;
