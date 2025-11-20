import { UserData } from '@/types/user';

interface EventData {
  id: string;
  event_name: string;
  event_summary: string;
  event_description: string;
  what_to_bring: string | null;
  event_start_datetime: string;
  event_end_datetime: string;
  address: string;
  event_image: string | null;
  hide_address: boolean;
  enable_ticketing: boolean;
  non_refundable: boolean;
  status: string;
  created_at: string;
}

interface DashboardProps {
  profile: UserData | null;
  events: EventData[];
  setActiveTab?: (tab: string) => void;
}

export default function Dashboard({ profile, events, setActiveTab }: DashboardProps) {
  // Get first name for greeting
  const firstName = profile?.firstname || 'there';

  // Define action cards for event hosts with icons and modern styling
  const actionCards = [
    {
      title: 'View Host Profile',
      subtitle: 'See your public profile',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      gradient: 'from-orange-400 via-orange-300 to-amber-200',
      action: 'View Host Profile',
    },
    {
      title: 'Manage Host Profile',
      subtitle: 'Edit your information',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      gradient: 'from-emerald-400 via-green-300 to-teal-200',
      action: 'Manage Host Profile',
    },
    {
      title: 'Create An Event',
      subtitle: 'Start a new event',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      gradient: 'from-slate-500 via-gray-400 to-slate-300',
      action: 'Create an Event',
    },
    {
      title: 'Manage Events',
      subtitle: 'View and edit events',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-gray-400 via-gray-300 to-gray-200',
      action: 'Manage an Event',
    },
    {
      title: 'Manage Coupons',
      subtitle: 'Create discount codes',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-purple-400 via-purple-300 to-pink-200',
      action: 'Manage Coupons',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Greeting Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center mb-2">
          <span className="mr-3 text-5xl">👋</span>
          <span>Hello, {firstName}</span>
        </h1>
        <p className="text-gray-600 ml-14">Welcome to your event host dashboard</p>
      </div>

      {/* Action Cards - Modern Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {/* Large Featured Card: View Host Profile */}
        <div className="lg:row-span-2">
          <button
            onClick={() => setActiveTab?.(actionCards[0].action)}
            className="group relative bg-gradient-to-br from-orange-400 via-orange-300 to-amber-200 rounded-3xl p-8 text-left transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] flex flex-col justify-between w-full h-full min-h-[400px] overflow-hidden"
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

        {/* Manage Host Profile Card */}
        <button
          onClick={() => setActiveTab?.(actionCards[1].action)}
          className="group relative bg-white rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 border-emerald-100 hover:border-emerald-300 flex flex-col justify-between min-h-[200px] overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative z-10">
            <div className="mb-5 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              {actionCards[1].icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
              {actionCards[1].title}
            </h3>
            <p className="text-gray-600 text-sm">
              {actionCards[1].subtitle}
            </p>
          </div>
          <div className="relative z-10 mt-4 flex items-center text-emerald-600 group-hover:text-emerald-700 transition-colors">
            <span className="text-sm font-semibold mr-2">Get Started</span>
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Manage Events Card */}
        <button
          onClick={() => setActiveTab?.(actionCards[3].action)}
          className="group relative bg-white rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 border-blue-100 hover:border-blue-300 flex flex-col justify-between min-h-[200px] overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative z-10">
            <div className="mb-5 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              {actionCards[3].icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
              {actionCards[3].title}
            </h3>
            <p className="text-gray-600 text-sm">
              {actionCards[3].subtitle}
            </p>
          </div>
          <div className="relative z-10 mt-4 flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
            <span className="text-sm font-semibold mr-2">Get Started</span>
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Create An Event Card */}
        <button
          onClick={() => setActiveTab?.(actionCards[2].action)}
          className="group relative bg-white rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 border-orange-100 hover:border-orange-300 flex flex-col justify-between min-h-[200px] overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative z-10">
            <div className="mb-5 w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              {actionCards[2].icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
              {actionCards[2].title}
            </h3>
            <p className="text-gray-600 text-sm">
              {actionCards[2].subtitle}
            </p>
          </div>
          <div className="relative z-10 mt-4 flex items-center text-orange-600 group-hover:text-orange-700 transition-colors">
            <span className="text-sm font-semibold mr-2">Get Started</span>
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* Manage Coupons Card */}
        <button
          onClick={() => setActiveTab?.(actionCards[4].action)}
          className="group relative bg-white rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 border-purple-100 hover:border-purple-300 flex flex-col justify-between min-h-[200px] overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative z-10">
            <div className="mb-5 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              {actionCards[4].icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
              {actionCards[4].title}
            </h3>
            <p className="text-gray-600 text-sm">
              {actionCards[4].subtitle}
            </p>
          </div>
          <div className="relative z-10 mt-4 flex items-center text-purple-600 group-hover:text-purple-700 transition-colors">
            <span className="text-sm font-semibold mr-2">Get Started</span>
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
}
