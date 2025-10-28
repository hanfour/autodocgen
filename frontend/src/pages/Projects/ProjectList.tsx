import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Filter, Search, Calendar, DollarSign } from 'lucide-react';
import { getDocuments, buildQuery } from '../../firebase/firestore';

interface Project {
  id: string;
  project_name: string;
  company_ref: string;
  contact_ref: string;
  price: number;
  date: string;
  status: string;
  created_at: any;
  updated_at: any;
  generated_docs?: any[];
}

type ProjectStatus = 'all' | 'draft' | 'in_progress' | 'paused' | 'pending_invoice' | 'pending_payment' | 'completed';

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState<ProjectStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'price' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load projects
  useEffect(() => {
    loadProjects();
  }, [statusFilter, sortBy, sortOrder]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');

      // Build query constraints
      const constraints = [];

      // Status filter
      if (statusFilter !== 'all') {
        constraints.push(buildQuery.where('status', '==', statusFilter));
      }

      // Sort
      const sortField = sortBy === 'name' ? 'project_name' : sortBy === 'price' ? 'price' : 'date';
      constraints.push(buildQuery.orderBy(sortField, sortOrder));

      // Fetch projects
      const projectsData = await getDocuments<Project>('projects', constraints);
      setProjects(projectsData);

    } catch (err: any) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Filter projects by search query (client-side)
  const filteredProjects = projects.filter(project => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return project.project_name.toLowerCase().includes(query);
  });

  // Get status badge class
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

  // Format status text
  const formatStatus = (status: string) => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-1">Manage all your projects</p>
        </div>
        <Link to="/projects/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          New Project
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className="input pl-10 w-full"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="paused">Paused</option>
              <option value="pending_invoice">Pending Invoice</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input"
            >
              <option value="date">Date</option>
              <option value="price">Price</option>
              <option value="name">Name</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="btn-secondary"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="spinner"></div>
          <span className="ml-3 text-gray-600">Loading projects...</span>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="card-hover cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">
                  {project.project_name}
                </h3>
                <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                  {formatStatus(project.status)}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{project.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>NT$ {project.price.toLocaleString()}</span>
                </div>
              </div>

              {/* Generated Documents */}
              {project.generated_docs && project.generated_docs.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    {project.generated_docs.length} document(s) generated
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery ? 'Try adjusting your search or filters' : 'Get started by creating your first project'}
          </p>
          {!searchQuery && (
            <Link to="/projects/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Project
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
