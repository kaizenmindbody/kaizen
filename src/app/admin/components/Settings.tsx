"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Database, FileText, Calendar, ExternalLink } from 'lucide-react';
import { SettingsProps } from '@/types/admin';
import { showToast } from '@/lib/toast';

const Settings = ({ users, specialties, stats, onRefreshData }: SettingsProps) => {
  const { user } = useAuth();
  const [connectingCalendar, setConnectingCalendar] = useState(false);

  const exportData = () => {
    const data = { users, specialties, stats };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const connectGoogleCalendar = async () => {
    setConnectingCalendar(true);
    try {
      const response = await fetch('/api/auth/google?action=connect');
      const data = await response.json();

      if (response.ok && data.authUrl) {
        // Open the authorization URL in a new window
        window.open(data.authUrl, '_blank', 'width=500,height=600');
        showToast.success('Please complete the authorization in the new window');
      } else {
        showToast.error('Failed to start Google Calendar connection');
      }
    } catch (error) {
      showToast.error('Failed to connect to Google Calendar');
    } finally {
      setConnectingCalendar(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900">Admin Settings</h2>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">Admin Email:</span>
            <span className="text-sm text-gray-900">{user?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">Database:</span>
            <span className="text-sm text-gray-900">Supabase</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">Version:</span>
            <span className="text-sm text-gray-900">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-600">Last Updated:</span>
            <span className="text-sm text-gray-900">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Google Calendar Integration</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Calendar className="w-6 h-6 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-800">Calendar Integration Status</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Connect Google Calendar to automatically create calendar events for patient bookings.
                </p>
                <div className="mt-3 flex items-center space-x-3">
                  <button
                    onClick={connectGoogleCalendar}
                    disabled={connectingCalendar}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {connectingCalendar ? (
                      <>
                        <div className="animate-spin -ml-1 mr-2 h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Setup Google Calendar
                      </>
                    )}
                  </button>
                  <span className="text-xs text-blue-600">
                    {process.env.GOOGLE_ACCESS_TOKEN ? '✓ Connected' : '⚠ Not Connected'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">Integration Benefits:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Automatic calendar events for all patient bookings</li>
              <li>Email notifications to both practitioner and patient</li>
              <li>Automatic calendar updates when bookings are rescheduled</li>
              <li>Calendar event deletion when bookings are cancelled</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Tools</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={onRefreshData}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Database className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">Refresh Data</span>
          </button>
          <button
            onClick={exportData}
            className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">Export Data</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Database Statistics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600">Total Users</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600">Practitioners</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalPractitioners}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600">Patients</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalPatients}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-600">Specialties</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalSpecialties}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Actions</h3>
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800">Data Management</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Use the tools above to refresh data from the database or export current data for backup purposes.
            </p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800">User Management</h4>
            <p className="text-sm text-blue-700 mt-1">
              Navigate to the Users tab to view, manage, and delete user accounts in the system.
            </p>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-800">Specialties Management</h4>
            <p className="text-sm text-green-700 mt-1">
              Use the Specialties tab to manage the medical specialties available in the platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;