import React from 'react';
import Image from 'next/image';
import { MapPin, Star } from 'lucide-react';
import BookingSummary from './BookingSummary';
import { Practitioner, Booking, SelectedService, PractitionerInfoProps } from '@/types/booking';

const PractitionerInfo: React.FC<PractitionerInfoProps> = ({
  practitioner,
  currentStep,
  selectedService,
  selectedBookings,
  formatSpecialties,
  getSelectedServiceDisplay
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 mb-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
      <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8 mb-6">
        <div className="relative group">
          <Image
            src={practitioner.avatar || "https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/avatars/default.jpg"}
            alt={practitioner.full_name}
            width={180}
            height={180}
            className="relative w-[180px] h-[180px] rounded-full object-cover border-4 border-white"
          />
        </div>
        <div className="font-sans flex flex-col justify-between flex-grow text-center lg:text-left">
          <div className='space-y-4'>
            <div className='flex flex-col lg:flex-row items-center space-y-2 lg:space-y-0 lg:space-x-4'>
              <h2 className="text-3xl font-bold text-secondary">
                {practitioner.full_name}
              </h2>
              <div className="bg-primary text-white text-sm px-3 py-1.5 rounded-full flex items-center shadow-lg">
                <Star className="w-4 h-4 mr-1 fill-current" />
                <span className="font-semibold">{practitioner.review || '4.8'}</span>
              </div>
            </div>

            {/* Degree */}
            {practitioner.degrees && (
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-4">
                <span className="text-sm text-[#8ED083]">
                  {typeof practitioner.degrees === 'string' ? practitioner.degrees : practitioner.degrees.join(', ')}
                </span>
              </div>
            )}

            {/* Specialties */}
            <div className="flex flex-wrap gap-2 justify-center lg:justify-start mb-2">
              {practitioner.specialty && formatSpecialties(practitioner.specialty).split(' • ').map((specialty, index) => (
                <span
                  key={index}
                  className="inline-block bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold border border-orange-200/50 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {specialty.trim()}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center text-black text-base py-2">
            <MapPin className="w-5 h-5 mr-2 text-black" />
            <span className="font-medium">{practitioner.address || 'Address not available'}</span>
          </div>
        </div>
      </div>

      {/* Booking Summary - Show from step 2 onwards */}
      <BookingSummary
        currentStep={currentStep}
        selectedService={selectedService}
        selectedBookings={selectedBookings}
        getSelectedServiceDisplay={getSelectedServiceDisplay}
      />
    </div>
  );
};

export default PractitionerInfo;