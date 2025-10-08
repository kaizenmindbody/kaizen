"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSpecialty } from '@/hooks/useSpecialty';
import { useDegrees } from '@/hooks/useDegrees';
import { useClinics } from '@/hooks/useClinics';
import { useFaq } from '@/hooks/useFaq';
import { useBlogs } from '@/hooks/useBlogs';
import { supabase } from '@/lib/supabase';
import { Users as UsersIcon, FileText, Settings as SettingsIcon, BarChart3, Menu, X, Users, Settings, Building2, GraduationCap, HelpCircle, BookOpen, Calendar, Briefcase, LogOut, UserCircle } from 'lucide-react';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import Image from 'next/image';
import Overview from './components/Overview';
import UsersComponent from './components/Users';
import SpecialtiesComponent from './components/Specialties';
import DegreesComponent from './components/Degrees';
import ClinicsComponent from './components/Clinics';
import ServicesComponent from './components/Services';
import PractitionerTypesComponent from './components/PractitionerTypes';
import FaqsComponent from './components/Faqs';
import BlogsComponent from './components/Blogs';
import EventsComponent from './components/Events';
import SettingsComponent from './components/Settings';
import { User, Stats } from '@/types/user';

const AdminDashboard = () => {
  const { user, loading, isAdmin, signOut } = useAuth();
  const { specialties } = useSpecialty();
  const { degrees } = useDegrees();
  const { clinics } = useClinics();
  const { faqs } = useFaq();
  const { blogs } = useBlogs();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalPractitioners: 0, totalPatients: 0, totalSpecialties: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync activeTab with URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, []);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.pushState({}, '', url.toString());
    }
  };

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, loading, router]);

  // Fetch admin data
  const fetchAdminData = useCallback(async () => {
    setLoadingData(true);
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('Users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      setUsers(usersData || []);

      // Calculate stats
      const practitioners = usersData?.filter(u => u.user_type === 'practitioner').length || 0;
      const patients = usersData?.filter(u => u.user_type === 'patient').length || 0;

      setStats({
        totalUsers: usersData?.length || 0,
        totalPractitioners: practitioners,
        totalPatients: patients,
        totalSpecialties: specialties.length,
      });

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoadingData(false);
    }
  }, [specialties]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchAdminData();
    }
  }, [user, isAdmin, fetchAdminData]);

  const handleBackToSite = () => {
    confirmDialog({
      message: 'Are you sure you want to leave the admin panel and go back to the main site?',
      header: 'Leave Admin Panel',
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'reject',
      acceptClassName: 'p-button-primary',
      accept: () => router.push('/'),
    });
  };

  const handleSignOut = () => {
    confirmDialog({
      message: 'Are you sure you want to sign out?',
      header: 'Sign Out',
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'reject',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        await signOut();
        router.push('/');
      },
    });
  };

  // Redirect if not admin (but don't block rendering while loading)
  if (!loading && (!user || !isAdmin)) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ConfirmDialog />
      {/* Header */}
      <div className="bg-white shadow-sm border-b lg:hidden">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="w-6 h-6" />
              </button>
              <Image
                src="/images/logo.png"
                alt="Kaizen"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
              <span className="text-sm font-medium text-gray-500">Admin</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 hidden sm:block">Welcome, Admin</span>
              <button
                onClick={handleBackToSite}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md transition-colors"
              >
                Back to Site
              </button>
              <button
                onClick={handleSignOut}
                className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-md transition-colors flex items-center space-x-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)}></div>
          <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-3">
                <Image
                  src="/images/logo.png"
                  alt="Kaizen"
                  width={100}
                  height={32}
                  className="h-6 w-auto"
                />
                <span className="text-sm font-medium text-gray-500">Admin</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'users', name: 'Users', icon: UsersIcon },
                { id: 'specialties', name: 'Specialties', icon: FileText },
                { id: 'degrees', name: 'Degrees', icon: GraduationCap },
                { id: 'clinics', name: 'Clinics', icon: Building2 },
                { id: 'services', name: 'Services', icon: Briefcase },
                { id: 'practitioner-types', name: 'Practitioner Types', icon: UserCircle },
                { id: 'faqs', name: 'FAQs', icon: HelpCircle },
                { id: 'blogs', name: 'Blogs', icon: BookOpen },
                { id: 'events', name: 'Events', icon: Calendar },
                { id: 'settings', name: 'Settings', icon: SettingsIcon },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      handleTabChange(tab.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Layout with Sidebar */}
      <div className="flex min-h-screen">
        {/* Desktop Left Sidebar Navigation */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="w-64 bg-white shadow-sm border-r border-gray-200 fixed h-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-8">
                <div className="flex flex-col items-center w-full">
                  <Image
                    src="/images/logo.png"
                    alt="Kaizen"
                    width={140}
                    height={48}
                    className="h-10 w-auto mb-2"
                  />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Admin Portal</p>
                    <p className="text-xs text-gray-500">Welcome, Admin</p>
                  </div>
                </div>
              </div>
              <nav className="space-y-2">
                {[
                  { id: 'overview', name: 'Overview', icon: BarChart3 },
                  { id: 'users', name: 'Users', icon: Users },
                  { id: 'specialties', name: 'Specialties', icon: FileText },
                  { id: 'degrees', name: 'Degrees', icon: GraduationCap },
                  { id: 'clinics', name: 'Clinics', icon: Building2 },
                  { id: 'services', name: 'Services', icon: Briefcase },
                  { id: 'practitioner-types', name: 'Practitioner Types', icon: UserCircle },
                  { id: 'faqs', name: 'FAQs', icon: HelpCircle },
                  { id: 'blogs', name: 'Blogs', icon: BookOpen },
                  { id: 'events', name: 'Events', icon: Calendar },
                  { id: 'settings', name: 'Settings', icon: Settings },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary text-white'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
              <div className="absolute bottom-6 left-6 right-6">
                <button
                  onClick={handleBackToSite}
                  className="w-full bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                >
                  Back to Site
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 ">
          <div className="w-full px-4 sm:px-6 py-6 lg:py-8">
            {/* Tab Content */}
            {activeTab === 'overview' && (
              <Overview
                stats={stats}
                onTabChange={handleTabChange}
                loading={loadingData}
              />
            )}

            {activeTab === 'users' && (
              <UsersComponent
                users={users}
                specialties={specialties}
                onRefreshData={fetchAdminData}
              />
            )}

            {activeTab === 'specialties' && (
              <SpecialtiesComponent
                onRefreshData={fetchAdminData}
              />
            )}

            {activeTab === 'degrees' && (
              <DegreesComponent
                onRefreshData={fetchAdminData}
              />
            )}

            {activeTab === 'clinics' && (
              <ClinicsComponent
                onRefreshData={fetchAdminData}
              />
            )}

            {activeTab === 'services' && (
              <ServicesComponent
                onRefreshData={fetchAdminData}
              />
            )}

            {activeTab === 'practitioner-types' && (
              <PractitionerTypesComponent
                onRefreshData={fetchAdminData}
              />
            )}

            {activeTab === 'faqs' && (
              <FaqsComponent
                onRefreshData={fetchAdminData}
              />
            )}

            {activeTab === 'blogs' && (
              <BlogsComponent
                onRefreshData={fetchAdminData}
              />
            )}

            {activeTab === 'events' && (
              <EventsComponent
                onRefreshData={fetchAdminData}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsComponent
                users={users}
                specialties={specialties}
                stats={stats}
                onRefreshData={fetchAdminData}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;