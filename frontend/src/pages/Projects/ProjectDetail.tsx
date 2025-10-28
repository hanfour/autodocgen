import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit, Download, RefreshCw,
  Calendar, DollarSign, Building, User, FileText,
  Clock
} from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase/config';
import { getDocument } from '../../firebase/firestore';
import ShareButton from '../../components/Common/ShareButton';
import Modal from '../../components/Common/Modal';

interface Project {
  id: string;
  project_name: string;
  company_ref: string;
  contact_ref: string;
  price: number;
  date: string;
  status: string;
  generated_docs?: GeneratedDoc[];
  status_history?: StatusHistory[];
  created_at: any;
  updated_at: any;
  created_by: string;
}

interface GeneratedDoc {
  id: string;
  template_id: string;
  template_name: string;
  file_url: string;
  file_name: string;
  file_size: number;
  created_at: any;
}

interface StatusHistory {
  status: string;
  timestamp: any;
  updated_by: string;
}

interface Company {
  id: string;
  company_name: string;
  address?: string;
}

interface Contact {
  id: string;
  contact_name: string;
  email: string;
  phone?: string;
}

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      setError('');

      // Load project
      const projectData = await getDocument<Project>('projects', projectId!);

      if (!projectData) {
        setError('Project not found');
        return;
      }

      setProject(projectData);

      // Extract company and contact IDs from refs
      const companyId = projectData.company_ref.split('/').pop();
      const contactId = projectData.contact_ref.split('/').pop();

      // Load company and contact
      const [companyData, contactData] = await Promise.all([
        getDocument<Company>('companies', companyId!),
        getDocument<Contact>('contacts', contactId!)
      ]);

      setCompany(companyData);
      setContact(contactData);

    } catch (err: any) {
      console.error('Error loading project:', err);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (doc: GeneratedDoc) => {
    try {
      // In production, this would call a Cloud Function to generate a signed URL
      // For now, we'll show an alert
      alert(`Downloading: ${doc.file_name}\n\nIn production, this would download the file from:\n${doc.file_url}`);
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Failed to download document');
    }
  };

  const handleRegenerateDocument = async (doc: GeneratedDoc) => {
    if (!confirm(`Regenerate "${doc.template_name}"?\n\nThis will create a new version of the document.`)) {
      return;
    }

    try {
      setActionLoading(true);

      const regenerate = httpsCallable(functions, 'regenerate_document');
      await regenerate({
        project_id: projectId,
        document_id: doc.id
      });

      alert('Document regenerated successfully!');
      loadProject(); // Reload to show updated document

    } catch (err: any) {
      console.error('Error regenerating document:', err);
      alert('Failed to regenerate document: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;

    try {
      setActionLoading(true);

      const updateStatus = httpsCallable(functions, 'update_project_status');
      await updateStatus({
        project_id: projectId,
        status: newStatus
      });

      setShowStatusModal(false);
      loadProject(); // Reload to show updated status

    } catch (err: any) {
      console.error('Error updating status:', err);
      alert('Failed to update status: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    const classes: Record<string, string> = {
      draft: 'badge-draft',
      in_progress: 'badge-in-progress',
      paused: 'badge-paused',
      pending_invoice: 'badge-pending-invoice',
      pending_payment: 'badge-pending-payment',
      completed: 'badge-completed',
    };
    return classes[status] || 'badge-draft';
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="card bg-error-50 border-error-200">
          <p className="text-error-700">{error || 'Project not found'}</p>
          <button onClick={() => navigate('/projects')} className="btn-secondary mt-4">
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{project.project_name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                {formatStatus(project.status)}
              </span>
              <button
                onClick={() => {
                  setNewStatus(project.status);
                  setShowStatusModal(true);
                }}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Change Status
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShareButton
              resourceType="project"
              resourceId={project.id}
              resourceName={project.project_name}
              variant="secondary"
            />
            <Link
              to={`/projects/${project.id}/edit`}
              className="btn-secondary flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Project Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Building className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Company</p>
              <p className="font-medium text-gray-900">{company?.company_name}</p>
              {company?.address && (
                <p className="text-sm text-gray-600">{company.address}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Contact</p>
              <p className="font-medium text-gray-900">{contact?.contact_name}</p>
              <p className="text-sm text-gray-600">{contact?.email}</p>
              {contact?.phone && (
                <p className="text-sm text-gray-600">{contact.phone}</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-medium text-gray-900">
                NT$ {project.price.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium text-gray-900">{project.date}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Documents */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Generated Documents</h2>
          <span className="text-sm text-gray-500">
            {project.generated_docs?.length || 0} document(s)
          </span>
        </div>

        {project.generated_docs && project.generated_docs.length > 0 ? (
          <div className="space-y-3">
            {project.generated_docs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="w-8 h-8 text-primary-600" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{doc.template_name}</h3>
                    <p className="text-sm text-gray-500">
                      {doc.file_name} • {formatFileSize(doc.file_size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRegenerateDocument(doc)}
                    className="btn-secondary btn-sm flex items-center gap-2"
                    disabled={actionLoading}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Regenerate
                  </button>
                  <button
                    onClick={() => handleDownloadDocument(doc)}
                    className="btn-primary btn-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No documents generated yet</p>
          </div>
        )}
      </div>

      {/* Status History */}
      {project.status_history && project.status_history.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Status History</h2>
          <div className="space-y-3">
            {project.status_history.map((history, index) => (
              <div key={index} className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${getStatusBadgeClass(history.status)}`}>
                      {formatStatus(history.status)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {history.timestamp?.toDate?.()?.toLocaleString() || 'Just now'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Change Project Status"
        footer={
          <>
            <button
              onClick={() => setShowStatusModal(false)}
              className="btn-secondary"
              disabled={actionLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateStatus}
              className="btn-primary"
              disabled={actionLoading || newStatus === project.status}
            >
              {actionLoading ? 'Updating...' : 'Update Status'}
            </button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select New Status
          </label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="input w-full"
            disabled={actionLoading}
          >
            <option value="draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="paused">Paused</option>
            <option value="pending_invoice">Pending Invoice</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
