"use client";

import { ProfileData } from '@/types/user';

interface DashboardProps {
  profile: ProfileData | null;
  handleTabChange: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, handleTabChange }) => {
  const isPractitioner = profile?.user_type?.toLowerCase() === 'practitioner' || profile?.type?.toLowerCase() === 'practitioner';

  // Parse the name to get first name for greeting
  const firstName = profile?.firstname || profile?.full_name?.split(' ')[0] || 'there';

  // Define action cards for practitioners with icons and modern styling
  const practitionerCards = [
    {
      title: 'View Profile',
      subtitle: 'See your public profile',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      gradient: 'from-orange-400 via-orange-300 to-amber-200',
      action: 'View Profile',
    },
    {
      title: 'Manage Basic Information',
      subtitle: 'Edit your information',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      gradient: 'from-emerald-400 via-green-300 to-teal-200',
      action: 'Manage Basic Information',
    },
    {
      title: 'Manage Services & Pricing',
      subtitle: 'Set your rates',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-slate-500 via-gray-400 to-slate-300',
      action: 'Manage Services and Pricing',
    },
    {
      title: 'Manage Descriptions',
      subtitle: 'Update your bio',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: 'from-gray-400 via-gray-300 to-gray-200',
      action: 'Manage Descriptions',
    },
    {
      title: 'Create An Event',
      subtitle: 'Start a new event',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      gradient: 'from-purple-400 via-purple-300 to-pink-200',
      action: 'Create Event',
    },
  ];

  // Define action cards for patients
  const patientCards = [
    {
      title: 'View Profile',
      subtitle: 'See your profile',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      gradient: 'from-orange-400 via-orange-300 to-amber-200',
      action: 'View Profile',
    },
    {
      title: 'Manage Basic Information',
      subtitle: 'Edit your information',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      gradient: 'from-emerald-400 via-green-300 to-teal-200',
      action: 'Manage Basic Information',
    },
    {
      title: 'My Appointments',
      subtitle: 'View bookings',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-blue-400 via-blue-300 to-indigo-200',
      action: 'Books',
    },
  ];

  const actionCards = isPractitioner ? practitionerCards : patientCards;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Greeting Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center mb-2">
          <span className="mr-3 text-5xl">👋</span>
          <span>Hello, {firstName}</span>
        </h1>
        <p className="text-gray-600 ml-14">
          {isPractitioner ? 'Welcome to your practitioner dashboard' : 'Welcome to your dashboard'}
        </p>
      </div>

      {/* Action Cards - Modern Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Large Featured Card: View Profile */}
        <div className="lg:row-span-2">
          <button
            onClick={() => handleTabChange(actionCards[0].action)}
            className={`group relative bg-gradient-to-br ${actionCards[0].gradient} rounded-3xl p-8 text-left transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] flex flex-col justify-between w-full h-full min-h-[400px] overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative z-10">
              <div className="mb-6 text-white/90 group-hover:text-white transition-colors">
                {actionCards[0].icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                {actionCards[0].title}
              </h3>
              <p className="text-white/80 text-sm font-medium">
                {actionCards[0].subtitle}
              </p>
            </div>
            <div className="relative z-10 mt-6 flex items-center text-white/90 group-hover:text-white transition-colors">
              <span className="text-sm font-semibold mr-2">View Profile</span>
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>

        {/* Remaining Cards */}
        {actionCards.slice(1).map((card, index) => {
          // Determine card color based on index for variety
          const colorClasses = [
            { border: 'border-emerald-100 hover:border-emerald-300', bg: 'from-emerald-500 to-teal-500', text: 'text-emerald-600 group-hover:text-emerald-700', bgDecor: 'from-emerald-100 to-teal-100' },
            { border: 'border-blue-100 hover:border-blue-300', bg: 'from-blue-500 to-indigo-500', text: 'text-blue-600 group-hover:text-blue-700', bgDecor: 'from-blue-100 to-indigo-100' },
            { border: 'border-orange-100 hover:border-orange-300', bg: 'from-orange-500 to-amber-500', text: 'text-orange-600 group-hover:text-orange-700', bgDecor: 'from-orange-100 to-amber-100' },
            { border: 'border-purple-100 hover:border-purple-300', bg: 'from-purple-500 to-pink-500', text: 'text-purple-600 group-hover:text-purple-700', bgDecor: 'from-purple-100 to-pink-100' },
            { border: 'border-cyan-100 hover:border-cyan-300', bg: 'from-cyan-500 to-blue-500', text: 'text-cyan-600 group-hover:text-cyan-700', bgDecor: 'from-cyan-100 to-blue-100' },
          ];
          const colorClass = colorClasses[index % colorClasses.length];

          return (
            <button
              key={index}
              onClick={() => handleTabChange(card.action)}
              className={`group relative bg-white rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 ${colorClass.border} flex flex-col justify-between min-h-[200px] overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClass.bgDecor} rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity`}></div>
              <div className="relative z-10">
                <div className={`mb-5 w-12 h-12 bg-gradient-to-br ${colorClass.bg} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {card.subtitle}
                </p>
              </div>
              <div className={`relative z-10 mt-4 flex items-center ${colorClass.text} transition-colors`}>
                <span className="text-sm font-semibold mr-2">Get Started</span>
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
