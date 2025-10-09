'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function EventHostPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { profile, hostProfile, events, loading, error, refreshData, updateHostProfile } = useEventHost();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  // Fetch data and handle authentication
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        router.push('/login');
        return;
      }

      await refreshData(user.id);
    };

    loadData();
  }, [user, router, refreshData]);

  // Redirect if not an event host
  useEffect(() => {
    if (!loading && profile && profile.type?.toLowerCase() !== 'eventhost') {
      router.push('/profile');
    }
  }, [loading, profile, router]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
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
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                  {profile?.firstname?.[0]}{profile?.lastname?.[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {profile?.firstname} {profile?.lastname}
                  </p>
                  <p className="text-xs text-gray-500">Event Host</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {tabs.map((tab) => {
                // Dashboard - standalone
                if (tab === 'Dashboard') {
                  return (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab('Dashboard');
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
                        onClick={() => {
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
                        <div className="mt-1 ml-8 space-y-1">
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
                                key={subItem}
                                onClick={() => {
                                  setActiveTab(subItem);
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
                        onClick={() => {
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
                        <div className="mt-1 ml-8 space-y-1">
                          {hostSubItems.map((subItem) => {
                            const getIcon = (item: string) => {
                              if (item === 'View Host Profile') return EyeIcon;
                              if (item === 'Manage Host Profile') return PencilSquareIcon;
                              return UserCircleIcon;
                            };
                            const SubIcon = getIcon(subItem);

                            return (
                              <button
                                key={subItem}
                                onClick={() => {
                                  setActiveTab(subItem);
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

            {/* Logout */}
            <div className="px-3 py-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-all text-sm"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content - Offset for fixed sidebar */}
        <main className="flex-1 lg:ml-64 overflow-y-auto">
          {/* Mobile header with hamburger */}
          <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
            <button
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
              <CreateEvent />
            )}

            {/* Manage an Event */}
            {activeTab === 'Manage an Event' && (
              <ManageEvents events={events} setActiveTab={setActiveTab} />
            )}

            {/* Manage Coupons */}
            {activeTab === 'Manage Coupons' && (
              <ManageCoupons />
            )}

            {/* View Host Profile */}
            {activeTab === 'View Host Profile' && (
              <ViewHostProfile profile={profile} hostProfile={hostProfile} setActiveTab={setActiveTab} />
            )}

            {/* Manage Host Profile */}
            {activeTab === 'Manage Host Profile' && (
              <ManageHostProfile
                profile={profile}
                hostProfile={hostProfile}
                updateHostProfile={updateHostProfile}
                setActiveTab={setActiveTab}
              />
            )}
          </div>
        </main>
      </div>
    </div>
    </>
  );
}
