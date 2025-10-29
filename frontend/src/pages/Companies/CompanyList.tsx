import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Building, Phone, Mail, MapPin, Edit, Trash2 } from 'lucide-react';
import { getDocuments, deleteDocument } from '../../firebase/firestore';
import { ActivityLogger } from '../../utils/activityLogger';

interface Company {
  id: string;
  company_name: string;
  address?: string;
  phone?: string;
  email?: string;
  tax_id?: string;
  created_at?: any;
}

const CompanyList: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await getDocuments<Company>('companies');
      setCompanies(data);
    } catch (error) {
      console.error('Error loading companies:', error);
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
      const company = companies.find((c) => c.id === id);
      await deleteDocument('companies', id);

      if (company) {
        ActivityLogger.companyDeleted(company.company_name, id);
      }

      setCompanies(companies.filter(c => c.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('删除失败，可能有联系人或项目关联到此公司');
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.phone?.includes(searchTerm)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">公司管理</h1>
          <p className="text-gray-600 mt-1">管理所有公司信息</p>
        </div>
        <Link
          to="/companies/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新增公司
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜索公司名称、邮箱或电话..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Building className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">总公司数</p>
              <p className="text-2xl font-bold text-gray-900">{companies.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success-100 rounded-lg">
              <Mail className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">有邮箱</p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.filter(c => c.email).length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-info-100 rounded-lg">
              <Phone className="w-6 h-6 text-info-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">有电话</p>
              <p className="text-2xl font-bold text-gray-900">
                {companies.filter(c => c.phone).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Company List */}
      {filteredCompanies.length === 0 ? (
        <div className="card text-center py-12">
          <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? '没有找到匹配的公司' : '还没有公司'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? '尝试其他搜索词' : '点击上方按钮创建第一个公司'}
          </p>
          {!searchTerm && (
            <Link to="/companies/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              新增公司
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => (
            <div key={company.id} className="card hover:shadow-lg transition-shadow">
              {/* Company Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Building className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{company.company_name}</h3>
                    {company.tax_id && (
                      <p className="text-xs text-gray-500">统编: {company.tax_id}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Info */}
              <div className="space-y-2 mb-4">
                {company.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{company.phone}</span>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{company.email}</span>
                  </div>
                )}
                {company.address && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{company.address}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Link
                  to={`/companies/${company.id}/edit`}
                  className="btn-secondary btn-sm flex-1 flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  编辑
                </Link>
                <button
                  onClick={() => handleDelete(company.id)}
                  className={`btn-sm flex-1 flex items-center justify-center gap-2 transition-colors ${
                    deleteConfirm === company.id
                      ? 'bg-error-600 text-white hover:bg-error-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-error-50 hover:text-error-600'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  {deleteConfirm === company.id ? '确认删除' : '删除'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyList;
