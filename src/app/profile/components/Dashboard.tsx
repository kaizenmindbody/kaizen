"use client";

import { ProfileData } from '@/types/user';

interface DashboardProps {
  profile: ProfileData | null;
  handleTabChange: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, handleTabChange }) => {
  const isPractitioner = profile?.user_type === 'practitioner' || profile?.type === 'practitioner';

  // Parse the name to get first name for greeting
  const firstName = profile?.firstname || profile?.full_name?.split(' ')[0] || 'there';

  // Define action cards for practitioners
  const practitionerCards = [
    {
      title: 'View Your\nProfile',
      bgColor: 'bg-[#FACB9B]',
      action: 'View Profile',
    },
    {
      title: 'Manage Basic\nInformation',
      bgColor: 'bg-[#C8E6C9]',
      action: 'Manage Basic Information',
    },
    {
      title: 'Manage Services\nand Pricing',
      bgColor: 'bg-[#B8BDB5]',
      action: 'Manage Services and Pricing',
    },
    {
      title: 'Manage\nDescriptions',
      bgColor: 'bg-[#D7D7D7]',
      action: 'Manage Descriptions',
    },
    {
      title: 'Create\nAn Event',
      bgColor: 'bg-[#C5B3D4]',
      action: 'Events',
    },
  ];

  // Define action cards for patients
  const patientCards = [
    {
      title: 'View Your\nProfile',
      bgColor: 'bg-[#FACB9B]',
      action: 'View Profile',
    },
    {
      title: 'Manage Basic\nInformation',
      bgColor: 'bg-[#C8E6C9]',
      action: 'Manage Basic Information',
    },
    {
      title: 'Manage\nDescriptions',
      bgColor: 'bg-[#D7D7D7]',
      action: 'Manage Descriptions',
    },
    {
      title: 'Manage Services\nand Pricing',
      bgColor: 'bg-[#B8BDB5]',
      action: 'Manage Services and Pricing',
    },
    {
      title: 'Create\nAn Event',
      bgColor: 'bg-[#C5B3D4]',
      action: 'Events',
    },
  ];

  const actionCards = isPractitioner ? practitionerCards : patientCards;

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
        {/* Column 1: View Your Profile (spans 2 rows) */}
        <div className="lg:row-span-2">
          <button
            onClick={() => handleTabChange(actionCards[0].action)}
            className={`${actionCards[0].bgColor} rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center w-full h-full`}
            style={{ minHeight: '340px' }}
          >
            <h3 className="text-lg font-semibold text-gray-800 whitespace-pre-line leading-relaxed">
              {actionCards[0].title}
            </h3>
          </button>
        </div>

        {/* Column 2 Row 1: Manage Basic Information */}
        <button
          onClick={() => handleTabChange(actionCards[1].action)}
          className={`${actionCards[1].bgColor} rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center`}
          style={{ minHeight: '160px' }}
        >
          <h3 className="text-base font-semibold text-gray-800 whitespace-pre-line leading-relaxed">
            {actionCards[1].title}
          </h3>
        </button>

        {/* Column 3 Row 1: Manage Services and Pricing */}
        <button
          onClick={() => handleTabChange(actionCards[3].action)}
          className={`${actionCards[3].bgColor} rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center`}
          style={{ minHeight: '160px' }}
        >
          <h3 className="text-base font-semibold text-gray-800 whitespace-pre-line leading-relaxed">
            {actionCards[3].title}
          </h3>
        </button>

        {/* Column 2 Row 2: Manage Descriptions */}
        <button
          onClick={() => handleTabChange(actionCards[2].action)}
          className={`${actionCards[2].bgColor} rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center`}
          style={{ minHeight: '160px' }}
        >
          <h3 className="text-base font-semibold text-gray-800 whitespace-pre-line leading-relaxed">
            {actionCards[2].title}
          </h3>
        </button>

        {/* Column 3 Row 2: Create An Event */}
        <button
          onClick={() => handleTabChange(actionCards[4].action)}
          className={`${actionCards[4].bgColor} rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.02] flex items-center justify-center`}
          style={{ minHeight: '160px' }}
        >
          <h3 className="text-base font-semibold text-gray-800 whitespace-pre-line leading-relaxed">
            {actionCards[4].title}
          </h3>
        </button>
      </div>

      {/* Flexibility Notice for Practitioners */}
      {isPractitioner && (
        <div className="mt-12 text-center">
          <p className="text-red-600 font-medium text-base">
            I am flexible on what this looks like.
            <br />
            Practitioner should have the options to
            <br />
            change anything on their profile.
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;