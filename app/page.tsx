'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy } from 'lucide-react';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // If user exists, try login instead
        if (data.error?.includes('already exists')) {
          const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });

          if (loginResponse.ok) {
            router.push(`/verify?email=${encodeURIComponent(email)}`);
            return;
          }
        }
        throw new Error(data.error || 'Failed to send OTP');
      }

      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-orange-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center mb-8">
            <Trophy className="w-10 h-10 mx-auto text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Bracket-IQ
            </h1>
            <p className="text-gray-600">
              Built For Fans Who Think Ahead
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Send Login Code'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">How it works:</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <span>Enter your email to receive a verification code</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <span>Create your playoff bracket predictions</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <span>Earn points for correct predictions</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">4.</span>
                <span>Compete on the leaderboard</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}