"use client";

import { useRouter } from 'next/navigation';
import { Users as UsersIcon, Shield, FileText, Eye, TrendingUp, Activity, Clock, BarChart } from 'lucide-react';
import { OverviewProps } from '@/types/admin';

const Overview = ({ stats, onTabChange }: OverviewProps) => {
  const router = useRouter();

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: UsersIcon,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Practitioners',
      value: stats.totalPractitioners,
      icon: Shield,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Patients',
      value: stats.totalPatients,
      icon: Activity,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: '+15%',
      changeType: 'increase'
    },
    {
      title: 'Specialties',
      value: stats.totalSpecialties,
      icon: FileText,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      change: '+3%',
      changeType: 'increase'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
          <p className="text-lg text-gray-600">Welcome back! Here is what is happening with your platform today.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm border">
          <Clock className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.title}
              className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${card.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <div className="flex items-center space-x-1 text-green-500">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">{card.change}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">{card.title}</h3>
                  <div className="flex items-baseline space-x-2">
                    <p className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">
                      {card.value.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${card.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{
                        width: `${Math.min(100, (card.value / Math.max(...statsCards.map(c => c.value))) * 100)}%`,
                        animationDelay: `${index * 200 + 500}ms`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Manage your platform efficiently</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => onTabChange('users')}
              className="group relative bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-blue-500 rounded-xl group-hover:bg-blue-600 transition-colors duration-300">
                  <UsersIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Manage Users</h4>
                  <p className="text-sm text-gray-600 mt-1">View, edit, and manage user accounts</p>
                </div>
                <div className="w-full h-1 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-0 group-hover:w-full transition-all duration-500"></div>
                </div>
              </div>
            </button>

            <button
              onClick={() => onTabChange('specialties')}
              className="group relative bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border border-orange-200 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-orange-500 rounded-xl group-hover:bg-orange-600 transition-colors duration-300">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Manage Specialties</h4>
                  <p className="text-sm text-gray-600 mt-1">Add, edit, and organize specialties</p>
                </div>
                <div className="w-full h-1 bg-orange-200 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full w-0 group-hover:w-full transition-all duration-500"></div>
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push('/find-practitioner')}
              className="group relative bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-green-500 rounded-xl group-hover:bg-green-600 transition-colors duration-300">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">View Site</h4>
                  <p className="text-sm text-gray-600 mt-1">Preview the live platform</p>
                </div>
                <div className="w-full h-1 bg-green-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full w-0 group-hover:w-full transition-all duration-500"></div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Additional Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
                <p className="text-sm text-gray-600">Platform performance metrics</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Healthy</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">API Response</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">~150ms</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Uptime</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-600">Latest platform updates</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">New practitioner registered</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Patient booking completed</p>
                  <p className="text-xs text-gray-500">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">New specialty added</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;