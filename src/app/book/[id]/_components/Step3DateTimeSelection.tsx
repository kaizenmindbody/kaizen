import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { HashLoader } from 'react-spinners';
import { Booking, SelectedService, Step3DateTimeSelectionProps } from '@/types/booking';

const Step3DateTimeSelection: React.FC<Step3DateTimeSelectionProps> = ({
  currentDate,
  availableSlots,
  selectedBookings,
  loadingAvailability,
  onDateSelect,
  onTimeSlotSelect,
  onNavigateMonth,
  onClearBookings,
  onToggleBookingSelection,
  formatMonth,
  getDaysInMonth,
  isPastDate,
  dateHasBookings,
  isCurrentViewingDate,
  isBookingSelected,
  selectedService
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Select Date & Time
        </h3>
        <p className="text-gray-600">Choose your preferred appointment dates and times</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Calendar - 40% width on desktop */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200/50 rounded-xl p-6 shadow-lg">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => onNavigateMonth(-1)}
                className="p-3 hover:bg-orange-100 rounded-lg transition-colors duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-orange-600" />
              </button>
              <h4 className="text-lg font-bold text-gray-800">
                {formatMonth(currentDate)}
              </h4>
              <button
                onClick={() => onNavigateMonth(1)}
                className="p-3 hover:bg-orange-100 rounded-lg transition-colors duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 rotate-180 text-gray-600 group-hover:text-orange-600" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-gray-600 font-semibold">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {getDaysInMonth(currentDate).map((day, index) => (
                <div key={index} className="p-1">
                  {day && (
                    <button
                      onClick={() => onDateSelect(day)}
                      disabled={isPastDate(day)}
                      className={`
                        w-12 h-12 rounded-xl text-sm font-semibold transition-all duration-300 relative
                        ${isPastDate(day)
                          ? 'text-gray-300 cursor-not-allowed'
                          : isCurrentViewingDate(day)
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : dateHasBookings(day)
                              ? 'bg-green-100 border-2 border-green-400 text-green-700 font-bold shadow-md'
                              : 'hover:bg-gray-100 text-gray-700 hover:shadow-md'
                        }
                      `}
                    >
                      {day.getDate()}
                      {dateHasBookings(day) && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full border-2 border-white"></div>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Time Slots - 60% width on desktop */}
        <div className="lg:col-span-3">
          {loadingAvailability ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <HashLoader color="#EA7D00" size={50} />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Morning Section */}
              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200/50">
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 text-primary mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <h5 className="text-lg font-bold text-gray-800">Morning Sessions</h5>
                  <span className="ml-2 text-sm text-gray-600">(8:00 AM - 12:00 PM)</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(() => {
                    // Define all morning time slots in API format like profile page
                    const allMorningAPISlots = ['08:00', '09:00', '10:00', '11:00'];
                    const availableMorning = availableSlots.morning || [];
                    const conflicts = availableSlots.conflicts || {};
                    const practitionerBookings = availableSlots.practitionerBookings || {};

                    return allMorningAPISlots.map((apiTime, index) => {
                      // Convert API time to display format
                      const hour = parseInt(apiTime.split(':')[0]);
                      const nextHour = hour + 1;
                      const startTime = `${hour}:00 AM`;
                      const endTime = nextHour === 12 ? '12:00 PM' : `${nextHour}:00 AM`;
                      const displayTime = `${startTime} - ${endTime}`;

                      const isAvailable = availableMorning.includes(displayTime);
                      const hasConflict = conflicts[displayTime];
                      const practitionerBooking = practitionerBookings[displayTime];
                      const isSelected = isBookingSelected(currentDate, displayTime);

                      // Determine slot state: Available, Practitioner Booked, or Patient Conflict
                      let buttonClass = '';
                      let isClickable = false;

                      if (hasConflict) {
                        // Patient has conflict with another practitioner
                        buttonClass = 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed opacity-60';
                        isClickable = false;
                      } else if (isAvailable) {
                        // Available for booking
                        buttonClass = isSelected
                          ? 'border-secondary bg-secondary text-white shadow-lg shadow-secondary/20'
                          : 'border-gray-200 bg-white hover:border-orange-300 text-gray-700 hover:bg-orange-50 hover:shadow-md cursor-pointer';
                        isClickable = true;
                      } else {
                        // Practitioner has booking - same design as other practitioner conflict
                        buttonClass = 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed opacity-60';
                        isClickable = false;
                      }

                      return (
                        <div key={index} className="relative group">
                          <button
                            onClick={() => isClickable ? onTimeSlotSelect(displayTime) : null}
                            disabled={!isClickable}
                            className={`w-full px-4 py-3 text-sm font-semibold rounded-xl border-2 transition-all duration-300 ${buttonClass}`}
                          >
                            {displayTime}
                          </button>

                          {hasConflict && (
                            <div className="absolute invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-2 px-3 bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10 whitespace-nowrap shadow-lg">
                              <div className="text-center">
                                <div className="font-semibold">Already booked</div>
                                <div className="text-gray-300">with Dr. {hasConflict.practitioner}</div>
                                <div className="text-gray-300 text-xs">{hasConflict.service}</div>
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                            </div>
                          )}

                          {practitionerBooking && (
                            <div className="absolute invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-2 px-3 bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10 whitespace-nowrap shadow-lg">
                              <div className="text-center">
                                <div className="font-semibold">
                                  {practitionerBooking.isBlocked ? 'Unavailable' : 'Already booked'}
                                </div>
                                <div className="text-gray-300">
                                  {practitionerBooking.isBlocked ? 'Personal appointment' : 'with this practitioner'}
                                </div>
                                {!practitionerBooking.isBlocked && (
                                  <div className="text-gray-300 text-xs">{practitionerBooking.service}</div>
                                )}
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Afternoon Section */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200/50">
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <h5 className="text-lg font-bold text-gray-800">Afternoon Sessions</h5>
                  <span className="ml-2 text-sm text-gray-600">(2:00 PM - 6:00 PM)</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(() => {
                    // Define all afternoon time slots in API format like profile page
                    const allAfternoonAPISlots = ['14:00', '15:00', '16:00', '17:00'];
                    const availableAfternoon = availableSlots.afternoon || [];
                    const conflicts = availableSlots.conflicts || {};
                    const practitionerBookings = availableSlots.practitionerBookings || {};

                    return allAfternoonAPISlots.map((apiTime, index) => {
                      // Convert API time to display format
                      const hour = parseInt(apiTime.split(':')[0]);
                      const nextHour = hour + 1;
                      const displayTime = `${hour - 12}:00 PM - ${nextHour - 12}:00 PM`;

                      const isAvailable = availableAfternoon.includes(displayTime);
                      const hasConflict = conflicts[displayTime];
                      const practitionerBooking = practitionerBookings[displayTime];
                      const isSelected = isBookingSelected(currentDate, displayTime);

                      // Determine slot state: Available, Practitioner Booked, or Patient Conflict
                      let buttonClass = '';
                      let isClickable = false;

                      if (hasConflict) {
                        // Patient has conflict with another practitioner
                        buttonClass = 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed opacity-60';
                        isClickable = false;
                      } else if (isAvailable) {
                        // Available for booking
                        buttonClass = isSelected
                          ? 'border-secondary bg-secondary text-white shadow-lg shadow-secondary/20'
                          : 'border-gray-200 bg-white hover:border-blue-300 text-gray-700 hover:bg-blue-50 hover:shadow-md cursor-pointer';
                        isClickable = true;
                      } else {
                        // Practitioner has booking - same design as other practitioner conflict
                        buttonClass = 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed opacity-60';
                        isClickable = false;
                      }

                      return (
                        <div key={index} className="relative group">
                          <button
                            onClick={() => isClickable ? onTimeSlotSelect(displayTime) : null}
                            disabled={!isClickable}
                            className={`w-full px-4 py-3 text-sm font-semibold rounded-xl border-2 transition-all duration-300 ${buttonClass}`}
                          >
                            {displayTime}
                          </button>

                          {hasConflict && (
                            <div className="absolute invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-2 px-3 bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10 whitespace-nowrap shadow-lg">
                              <div className="text-center">
                                <div className="font-semibold">Already booked</div>
                                <div className="text-gray-300">with Dr. {hasConflict.practitioner}</div>
                                <div className="text-gray-300 text-xs">{hasConflict.service}</div>
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                            </div>
                          )}

                          {practitionerBooking && (
                            <div className="absolute invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-2 px-3 bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-10 whitespace-nowrap shadow-lg">
                              <div className="text-center">
                                <div className="font-semibold">
                                  {practitionerBooking.isBlocked ? 'Unavailable' : 'Already booked'}
                                </div>
                                <div className="text-gray-300">
                                  {practitionerBooking.isBlocked ? 'Personal appointment' : 'with this practitioner'}
                                </div>
                                {!practitionerBooking.isBlocked && (
                                  <div className="text-gray-300 text-xs">{practitionerBooking.service}</div>
                                )}
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Selected Bookings Summary */}
              {selectedBookings.length > 0 && (
                <div className="mt-8 bg-secondary/5 rounded-xl p-6 border border-secondary/20 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h5 className="text-lg font-bold text-secondary">Selected Appointments</h5>
                      <span className="ml-2 bg-secondary/20 text-secondary px-2 py-1 rounded-full text-sm font-semibold">
                        {selectedBookings.length}
                      </span>
                    </div>
                    <button
                      onClick={onClearBookings}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                    {selectedBookings.map((booking, index) => (
                      <div key={index} className="group bg-white rounded-lg p-4 border border-secondary/20 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-secondary rounded-full"></div>
                            <div>
                              <div className="font-semibold text-gray-900">{booking.displayDate}</div>
                              <div className="text-sm text-gray-600">{booking.displayTime}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => onToggleBookingSelection(new Date(booking.date), booking.timeSlot)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-red-100 rounded-full text-red-500 hover:text-red-700"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-secondary/20">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-700">Total Cost:</span>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-secondary">
                            ${selectedService ? (selectedService.session.price * selectedBookings.length).toFixed(2) : '0.00'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {selectedBookings.length} appointment{selectedBookings.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step3DateTimeSelection;