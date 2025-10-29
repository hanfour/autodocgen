/**
 * Email Verification Banner
 *
 * Shows a banner for unverified users with option to resend verification email
 */

import React, { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { Mail, X, AlertCircle, CheckCircle } from 'lucide-react';

const EmailVerificationBanner: React.FC = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Don't show if user is verified or banner is dismissed
  if (!user || user.emailVerified || dismissed) {
    return null;
  }

  const handleResendEmail = async () => {
    setMessage(null);
    setSending(true);

    try {
      await sendEmailVerification(user);
      setMessage({ type: 'success', text: '驗證郵件已發送！請檢查您的信箱。' });
    } catch (error: any) {
      console.error('Resend verification error:', error);

      if (error.code === 'auth/too-many-requests') {
        setMessage({ type: 'error', text: '請求過於頻繁，請稍後再試' });
      } else {
        setMessage({ type: 'error', text: '發送失敗，請稍後再試' });
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-warning-50 border-b border-warning-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-warning-900">
              請驗證您的電子郵件地址
            </p>
            <p className="text-sm text-warning-700 mt-1">
              我們已發送驗證郵件到 <strong>{user.email}</strong>
              。請點擊郵件中的連結完成驗證。
            </p>

            {message && (
              <div className={`mt-2 flex items-center gap-2 text-sm ${
                message.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                {message.text}
              </div>
            )}

            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={handleResendEmail}
                disabled={sending}
                className="text-sm font-medium text-warning-800 hover:text-warning-900 underline disabled:opacity-50"
              >
                {sending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-warning-800 border-t-transparent rounded-full animate-spin"></div>
                    發送中...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    重新發送驗證郵件
                  </span>
                )}
              </button>
              <button
                onClick={() => window.location.reload()}
                className="text-sm font-medium text-warning-800 hover:text-warning-900 underline"
              >
                我已驗證，重新整理頁面
              </button>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-warning-100 rounded transition-colors"
            aria-label="關閉"
          >
            <X className="w-5 h-5 text-warning-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
