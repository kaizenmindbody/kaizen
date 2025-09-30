import React from 'react';
import { Booking, SelectedService, BookingSummaryProps } from '@/types/booking';

const BookingSummary: React.FC<BookingSummaryProps> = ({
  currentStep,
  selectedService,
  selectedBookings,
  getSelectedServiceDisplay
}) => {
  if (currentStep < 2) return null;

  return (
    <div className="border-t border-gray-100 pt-6 mt-6">
      <div className="bg-blue-50 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Booking Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
            <p className="text-sm text-gray-600 mb-1">Service</p>
            <p className="font-semibold text-gray-900 mb-2">{getSelectedServiceDisplay()}</p>
            {selectedService && (
              <div className="bg-secondary/10 px-3 py-1 rounded-full inline-flex items-center">
                <span className="text-sm font-semibold text-secondary">
                  ${selectedService.session.price}
                </span>
              </div>
            )}
          </div>
          {currentStep >= 3 && (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">Selected Appointments</p>
              <div className="flex items-center mb-2">
                <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {selectedBookings.length} {selectedBookings.length === 1 ? 'appointment' : 'appointments'}
                </span>
              </div>
              {selectedBookings.length > 0 ? (
                <div className="space-y-1 max-h-20 overflow-y-auto">
                  {selectedBookings.slice(0, 3).map((booking, index) => (
                    <p key={index} className="font-medium text-gray-900 text-sm flex items-center">
                      <svg className="w-3 h-3 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {booking.displayTime} - {booking.displayDate}
                    </p>
                  ))}
                  {selectedBookings.length > 3 && (
                    <p className="text-sm text-gray-500 pl-5">
                      +{selectedBookings.length - 3} more appointments
                    </p>
                  )}
                </div>
              ) : (
                <p className="font-medium text-gray-400 italic">None selected</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;