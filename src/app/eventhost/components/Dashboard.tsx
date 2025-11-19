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

  // Define action cards for event hosts
  const actionCards = [
    {
      title: 'View Host\nProfile',
      bgColor: 'bg-[#FACB9B]',
      action: 'View Host Profile',
    },
    {
      title: 'Manage Host\nProfile',
      bgColor: 'bg-[#C8E6C9]',
      action: 'Manage Host Profile',
    },
    {
      title: 'Create\nAn Event',
      bgColor: 'bg-[#B8BDB5]',
      action: 'Create an Event',
    },
    {
      title: 'Manage\nEvents',
      bgColor: 'bg-[#D7D7D7]',
      action: 'Manage an Event',
    },
    {
      title: 'Manage\nCoupons',
      bgColor: 'bg-[#C5B3D4]',
      action: 'Manage Coupons',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Greeting Header */}
      <div className="mb-8">
        <h1 className="text-3xl text-gray-800 flex items-center">
          <span className="mr-2">👋</span>
          <span className="font-normal">Hello, {firstName}</span>
        </h1>
      </div>

      {/* Action Cards - 3 columns layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {/* Column 1: View Host Profile (spans 2 rows) */}
        <div className="lg:row-span-2">
          <button
            onClick={() => setActiveTab?.(actionCards[0].action)}
            className={`${actionCards[0].bgColor} rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center w-full h-full`}
            style={{ minHeight: '340px' }}
          >
            <h3 className="text-lg font-semibold text-gray-800 whitespace-pre-line leading-relaxed">
              {actionCards[0].title}
            </h3>
          </button>
        </div>

        {/* Column 2 Row 1: Manage Host Profile */}
        <button
          onClick={() => setActiveTab?.(actionCards[1].action)}
          className={`${actionCards[1].bgColor} rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center`}
          style={{ minHeight: '160px' }}
        >
          <h3 className="text-base font-semibold text-gray-800 whitespace-pre-line leading-relaxed">
            {actionCards[1].title}
          </h3>
        </button>

        {/* Column 3 Row 1: Manage Events */}
        <button
          onClick={() => setActiveTab?.(actionCards[3].action)}
          className={`${actionCards[3].bgColor} rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center`}
          style={{ minHeight: '160px' }}
        >
          <h3 className="text-base font-semibold text-gray-800 whitespace-pre-line leading-relaxed">
            {actionCards[3].title}
          </h3>
        </button>

        {/* Column 2 Row 2: Create An Event */}
        <button
          onClick={() => setActiveTab?.(actionCards[2].action)}
          className={`${actionCards[2].bgColor} rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center`}
          style={{ minHeight: '160px' }}
        >
          <h3 className="text-base font-semibold text-gray-800 whitespace-pre-line leading-relaxed">
            {actionCards[2].title}
          </h3>
        </button>

        {/* Column 3 Row 2: Manage Coupons */}
        <button
          onClick={() => setActiveTab?.(actionCards[4].action)}
          className={`${actionCards[4].bgColor} rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center`}
          style={{ minHeight: '160px' }}
        >
          <h3 className="text-base font-semibold text-gray-800 whitespace-pre-line leading-relaxed">
            {actionCards[4].title}
          </h3>
        </button>
      </div>
    </div>
  );
}
