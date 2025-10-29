/**
 * Forgot Password Page
 *
 * Send password reset email
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (!email) {
      setMessage({ type: 'error', text: '請輸入電子郵件' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setMessage({ type: 'error', text: '請輸入有效的電子郵件地址' });
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      setMessage({
        type: 'success',
        text: '密碼重設郵件已發送！請檢查您的電子郵件信箱。',
      });
    } catch (error: any) {
      console.error('Password reset error:', error);

      switch (error.code) {
        case 'auth/user-not-found':
          setMessage({ type: 'error', text: '找不到此電子郵件帳號' });
          break;
        case 'auth/invalid-email':
          setMessage({ type: 'error', text: '無效的電子郵件格式' });
          break;
        case 'auth/too-many-requests':
          setMessage({ type: 'error', text: '請求次數過多，請稍後再試' });
          break;
        default:
          setMessage({ type: 'error', text: '發送失敗，請稍後再試' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">忘記密碼</h1>
          <p className="text-gray-600 mt-2">輸入您的電子郵件以重設密碼</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {emailSent ? (
            // Success State
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">郵件已發送</h2>
              <p className="text-gray-600 mb-6">
                我們已將密碼重設連結發送到 <strong>{email}</strong>
              </p>
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  沒有收到郵件？請檢查垃圾郵件資料夾
                </p>
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setMessage(null);
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  重新發送
                </button>
              </div>
            </div>
          ) : (
            // Form State
            <>
              {message && (
                <div
                  className={`mb-4 p-3 rounded-md flex items-start gap-2 ${
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電子郵件
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-10"
                      placeholder="your@email.com"
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      發送中...
                    </span>
                  ) : (
                    '發送重設郵件'
                  )}
                </button>
              </form>
            </>
          )}

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              返回登入
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-500">
          © 2025 AutoDocGen. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
