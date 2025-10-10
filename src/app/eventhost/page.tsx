'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useEventHost } from '@/hooks/useEventHost';
import {
  HomeIcon,
  CalendarIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  PlusCircleIcon,
  Cog6ToothIcon,
  TicketIcon,
  EyeIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import Dashboard from './components/Dashboard';
import CreateEvent from './components/CreateEvent';
import ManageEvents from './components/ManageEvents';
import ManageCoupons from './components/ManageCoupons';
import ViewHostProfile from './components/ViewHostProfile';
import ManageHostProfile from './components/ManageHostProfile';

// Loading Skeleton Component
const EventHostPageSkeleton = () => {
  return (
    <>
      <style jsx global>{`
        header, nav[class*="Header"], div[class*="Header"], nav[class*="Navbar"], div[class*="Navbar"], footer {
          display: none !important;
        }
        body {
          padding-top: 0 !important;
          margin-top: 0 !important;
          padding-bottom: 0 !important;
          margin-bottom: 0 !important;
        }
      `}</style>
      <div className="min-h-screen bg-gray-50">
        <div className="flex h-screen overflow-hidden animate-pulse">
          {/* Sidebar Skeleton */}
          <aside className="w-64 bg-white border-r border-gray-200">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="px-4 py-5 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>

              {/* Navigation Skeleton */}
              <nav className="flex-1 px-3 py-4 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded-lg"></div>
                ))}
              </nav>

              {/* Bottom Buttons Skeleton */}
              <div className="p-3 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="h-10 bg-gray-200 rounded-lg"></div>
                  <div className="h-10 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Skeleton */}
          <main className="flex-1">
            <div className="p-6 lg:p-8">
              <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default function EventHostPage() {
  const router = useRouter();
  const { user, signOut, loading: authLoading } = useAuth();
  const { profile, hostProfile, events, loading, error, refreshData, updateHostProfile } = useEventHost();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  // Sync activeTab with URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) {
        // Map URL tab to display name
        const tabMap: { [key: string]: string } = {
          'dashboard': 'Dashboard',
          'create-event': 'Create an Event',
          'manage-event': 'Manage an Event',
          'manage-coupons': 'Manage Coupons',
          'view-host-profile': 'View Host Profile',
          'manage-host-profile': 'Manage Host Profile',
        };
        const mappedTab = tabMap[tab] || 'Dashboard';
        setActiveTab(mappedTab);
      }
    }
  }, []);

  // Update URL when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      // Map display name to URL tab
      const urlTabMap: { [key: string]: string } = {
        'Dashboard': 'dashboard',
        'Create an Event': 'create-event',
        'Manage an Event': 'manage-event',
        'Manage Coupons': 'manage-coupons',
        'View Host Profile': 'view-host-profile',
        'Manage Host Profile': 'manage-host-profile',
      };
      const urlTab = urlTabMap[tab] || 'dashboard';

      const url = new URL(window.location.href);
      url.searchParams.set('tab', urlTab);
      window.history.pushState({}, '', url.toString());
    }
  };

  // Fetch data and handle authentication
  useEffect(() => {
    const loadData = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      // If not loading and no user, redirect to login
      if (!user?.id) {
        router.push('/login');
        return;
      }

      // Check if user is event host and redirect if not
      await refreshData(user.id);
    };

    loadData();
  }, [user, router, refreshData, authLoading]);

  const handleLogout = async () => {
    await signOut();
  };

  const tabs = ['Dashboard', 'Events', 'Host'];

  const eventsSubItems = [
    'Create an Event',
    'Manage an Event',
    'Manage Coupons',
  ];

  const hostSubItems = [
    'View Host Profile',
    'Manage Host Profile',
  ];

  // Show loading skeleton while auth or data is loading
  if (authLoading || loading) {
    return <EventHostPageSkeleton />;
  }

  // Redirect if not an event host
  if (!loading && profile && profile.type?.toLowerCase() !== 'eventhost') {
    return <EventHostPageSkeleton />;
  }

  return (
    <>
      {/* Hide header/nav/footer for admin-style layout */}
      <style jsx global>{`
        header, nav[class*="Header"], div[class*="Header"], nav[class*="Navbar"], div[class*="Navbar"], footer {
          display: none !important;
        }
        body {
          padding-top: 0 !important;
          margin-top: 0 !important;
          padding-bottom: 0 !important;
          margin-bottom: 0 !important;
        }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <div className="flex h-screen overflow-hidden">
          {/* Sidebar - Fixed on all screen sizes */}
          <aside
            className={`${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-y-auto`}
          >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                  {(hostProfile?.avatar || profile?.avatar) ? (
                    <Image
                      src={hostProfile?.avatar || profile?.avatar || ''}
                      alt="Profile"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary flex items-center justify-center text-white text-base font-semibold">
                      {profile?.firstname?.[0]}{profile?.lastname?.[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {profile?.firstname} {profile?.lastname}
                  </p>
                  <p className="text-xs text-gray-500">Event Host</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
              {tabs.map((tab) => {
                // Dashboard - standalone
                if (tab === 'Dashboard') {
                  return (
                    <button
                      type="button"
                      key={tab}
                      onClick={(e) => {
                        e.preventDefault();
                        handleTabChange('Dashboard');
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center px-3 py-2.5 rounded-lg font-medium transition-all text-sm ${
                        activeTab === 'Dashboard'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <HomeIcon className="h-5 w-5 mr-3" />
                      Dashboard
                    </button>
                  );
                }

                // Events - expandable menu
                if (tab === 'Events') {
                  const isSubItemActive = eventsSubItems.includes(activeTab);
                  return (
                    <div key={tab}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setExpandedMenu(expandedMenu === 'Events' ? null : 'Events');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all text-sm ${
                          activeTab === 'Events' || isSubItemActive
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <CalendarIcon className="h-5 w-5 mr-3" />
                          Events
                        </div>
                        <ChevronDownIcon
                          className={`h-4 w-4 transition-transform ${
                            expandedMenu === 'Events' ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {expandedMenu === 'Events' && (
                        <div className="mt-3 ml-8 space-y-2">
                          {eventsSubItems.map((subItem) => {
                            const getIcon = (item: string) => {
                              if (item === 'Create an Event') return PlusCircleIcon;
                              if (item === 'Manage an Event') return Cog6ToothIcon;
                              if (item === 'Manage Coupons') return TicketIcon;
                              return CalendarIcon;
                            };
                            const SubIcon = getIcon(subItem);

                            return (
                              <button
                                type="button"
                                key={subItem}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleTabChange(subItem);
                                  setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                                  activeTab === subItem
                                    ? 'bg-blue-50 text-primary'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <SubIcon className="h-4 w-4 mr-3" />
                                {subItem}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Host - expandable menu
                if (tab === 'Host') {
                  const isSubItemActive = hostSubItems.includes(activeTab);
                  return (
                    <div key={tab}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setExpandedMenu(expandedMenu === 'Host' ? null : 'Host');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium transition-all text-sm ${
                          activeTab === 'Host' || isSubItemActive
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <UserCircleIcon className="h-5 w-5 mr-3" />
                          Host
                        </div>
                        <ChevronDownIcon
                          className={`h-4 w-4 transition-transform ${
                            expandedMenu === 'Host' ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {expandedMenu === 'Host' && (
                        <div className="mt-3 ml-8 space-y-2">
                          {hostSubItems.map((subItem) => {
                            const getIcon = (item: string) => {
                              if (item === 'View Host Profile') return EyeIcon;
                              if (item === 'Manage Host Profile') return PencilSquareIcon;
                              return UserCircleIcon;
                            };
                            const SubIcon = getIcon(subItem);

                            return (
                              <button
                                type="button"
                                key={subItem}
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleTabChange(subItem);
                                  setSidebarOpen(false);
                                }}
                                className={`w-full flex items-center px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                                  activeTab === subItem
                                    ? 'bg-blue-50 text-primary'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <SubIcon className="h-4 w-4 mr-3" />
                                {subItem}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return null;
              })}
            </nav>

            {/* Action Buttons at bottom */}
            <div className="p-3 border-t border-gray-200 mt-auto">
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all text-sm text-gray-700 hover:bg-gray-100 border border-gray-300"
                >
                  <HomeIcon className="w-4 h-4" />
                  <span>Back to Main</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all text-sm text-white bg-red-600 hover:bg-red-700"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content - Offset for fixed sidebar */}
        <main className="flex-1 lg:ml-64 overflow-y-auto">
          {/* Mobile header with hamburger */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">{activeTab}</h1>
            <div className="w-6"></div>
          </div>

          {/* Content */}
          <div className="p-6 lg:p-8">
            {/* Dashboard */}
            {activeTab === 'Dashboard' && (
              <Dashboard profile={profile} events={events} />
            )}

            {/* Create an Event */}
            {activeTab === 'Create an Event' && (
              <CreateEvent setActiveTab={handleTabChange} />
            )}

            {/* Manage an Event */}
            {activeTab === 'Manage an Event' && (
              <ManageEvents events={events} setActiveTab={handleTabChange} />
            )}

            {/* Manage Coupons */}
            {activeTab === 'Manage Coupons' && (
              <ManageCoupons />
            )}

            {/* View Host Profile */}
            {activeTab === 'View Host Profile' && (
              <ViewHostProfile profile={profile} hostProfile={hostProfile} setActiveTab={handleTabChange} />
            )}

            {/* Manage Host Profile */}
            {activeTab === 'Manage Host Profile' && (
              <ManageHostProfile
                profile={profile}
                hostProfile={hostProfile}
                updateHostProfile={updateHostProfile}
                setActiveTab={handleTabChange}
              />
            )}
          </div>
        </main>
      </div>
    </div>
    </>
  );
}
