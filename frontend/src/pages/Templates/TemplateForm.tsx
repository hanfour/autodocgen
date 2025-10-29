/**
 * Template Form Page
 *
 * Create or edit document template
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Save, X, ArrowLeft, Trash2, Upload, FileText } from 'lucide-react';
import { getDocument, createDocument, updateDocument } from '../../firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/config';
import { ActivityLogger } from '../../utils/activityLogger';

interface TemplateFormData {
  template_name: string;
  template_type: string;
  description?: string;
  content: string;
  is_active: boolean;
  source_type: 'text' | 'file';
}

const TemplateForm: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const isEdit = !!templateId;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [variables, setVariables] = useState<string[]>([]);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [sourceType, setSourceType] = useState<'text' | 'file'>('text');
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<TemplateFormData>({
    defaultValues: {
      is_active: true,
      source_type: 'text',
    },
  });

  const content = watch('content');

  useEffect(() => {
    if (isEdit) {
      loadTemplate();
    }
  }, [templateId]);

  // Auto-detect variables in content
  useEffect(() => {
    if (content) {
      const matches = content.match(/\{\{([^}]+)\}\}/g);
      if (matches) {
        const detectedVars = matches.map((m) => m.replace(/\{\{|\}\}/g, '').trim());
        const uniqueVars = Array.from(new Set(detectedVars));
        setVariables(uniqueVars);
      }
    }
  }, [content]);

  const loadTemplate = async () => {
    try {
      const data = await getDocument<any>('templates', templateId!);
      if (data) {
        reset({
          template_name: data.template_name,
          template_type: data.template_type,
          description: data.description,
          content: data.content,
          is_active: data.is_active ?? true,
          source_type: data.source_type || 'text',
        });
        setVariables(data.variables || []);
        setSourceType(data.source_type || 'text');
        setFileUrl(data.file_url || '');
      }
    } catch (err: any) {
      console.error('Error loading template:', err);
      setError('載入模板失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ];

      if (!allowedTypes.includes(file.type)) {
        setError('只支持 PDF 或 Word 文檔（.pdf, .docx, .doc）');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('文件大小不能超過 10MB');
        return;
      }

      setTemplateFile(file);
      setError('');
    }
  };

  const uploadTemplateFile = async (): Promise<string> => {
    if (!templateFile) return fileUrl;

    const timestamp = Date.now();
    const filename = `templates/${timestamp}_${templateFile.name}`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, templateFile);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  };

  const onSubmit = async (data: TemplateFormData) => {
    try {
      setSaving(true);
      setError('');

      // Upload file if source_type is 'file'
      let uploadedFileUrl = fileUrl;
      if (sourceType === 'file' && templateFile) {
        uploadedFileUrl = await uploadTemplateFile();
      }

      const templateData = {
        ...data,
        source_type: sourceType,
        file_url: sourceType === 'file' ? uploadedFileUrl : null,
        file_name: sourceType === 'file' && templateFile ? templateFile.name : null,
        variables,
        updated_at: new Date(),
      };

      if (isEdit) {
        await updateDocument('templates', templateId!, templateData);
        ActivityLogger.projectUpdated(data.template_name, templateId!);
      } else {
        const newId = await createDocument('templates', {
          ...templateData,
          created_at: new Date(),
        });
        ActivityLogger.projectCreated(data.template_name, newId);
      }

      navigate('/templates');
    } catch (err: any) {
      console.error('Error saving template:', err);
      setError(err.message || '保存失敗');
    } finally {
      setSaving(false);
    }
  };

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const insertVariable = (variable: string) => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentContent = watch('content') || '';
      const newContent =
        currentContent.substring(0, start) +
        `{{${variable}}}` +
        currentContent.substring(end);

      // Update form value
      reset({
        ...watch(),
        content: newContent,
      });

      // Move cursor after inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
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
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/templates')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回模板列表
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? '編輯模板' : '新增模板'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg text-error-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">基本資訊</h2>

              <div className="space-y-4">
                {/* Template Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    模板名稱 <span className="text-error-500">*</span>
                  </label>
                  <input
                    {...register('template_name', { required: '請輸入模板名稱' })}
                    className="input-field"
                    placeholder="例如：服務合約、報價單"
                  />
                  {errors.template_name && (
                    <p className="mt-1 text-sm text-error-600">{errors.template_name.message}</p>
                  )}
                </div>

                {/* Template Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    模板類型 <span className="text-error-500">*</span>
                  </label>
                  <select
                    {...register('template_type', { required: '請選擇模板類型' })}
                    className="input-field"
                  >
                    <option value="">請選擇...</option>
                    <option value="合約">合約</option>
                    <option value="報價單">報價單</option>
                    <option value="提案">提案</option>
                    <option value="信函">信函</option>
                    <option value="發票">發票</option>
                    <option value="其他">其他</option>
                  </select>
                  {errors.template_type && (
                    <p className="mt-1 text-sm text-error-600">{errors.template_type.message}</p>
                  )}
                </div>

                {/* Source Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    模板來源 <span className="text-error-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSourceType('text')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        sourceType === 'text'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <FileText className={`w-6 h-6 mx-auto mb-2 ${sourceType === 'text' ? 'text-primary-600' : 'text-gray-400'}`} />
                      <p className={`text-sm font-medium ${sourceType === 'text' ? 'text-primary-900' : 'text-gray-700'}`}>
                        文字模板
                      </p>
                      <p className="text-xs text-gray-500 mt-1">在線編輯純文本</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSourceType('file')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        sourceType === 'file'
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Upload className={`w-6 h-6 mx-auto mb-2 ${sourceType === 'file' ? 'text-primary-600' : 'text-gray-400'}`} />
                      <p className={`text-sm font-medium ${sourceType === 'file' ? 'text-primary-900' : 'text-gray-700'}`}>
                        上傳文檔
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Word 或 PDF</p>
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">說明</label>
                  <textarea
                    {...register('description')}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="簡短描述此模板的用途"
                  />
                </div>

                {/* Is Active */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('is_active')}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label className="text-sm font-medium text-gray-700">啟用此模板</label>
                </div>
              </div>
            </div>

            {/* Content Card */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {sourceType === 'file' ? '上傳模板文檔' : '模板內容'}
              </h2>

              {sourceType === 'file' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    選擇文檔 <span className="text-error-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="template-file"
                    />
                    <label htmlFor="template-file" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      {templateFile || fileUrl ? (
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {templateFile ? templateFile.name : '已上傳文檔'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {templateFile
                              ? `${(templateFile.size / 1024 / 1024).toFixed(2)} MB`
                              : '點擊更換文檔'}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            點擊上傳或拖放文檔
                          </p>
                          <p className="text-xs text-gray-500">
                            支持 PDF、Word 文檔（.pdf, .docx, .doc）
                          </p>
                          <p className="text-xs text-gray-500 mt-1">最大 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 在文檔中使用 <code className="px-1 bg-gray-100 rounded">{'{{變量名稱}}'}</code>{' '}
                    標記需要替換的內容
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    內容 <span className="text-error-500">*</span>
                  </label>
                  <p className="text-sm text-gray-500 mb-2">
                    使用 <code className="px-1 bg-gray-100 rounded">{'{{變量名稱}}'}</code>{' '}
                    來插入變量
                  </p>
                  <textarea
                    {...register('content', { required: sourceType === 'text' ? '請輸入模板內容' : false })}
                    className="input-field resize-none font-mono text-sm"
                    rows={15}
                    placeholder="例如：親愛的 {{客戶名稱}}，感謝您選擇我們的 {{服務名稱}} 服務..."
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-error-600">{errors.content.message}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Variables */}
          <div className="space-y-6">
            {/* Detected Variables */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">偵測到的變量</h2>

              {variables.length > 0 ? (
                <div className="space-y-2">
                  {variables.map((variable, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => insertVariable(variable)}
                        className="flex-1 text-left text-sm font-mono text-gray-700 hover:text-primary-600"
                        title="點擊插入"
                      >
                        {'{{'}{variable}{'}}'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeVariable(index)}
                        className="p-1 text-gray-400 hover:text-error-600"
                        title="移除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  尚未偵測到變量
                  <br />
                  在內容中使用 {'{{變量名稱}}'} 格式
                </p>
              )}
            </div>

            {/* Help Card */}
            <div className="card bg-primary-50 border-primary-200">
              <h3 className="text-sm font-semibold text-primary-900 mb-2">💡 使用提示</h3>
              <ul className="text-sm text-primary-800 space-y-1">
                <li>• 變量會自動從內容中偵測</li>
                <li>• 點擊變量可快速插入</li>
                <li>• 使用一致的變量名稱</li>
                <li>• 常用變量：客戶名稱、日期、金額</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                保存中...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isEdit ? '更新模板' : '創建模板'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/templates')}
            className="btn-secondary"
          >
            <X className="w-5 h-5" />
            取消
          </button>
        </div>
      </form>
    </div>
  );
};

export default TemplateForm;
