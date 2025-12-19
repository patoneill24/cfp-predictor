'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

function VerifyContent() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      router.push('/');
    }
  }, [email, router]);

  const handleSubmit = async () => {
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      sessionStorage.setItem('userEmail', email || '');

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-submit when all 6 digits are entered
    if (code.length === 6) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const handleResend = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend code');
      }

      setCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-orange-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Enter Verification Code
            </h1>
            <p className="text-gray-600">
              We sent a 6-digit code to{' '}
              <span className="font-semibold">{email}</span>
            </p>
          </div>

          <div className="flex justify-center mb-6">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(value) => setCode(value)}
            >
              <InputOTPGroup className="gap-1 sm:gap-2">
                <InputOTPSlot index={0} className="w-10 h-12 sm:w-14 sm:h-16 text-xl sm:text-2xl border-2 border-gray-300 rounded-lg" />
                <InputOTPSlot index={1} className="w-10 h-12 sm:w-14 sm:h-16 text-xl sm:text-2xl border-2 border-gray-300 rounded-lg" />
                <InputOTPSlot index={2} className="w-10 h-12 sm:w-14 sm:h-16 text-xl sm:text-2xl border-2 border-gray-300 rounded-lg" />
                <InputOTPSlot index={3} className="w-10 h-12 sm:w-14 sm:h-16 text-xl sm:text-2xl border-2 border-gray-300 rounded-lg" />
                <InputOTPSlot index={4} className="w-10 h-12 sm:w-14 sm:h-16 text-xl sm:text-2xl border-2 border-gray-300 rounded-lg" />
                <InputOTPSlot index={5} className="w-10 h-12 sm:w-14 sm:h-16 text-xl sm:text-2xl border-2 border-gray-300 rounded-lg" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <button
            onClick={() => handleSubmit()}
            disabled={loading || code.length !== 6}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          <div className="text-center">
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
            >
              Resend Code
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Use different email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
