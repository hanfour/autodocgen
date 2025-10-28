import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, User, Phone, Mail, Building, Edit, Trash2, MessageCircle } from 'lucide-react';
import { getDocuments, getDocument, deleteDocument } from '../../firebase/firestore';

interface Contact {
  id: string;
  contact_name: string;
  email?: string;
  phone?: string;
  position?: string;
  company_ref: string;
  line_id?: string;
  avatar_url?: string;
  notes?: string;
  created_at?: any;
}

interface Company {
  id: string;
  company_name: string;
}

const ContactList: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Map<string, Company>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load contacts
      const contactsData = await getDocuments<Contact>('contacts');
      setContacts(contactsData);

      // Load companies
      const companiesMap = new Map<string, Company>();
      const uniqueCompanyRefs = [...new Set(contactsData.map(c => c.company_ref))];

      await Promise.all(
        uniqueCompanyRefs.map(async (ref) => {
          if (ref) {
            const companyId = ref.split('/').pop();
            if (companyId) {
              const company = await getDocument<Company>('companies', companyId);
              if (company) {
                companiesMap.set(ref, company);
              }
            }
          }
        })
      );

      setCompanies(companiesMap);
    } catch (error) {
      console.error('Error loading data:', error);
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
      await deleteDocument('contacts', id);
      setContacts(contacts.filter(c => c.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('删除失败');
    }
  };

  const getCompanyName = (companyRef: string): string => {
    const company = companies.get(companyRef);
    return company?.company_name || '未知公司';
  };

  const filteredContacts = contacts.filter(contact => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.contact_name.toLowerCase().includes(searchLower) ||
      contact.email?.toLowerCase().includes(searchLower) ||
      contact.phone?.includes(searchTerm) ||
      contact.line_id?.toLowerCase().includes(searchLower) ||
      getCompanyName(contact.company_ref).toLowerCase().includes(searchLower)
    );
  });

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
          <h1 className="text-3xl font-bold text-gray-900">联系人管理</h1>
          <p className="text-gray-600 mt-1">管理所有联系人信息</p>
        </div>
        <Link
          to="/contacts/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新增联系人
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="搜索姓名、公司、邮箱、电话或 LINE ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary-100 rounded-lg">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">总联系人</p>
              <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
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
                {contacts.filter(c => c.email).length}
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
                {contacts.filter(c => c.phone).length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success-100 rounded-lg">
              <MessageCircle className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">有 LINE</p>
              <p className="text-2xl font-bold text-gray-900">
                {contacts.filter(c => c.line_id).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact List */}
      {filteredContacts.length === 0 ? (
        <div className="card text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? '没有找到匹配的联系人' : '还没有联系人'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? '尝试其他搜索词' : '点击上方按钮创建第一个联系人'}
          </p>
          {!searchTerm && (
            <Link to="/contacts/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              新增联系人
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <div key={contact.id} className="card hover:shadow-lg transition-shadow">
              {/* Contact Header with Avatar */}
              <div className="flex items-start gap-3 mb-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {contact.avatar_url ? (
                    <img
                      src={contact.avatar_url}
                      alt={contact.contact_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary-600" />
                    </div>
                  )}
                </div>

                {/* Name and Company */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {contact.contact_name}
                  </h3>
                  {contact.position && (
                    <p className="text-xs text-gray-500">{contact.position}</p>
                  )}
                  <div className="flex items-center gap-1 mt-1">
                    <Building className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-600 truncate">
                      {getCompanyName(contact.company_ref)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                {contact.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{contact.phone}</span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{contact.email}</span>
                  </div>
                )}
                {contact.line_id && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MessageCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">LINE: {contact.line_id}</span>
                  </div>
                )}
                {contact.notes && (
                  <div className="text-sm text-gray-500 italic line-clamp-2 mt-2 pt-2 border-t">
                    {contact.notes}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Link
                  to={`/contacts/${contact.id}/edit`}
                  className="btn-secondary btn-sm flex-1 flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  编辑
                </Link>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className={`btn-sm flex-1 flex items-center justify-center gap-2 transition-colors ${
                    deleteConfirm === contact.id
                      ? 'bg-error-600 text-white hover:bg-error-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-error-50 hover:text-error-600'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  {deleteConfirm === contact.id ? '确认删除' : '删除'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactList;
