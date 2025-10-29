/**
 * Template List Page
 *
 * Display and manage document templates
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FileText, Edit, Trash2, Eye } from 'lucide-react';
import { getDocuments, deleteDocument } from '../../firebase/firestore';
import { ActivityLogger } from '../../utils/activityLogger';

interface Template {
  id: string;
  template_name: string;
  template_type: string;
  description?: string;
  content: string;
  variables?: string[];
  is_active: boolean;
  created_at?: any;
  updated_at?: any;
}

const TemplateList: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await getDocuments<Template>('templates');
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      const template = templates.find((t) => t.id === id);
      await deleteDocument('templates', id);

      if (template) {
        ActivityLogger.projectDeleted(template.template_name, id); // Reuse project logger for now
      }

      setTemplates(templates.filter((t) => t.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('刪除失敗');
    }
  };

  const filteredTemplates = templates
    .filter((template) => {
      const matchesSearch =
        template.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.template_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        filterType === 'all' || template.template_type === filterType;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const dateA = a.created_at?.seconds || 0;
      const dateB = b.created_at?.seconds || 0;
      return dateB - dateA;
    });

  const templateTypes = Array.from(new Set(templates.map((t) => t.template_type))).filter(Boolean);

  const stats = {
    total: templates.length,
    active: templates.filter((t) => t.is_active).length,
    inactive: templates.filter((t) => !t.is_active).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">模板管理</h1>
        <p className="text-gray-600 mt-2">管理文檔模板，用於快速生成標準化文件</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總模板數</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">啟用中</p>
              <p className="text-2xl font-bold text-success-600 mt-1">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">已停用</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">{stats.inactive}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索模板名稱、類型、說明..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          {/* Filter by Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="all">所有類型</option>
            {templateTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Create Button */}
          <Link to="/templates/new" className="btn-primary whitespace-nowrap">
            <Plus className="w-5 h-5" />
            新增模板
          </Link>
        </div>
      </div>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm || filterType !== 'all' ? '沒有符合的模板' : '還沒有模板'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterType !== 'all'
              ? '試試調整搜索條件'
              : '開始創建第一個文檔模板'}
          </p>
          {!searchTerm && filterType === 'all' && (
            <Link to="/templates/new" className="btn-primary inline-flex">
              <Plus className="w-5 h-5" />
              新增模板
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="card hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {template.template_name}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {template.template_type || '未分類'}
                  </span>
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${
                    template.is_active ? 'bg-success-500' : 'bg-gray-400'
                  }`}
                  title={template.is_active ? '啟用中' : '已停用'}
                ></div>
              </div>

              {/* Description */}
              {template.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {template.description}
                </p>
              )}

              {/* Variables */}
              {template.variables && template.variables.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">變量：</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.slice(0, 3).map((variable, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                      >
                        {variable}
                      </span>
                    ))}
                    {template.variables.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                        +{template.variables.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                <Link
                  to={`/templates/${template.id}`}
                  className="btn-secondary flex-1 justify-center text-sm"
                >
                  <Eye className="w-4 h-4" />
                  預覽
                </Link>
                <Link
                  to={`/templates/${template.id}/edit`}
                  className="btn-secondary"
                  title="編輯"
                >
                  <Edit className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleDelete(template.id)}
                  className={`btn-secondary ${
                    deleteConfirm === template.id ? 'bg-error-50 text-error-700' : ''
                  }`}
                  title={deleteConfirm === template.id ? '再次點擊確認刪除' : '刪除'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateList;
