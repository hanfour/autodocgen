import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Save, X, ArrowLeft } from 'lucide-react';
import { getDocument, createDocument, updateDocument } from '../../firebase/firestore';

interface CompanyFormData {
  company_name: string;
  address: string;
  phone: string;
  email: string;
  tax_id: string;
  website?: string;
  notes?: string;
}

const CompanyForm: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const isEdit = !!companyId;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CompanyFormData>();

  useEffect(() => {
    if (isEdit && companyId) {
      loadCompany();
    }
  }, [companyId]);

  const loadCompany = async () => {
    try {
      setLoading(true);
      const company = await getDocument('companies', companyId!);
      if (company) {
        reset(company);
      }
    } catch (err) {
      console.error('Error loading company:', err);
      setError('加载公司信息失败');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CompanyFormData) => {
    try {
      setSaving(true);
      setError('');

      const companyData = {
        ...data,
        updated_at: new Date(),
      };

      if (isEdit) {
        await updateDocument('companies', companyId!, companyData);
      } else {
        await createDocument('companies', {
          ...companyData,
          created_at: new Date(),
        });
      }

      navigate('/companies');
    } catch (err: any) {
      console.error('Error saving company:', err);
      setError(err.message || '保存失败');
    } finally {
      setSaving(false);
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
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/companies')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回公司列表
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? '编辑公司' : '新增公司'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEdit ? '修改公司信息' : '创建新的公司资料'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-700">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="card">
        <div className="space-y-6">
          {/* Company Name */}
          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
              公司名称 *
            </label>
            <input
              id="company_name"
              type="text"
              {...register('company_name', { required: '请输入公司名称' })}
              className={`input ${errors.company_name ? 'input-error' : ''}`}
              placeholder="例如: 测试科技有限公司"
            />
            {errors.company_name && (
              <p className="text-error-600 text-sm mt-1">{errors.company_name.message}</p>
            )}
          </div>

          {/* Tax ID */}
          <div>
            <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700 mb-2">
              统一编号
            </label>
            <input
              id="tax_id"
              type="text"
              {...register('tax_id')}
              className="input"
              placeholder="8位数字"
              maxLength={8}
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                联系电话
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className="input"
                placeholder="02-1234-5678"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                电子邮箱
              </label>
              <input
                id="email"
                type="email"
                {...register('email', {
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: '请输入有效的邮箱地址',
                  },
                })}
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="info@company.com"
              />
              {errors.email && (
                <p className="text-error-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
              公司地址
            </label>
            <input
              id="address"
              type="text"
              {...register('address')}
              className="input"
              placeholder="台北市信义区信义路五段7号"
            />
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
              公司网站
            </label>
            <input
              id="website"
              type="url"
              {...register('website')}
              className="input"
              placeholder="https://www.company.com"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              备注
            </label>
            <textarea
              id="notes"
              {...register('notes')}
              className="input"
              rows={4}
              placeholder="其他相关信息..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={() => navigate('/companies')}
            className="btn-secondary flex items-center gap-2"
            disabled={saving}
          >
            <X className="w-4 h-4" />
            取消
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyForm;
