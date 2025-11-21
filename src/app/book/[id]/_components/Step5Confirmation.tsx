import React from 'react';
import Image from 'next/image';
import QRCode from 'react-qr-code';
import { Booking, SelectedService, Practitioner, Step5ConfirmationProps } from '@/types/booking';
import toast from 'react-hot-toast';
import { formatPractitionerNameFromFullName } from '@/lib/formatters';

const Step5Confirmation: React.FC<Step5ConfirmationProps> = ({
  practitioner,
  selectedService,
  selectedBookings,
  onReschedule,
  onCancel,
  getSelectedServiceDisplay,
  bookNumber,
  onStartNewBooking
}) => {
  // Function to create .ics file for all appointments
  const createICSFile = () => {
    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Kaizen Medical//Booking System//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    selectedBookings.forEach((booking, index) => {
      let startDate;
      try {
        if (booking.date && booking.apiTime) {
          startDate = new Date(`${booking.date}T${booking.apiTime}:00`);
        } else if (booking.date && booking.timeSlot) {
          // Extract ONLY the start time from "8:00 AM - 9:00 AM" format
          const timeRangeMatch = booking.timeSlot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-/i);
          if (timeRangeMatch) {
            let hours = parseInt(timeRangeMatch[1]);
            const minutes = parseInt(timeRangeMatch[2]);
            const period = timeRangeMatch[3].toUpperCase();

            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;

            startDate = new Date(booking.date);
            startDate.setHours(hours, minutes, 0, 0);
          } else {
            // Fallback: try to parse just the first time part
            const singleTimeMatch = booking.timeSlot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (singleTimeMatch) {
              let hours = parseInt(singleTimeMatch[1]);
              const minutes = parseInt(singleTimeMatch[2]);
              const period = singleTimeMatch[3].toUpperCase();

              if (period === 'PM' && hours !== 12) hours += 12;
              if (period === 'AM' && hours === 12) hours = 0;

              startDate = new Date(booking.date);
              startDate.setHours(hours, minutes, 0, 0);
            }
          }
        }
      } catch (error) {
        startDate = new Date();
      }

      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      const appointmentTime = booking.displayTime || booking.timeSlot || 'Time TBD';
      const appointmentDate = booking.displayDate || new Date(booking.date).toLocaleDateString() || 'Date TBD';

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${bookNumber}-${index}@kaizen-medical.com`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:Medical Appointment - ${selectedService?.serviceName || 'Consultation'}`,
        `DESCRIPTION:Appointment Details:\\n- Practitioner: ${practitioner.full_name}\\n- Service: ${getSelectedServiceDisplay()}\\n- Date: ${appointmentDate}\\n- Time: ${appointmentTime}\\n- Location: Wellness Path\\n- Booking Number: ${bookNumber}\\n\\nThis appointment was booked through the Kaizen medical platform.`,
        `LOCATION:Wellness Path`,
        'BEGIN:VALARM',
        'TRIGGER:-PT30M',
        'DESCRIPTION:Appointment Reminder',
        'ACTION:DISPLAY',
        'END:VALARM',
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-appointments-${bookNumber}.ics`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`Downloaded calendar file with ${selectedBookings.length} appointments!`, {
      duration: 4000,
    });

    setTimeout(() => {
      toast('📅 Double-click the downloaded file to add all appointments to your calendar!', {
        duration: 5000,
        style: {
          background: '#10B981',
          color: 'white',
        },
      });
    }, 1000);
  };

  // Function to create Google Calendar URL
  const createGoogleCalendarUrl = (booking: any) => {

    // Handle date parsing more robustly - extract START time only from time range
    let startDate;
    try {
      if (booking.date && booking.apiTime) {
        startDate = new Date(`${booking.date}T${booking.apiTime}:00`);
      } else if (booking.date && booking.timeSlot) {
        // Extract ONLY the start time from "8:00 AM - 9:00 AM" format
        const timeRangeMatch = booking.timeSlot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-/i);
        if (timeRangeMatch) {
          let hours = parseInt(timeRangeMatch[1]);
          const minutes = parseInt(timeRangeMatch[2]);
          const period = timeRangeMatch[3].toUpperCase();

          if (period === 'PM' && hours !== 12) hours += 12;
          if (period === 'AM' && hours === 12) hours = 0;

          startDate = new Date(booking.date);
          startDate.setHours(hours, minutes, 0, 0);
        } else {
          // Fallback: try to parse just the first time part
          const singleTimeMatch = booking.timeSlot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          if (singleTimeMatch) {
            let hours = parseInt(singleTimeMatch[1]);
            const minutes = parseInt(singleTimeMatch[2]);
            const period = singleTimeMatch[3].toUpperCase();

            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;

            startDate = new Date(booking.date);
            startDate.setHours(hours, minutes, 0, 0);
          } else {
            throw new Error('Cannot parse time slot');
          }
        }
      } else {
        throw new Error('Missing date or time information');
      }
    } catch (error) {
      // Fallback to current time if parsing fails
      startDate = new Date();
    }

    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later

    const formatDateTime = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const title = encodeURIComponent(`Medical Appointment - ${selectedService?.serviceName || 'Consultation'}`);
    const appointmentTime = booking.displayTime || booking.timeSlot || 'Time TBD';
    const appointmentDate = booking.displayDate || new Date(booking.date).toLocaleDateString() || 'Date TBD';

    const details = encodeURIComponent(`
Appointment Details:
- Practitioner: ${practitioner.full_name}
- Service: ${getSelectedServiceDisplay()}
- Date: ${appointmentDate}
- Time: ${appointmentTime}
- Location: Wellness Path
- Booking Number: ${bookNumber}

This appointment was booked through the Kaizen medical platform.
    `.trim());

    const startTime = formatDateTime(startDate);
    const endTime = formatDateTime(endDate);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=Wellness%20Path`;
  };

  // Function to handle adding all bookings to calendar
  const handleAddToCalendar = () => {
    if (!selectedBookings || selectedBookings.length === 0) {
      toast.error('No bookings to add to calendar');
      return;
    }

    try {
      if (selectedBookings.length === 1) {
        // Single booking - open directly
        const calendarUrl = createGoogleCalendarUrl(selectedBookings[0]);
        window.open(calendarUrl, '_blank');
        toast.success('Opening Google Calendar...');
      } else {
        // Multiple bookings - simplified approach
        toast.success(`Opening ${selectedBookings.length} calendar events...`);

        selectedBookings.forEach((booking, index) => {
          setTimeout(() => {
            const calendarUrl = createGoogleCalendarUrl(booking);

            const newWindow = window.open(calendarUrl, `calendar_${index}_${Date.now()}`);

            if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
              // If popup blocked, show toast notification
              toast.error(`Popup blocked for appointment ${index + 1}! Please use the Download option instead.`, {
                duration: 4000,
              });
            } else {
              toast.success(`Calendar event ${index + 1} opened!`, {
                duration: 2000,
              });
            }
          }, index * 1000); // 1 second delay between each
        });

        // Show helpful tip
        setTimeout(() => {
          toast('💡 If popups are blocked, try the "Download Calendar File" button below!', {
            duration: 6000,
            style: {
              background: '#3B82F6',
              color: 'white',
            },
          });
        }, 3000);
      }
    } catch (error) {
      toast.error('Failed to create calendar events');
    }
  };
  return (
    <div className="space-y-8">
      {/* Success Banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-green-800 mb-2">Booking Confirmed!</h1>
            <p className="text-green-700">Your appointment has been successfully scheduled</p>
          </div>
        </div>
        {bookNumber && (
          <div className="text-center">
            <div className="inline-flex items-center bg-white px-4 py-2 rounded-full border border-green-200">
              <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM9 6h6V4H9v2zm0 3a1 1 0 112 0v6a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V9z" />
              </svg>
              <span className="text-sm font-medium text-green-800">Booking #{bookNumber}</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Confirmation Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Left Column - Booking Confirmation */}
          <div className="lg:col-span-2 p-8">
            {/* Practitioner Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100">
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <Image
                    src={practitioner.avatar || "https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/avatars/default.jpg"}
                    alt={practitioner.full_name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  {(() => {
                    const formattedName = formatPractitionerNameFromFullName(
                      practitioner.full_name,
                      undefined,
                      practitioner.degrees as string | string[] | undefined
                    );
                    return (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{formattedName}</h3>
                        <p className="text-blue-700 text-sm font-medium mb-2">Your Healthcare Provider</p>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          Your appointment has been confirmed and {formattedName} is looking forward to meeting with you.
                          Please arrive 10 minutes early for check-in.
                        </p>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-8">
              <button
                onClick={onReschedule}
                className="group flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <svg className="w-5 h-5 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reschedule</span>
              </button>
              <button
                onClick={onCancel}
                className="group flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancel Booking</span>
              </button>
            </div>

            {/* Booking Details */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Appointment Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Service Info */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-3">
                    <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 8.172V5L8 4z" />
                    </svg>
                    <h4 className="font-semibold text-gray-900">Service</h4>
                  </div>
                  <p className="text-gray-700 font-medium">{getSelectedServiceDisplay()}</p>
                  {selectedService && (
                    <p className="text-2xl font-bold text-purple-600 mt-2">
                      ${selectedService.session.price}
                    </p>
                  )}
                </div>

                {/* Location Info */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center mb-3">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h4 className="font-semibold text-gray-900">Location</h4>
                  </div>
                  <p className="text-gray-700 font-medium">Wellness Path Clinic</p>
                  <button className="text-green-600 text-sm hover:text-green-700 underline mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Location
                  </button>
                </div>
              </div>

              {/* Appointments List */}
              <div className="mt-8">
                <div className="flex items-center mb-4">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h4 className="font-semibold text-gray-900">Scheduled Appointments ({selectedBookings.length})</h4>
                </div>
                {selectedBookings.length > 0 ? (
                  <div className="space-y-3">
                    {selectedBookings.map((booking, index) => (
                      <div key={index} className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{booking.displayTime}</p>
                              <p className="text-sm text-gray-600">{booking.displayDate}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-blue-600">
                              ${selectedService?.session.price || '0.00'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="bg-gray-900 rounded-xl p-4 text-white">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Total Amount</span>
                        <span className="text-xl font-bold">
                          ${selectedService ? (selectedService.session.price * selectedBookings.length).toFixed(2) : '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No appointments selected</p>
                )}
              </div>
            </div>

            {/* Need Assistance */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-orange-900">Need Our Assistance?</h4>
                  </div>
                  <p className="text-sm text-orange-800 leading-relaxed">
                    Our support team is available 24/7 to help with any questions about your booking, cancellation, or rescheduling needs.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <button className="group inline-flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>Contact Support</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Details */}
          <div className="lg:col-span-1 bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="space-y-8">
              {/* Booking Number */}
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Reference</h3>
                </div>
                <div className="bg-white border-2 border-blue-200 px-6 py-3 rounded-xl shadow-sm">
                  <p className="text-2xl font-bold text-blue-600 tracking-wider">
                    {bookNumber || 'Loading...'}
                  </p>
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Access</h3>
                </div>
                <div className="bg-white border-2 border-purple-200 rounded-xl p-6 shadow-sm">
                  {bookNumber ? (
                    <QRCode
                      size={140}
                      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      value={JSON.stringify({
                        bookNumber,
                        practitioner: practitioner.full_name,
                        service: selectedService ? `${selectedService.serviceName} - ${selectedService.session.type}` : '',
                        appointments: selectedBookings.map(booking => ({
                          date: booking.displayDate,
                          time: booking.displayTime
                        })),
                        total: selectedService ? (selectedService.session.price * selectedBookings.length).toFixed(2) : '0.00'
                      })}
                      viewBox={`0 0 140 140`}
                    />
                  ) : (
                    <div className="w-36 h-36 bg-gray-200 rounded-xl flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Generating...</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                  Scan to view appointment details
                </p>
              </div>

              {/* Calendar Actions */}
              <div className="space-y-4">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 text-center">Add to Calendar</h3>
                </div>

                {selectedBookings && selectedBookings.length > 1 ? (
                  <>
                    <button
                      onClick={handleAddToCalendar}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Google Calendar</span>
                    </button>
                    <button
                      onClick={createICSFile}
                      className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download (.ics)</span>
                    </button>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <p className="text-xs text-blue-700 text-center leading-relaxed">
                        💡 Download option works best for multiple appointments
                      </p>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={handleAddToCalendar}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Add To Google Calendar</span>
                  </button>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={onStartNewBooking}
                    className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>New Booking</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step5Confirmation;