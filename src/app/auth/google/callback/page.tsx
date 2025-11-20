"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HashLoader } from 'react-spinners';

// Disable static generation for this page since it uses search params
export const dynamic = 'force-dynamic';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [tokens, setTokens] = useState<any>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      return;
    }

    if (code) {
      handleCallback(code);
    } else {
      setStatus('error');
    }
  }, [searchParams]);

  const handleCallback = async (code: string) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok) {
        setTokens(data);
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <HashLoader color="#3B82F6" size={50} />
          <p className="mt-4 text-gray-600">Connecting to Google Calendar...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Failed</h2>
            <p className="text-gray-600 mb-6">
              Failed to connect to Google Calendar. Please try again.
            </p>
            <button
              onClick={() => router.push('/admin')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Go Back to Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Google Calendar Connected!</h2>
          <p className="text-gray-600">
            Your Google Calendar has been successfully connected. Please add the following tokens to your environment file.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Token (add to .env as GOOGLE_ACCESS_TOKEN)
            </label>
            <div className="flex">
              <input
                type="text"
                value={tokens?.accessToken || ''}
                readOnly
                className="flex-1 p-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
              />
              <button
                onClick={() => copyToClipboard(tokens?.accessToken || '')}
                className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Refresh Token (add to .env as GOOGLE_REFRESH_TOKEN)
            </label>
            <div className="flex">
              <input
                type="text"
                value={tokens?.refreshToken || ''}
                readOnly
                className="flex-1 p-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
              />
              <button
                onClick={() => copyToClipboard(tokens?.refreshToken || '')}
                className="px-3 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Important: Add tokens to environment file
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Copy the tokens above and add them to your <code>.env</code> file:
                  </p>
                  <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded">
{`GOOGLE_ACCESS_TOKEN=${tokens?.accessToken || ''}
GOOGLE_REFRESH_TOKEN=${tokens?.refreshToken || ''}`}
                  </pre>
                  <p className="mt-2">
                    After adding the tokens, restart your development server for the changes to take effect.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => router.push('/admin')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Continue to Admin Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <HashLoader color="#3B82F6" size={50} />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}