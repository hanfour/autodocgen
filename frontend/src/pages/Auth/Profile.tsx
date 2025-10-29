/**
 * User Profile Page
 *
 * Allow users to view and edit their profile
 * - Update display name
 * - Upload avatar
 * - View account info
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { User, Camera, Save, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.display_name || '');
    }
    if (user?.photoURL) {
      setAvatarUrl(user.photoURL);
      setAvatarPreview(user.photoURL);
    }
  }, [user, userProfile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: '圖片大小不能超過 2MB' });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: '只能上傳圖片檔案' });
        return;
      }

      setAvatarFile(file);

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string> => {
    if (!avatarFile || !user) return avatarUrl;

    const timestamp = Date.now();
    const filename = `avatars/${user.uid}_${timestamp}_${avatarFile.name}`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, avatarFile);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!user || !userProfile) return;

    // Validation
    if (!displayName.trim()) {
      setMessage({ type: 'error', text: '請輸入姓名' });
      return;
    }

    if (displayName.length < 2) {
      setMessage({ type: 'error', text: '姓名至少需要 2 個字元' });
      return;
    }

    setLoading(true);

    try {
      // Upload avatar if changed
      let newAvatarUrl = avatarUrl;
      if (avatarFile) {
        newAvatarUrl = await uploadAvatar();
        setAvatarUrl(newAvatarUrl);
      }

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: displayName.trim(),
        photoURL: newAvatarUrl || null,
      });

      // Update Firestore user document
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        display_name: displayName.trim(),
        avatar_url: newAvatarUrl || null,
        updated_at: serverTimestamp(),
      });

      setMessage({ type: 'success', text: '個人資料更新成功！' });
      setAvatarFile(null);

      // Reload to update context
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Update profile error:', error);
      setMessage({ type: 'error', text: '更新失敗，請稍後再試' });
    } finally {
      setLoading(false);
    }
  };

  if (!user || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <h1 className="text-3xl font-bold text-gray-900">個人資料</h1>
        <p className="text-gray-600 mt-2">更新您的個人資訊和頭像</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <span
            className={`text-sm ${
              message.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}
          >
            {message.text}
          </span>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              個人頭像
            </label>
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center border-4 border-gray-200">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border-2 border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <Camera className="w-4 h-4 text-gray-600" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  點擊相機圖標上傳新頭像
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  建議尺寸 200x200 像素，最大 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              姓名
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input-field"
              placeholder="您的姓名"
              disabled={loading}
            />
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              電子郵件
            </label>
            <input
              type="email"
              value={user.email || ''}
              className="input-field bg-gray-50 cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">電子郵件無法修改</p>
          </div>

          {/* Account Created */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              帳號創建時間
            </label>
            <input
              type="text"
              value={
                userProfile.created_at
                  ? new Date(
                      userProfile.created_at instanceof Date
                        ? userProfile.created_at
                        : userProfile.created_at
                    ).toLocaleString('zh-TW')
                  : '未知'
              }
              className="input-field bg-gray-50 cursor-not-allowed"
              disabled
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 justify-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  更新中...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  儲存變更
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="btn-secondary"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
