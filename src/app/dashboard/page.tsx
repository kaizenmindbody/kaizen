"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to Your Dashboard!
            </h1>
            <p className="text-gray-600">
              Your account has been successfully activated.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Name:</span>
                <p className="text-gray-900">{user.user_metadata?.name || 'Not provided'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Email:</span>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">User Type:</span>
                <p className="text-gray-900 capitalize">{user.user_metadata?.user_type || 'User'}</p>
              </div>
              {user.user_metadata?.user_type === 'practitioner' && (
                <>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Medical Specialty:</span>
                    <p className="text-gray-900">{user.user_metadata?.major || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Phone:</span>
                    <p className="text-gray-900">{user.user_metadata?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Languages:</span>
                    <p className="text-gray-900">
                      {user.user_metadata?.languages?.join(', ') || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Hourly Rate:</span>
                    <p className="text-gray-900">
                      {user.user_metadata?.hourly_rate ? `$${user.user_metadata.hourly_rate}/hour` : 'Not set'}
                    </p>
                  </div>
                </>
              )}
              <div>
                <span className="text-sm font-medium text-gray-500">Account Status:</span>
                <p className="text-green-600 font-medium">✓ Email Verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}