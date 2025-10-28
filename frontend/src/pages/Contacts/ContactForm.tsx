import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Save, X, ArrowLeft, Upload, User, Camera } from 'lucide-react';
import { getDocument, getDocuments, createDocument, updateDocument } from '../../firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/config';

interface ContactFormData {
  contact_name: string;
  email: string;
  phone: string;
  position: string;
  company_ref: string;
  line_id: string;
  notes: string;
}

interface Company {
  id: string;
  company_name: string;
}

const ContactForm: React.FC = () => {
  const { contactId } = useParams<{ contactId: string }>();
  const navigate = useNavigate();
  const isEdit = !!contactId;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>();

  useEffect(() => {
    loadCompanies();
    if (isEdit && contactId) {
      loadContact();
    }
  }, [contactId]);

  const loadCompanies = async () => {
    try {
      const data = await getDocuments<Company>('companies');
      setCompanies(data);
    } catch (err) {
      console.error('Error loading companies:', err);
    }
  };

  const loadContact = async () => {
    try {
      setLoading(true);
      const contact = await getDocument('contacts', contactId!);
      if (contact) {
        reset(contact);
        if (contact.avatar_url) {
          setAvatarUrl(contact.avatar_url);
          setAvatarPreview(contact.avatar_url);
        }
      }
    } catch (err) {
      console.error('Error loading contact:', err);
      setError('加载联系人信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过 2MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('只能上传图片文件');
        return;
      }

      setAvatarFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string> => {
    if (!avatarFile) {
      return avatarUrl;
    }

    try {
      setUploading(true);

      // Create unique filename
      const timestamp = Date.now();
      const filename = `contacts/${contactId || 'new'}_${timestamp}_${avatarFile.name}`;
      const storageRef = ref(storage, filename);

      // Upload file
      await uploadBytes(storageRef, avatarFile);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (err) {
      console.error('Error uploading avatar:', err);
      throw new Error('头像上传失败');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: ContactFormData) => {
    try {
      setSaving(true);
      setError('');

      // Upload avatar if changed
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        finalAvatarUrl = await uploadAvatar();
      }

      const contactData = {
        ...data,
        avatar_url: finalAvatarUrl,
        updated_at: new Date(),
      };

      if (isEdit) {
        await updateDocument('contacts', contactId!, contactData);
      } else {
        await createDocument('contacts', {
          ...contactData,
          created_at: new Date(),
        });
      }

      navigate('/contacts');
    } catch (err: any) {
      console.error('Error saving contact:', err);
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
          onClick={() => navigate('/contacts')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回联系人列表
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? '编辑联系人' : '新增联系人'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEdit ? '修改联系人信息' : '创建新的联系人资料'}
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
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              头像
            </label>
            <div className="flex items-center gap-4">
              {/* Avatar Preview */}
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              {/* Upload Button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary flex items-center gap-2"
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? '上传中...' : '选择图片'}
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  支持 JPG、PNG 格式，最大 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="contact_name" className="block text-sm font-medium text-gray-700 mb-2">
              姓名 *
            </label>
            <input
              id="contact_name"
              type="text"
              {...register('contact_name', { required: '请输入姓名' })}
              className={`input ${errors.contact_name ? 'input-error' : ''}`}
              placeholder="例如: 张三"
            />
            {errors.contact_name && (
              <p className="text-error-600 text-sm mt-1">{errors.contact_name.message}</p>
            )}
          </div>

          {/* Company */}
          <div>
            <label htmlFor="company_ref" className="block text-sm font-medium text-gray-700 mb-2">
              所属公司 *
            </label>
            <select
              id="company_ref"
              {...register('company_ref', { required: '请选择公司' })}
              className={`input ${errors.company_ref ? 'input-error' : ''}`}
            >
              <option value="">请选择公司</option>
              {companies.map((company) => (
                <option key={company.id} value={`companies/${company.id}`}>
                  {company.company_name}
                </option>
              ))}
            </select>
            {errors.company_ref && (
              <p className="text-error-600 text-sm mt-1">{errors.company_ref.message}</p>
            )}
            {companies.length === 0 && (
              <p className="text-warning-600 text-sm mt-1">
                还没有公司，请先创建公司
              </p>
            )}
          </div>

          {/* Position */}
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-2">
              职位
            </label>
            <input
              id="position"
              type="text"
              {...register('position')}
              className="input"
              placeholder="例如: 项目经理"
            />
          </div>

          {/* Contact Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                联系电话
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className="input"
                placeholder="0912-345-678"
              />
            </div>

            {/* LINE ID */}
            <div>
              <label htmlFor="line_id" className="block text-sm font-medium text-gray-700 mb-2">
                LINE ID
              </label>
              <input
                id="line_id"
                type="text"
                {...register('line_id')}
                className="input"
                placeholder="line_id_123"
              />
            </div>
          </div>

          {/* Email */}
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
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="text-error-600 text-sm mt-1">{errors.email.message}</p>
            )}
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
            onClick={() => navigate('/contacts')}
            className="btn-secondary flex items-center gap-2"
            disabled={saving || uploading}
          >
            <X className="w-4 h-4" />
            取消
          </button>
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={saving || uploading}
          >
            <Save className="w-4 h-4" />
            {saving ? '保存中...' : uploading ? '上传中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
