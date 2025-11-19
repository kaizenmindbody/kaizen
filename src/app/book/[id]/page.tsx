'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  ProgressSteps,
  PractitionerInfo,
  Step1ServiceSelection,
  Step2AppointmentType,
  Step3DateTimeSelection,
  Step4BasicInformation,
  Step5Confirmation
} from './_components';

const PractitionerBooking = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, userProfile, loading: authLoading } = useAuth(); // Get authenticated user
  const practitionerId = params.id;
  const currentStep = parseInt(searchParams.get('step') || '1');
  
  const [practitioner, setPractitioner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBookings, setSelectedBookings] = useState([]); // Array of {date, timeSlot, displayDate, displayTime}
  const [currentDate, setCurrentDate] = useState(new Date()); // For calendar navigation
  // Updated availability state to match profile page format
  const [availableSlots, setAvailableSlots] = useState({
    morning: [],
    afternoon: [],
    conflicts: {},
    practitionerBookings: {}
  });
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [appointmentType, setAppointmentType] = useState('');
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    reasonForVisit: ''
  });
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [currentBookNumber, setCurrentBookNumber] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isRescheduleMode, setIsRescheduleMode] = useState(false);
  const [localStorageLoaded, setLocalStorageLoaded] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Authentication and authorization checks
  useEffect(() => {
    if (!authLoading) {
      // Redirect to login if not authenticated
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      // Prevent practitioners from booking (only patients can book)
      if (userProfile?.user_type === 'practitioner') {
        router.push('/find-practitioner');
        return;
      }
    }
  }, [user, userProfile, authLoading, router]);

  // Helper functions for localStorage persistence
  const getStorageKey = useCallback(() => `booking_state_${practitionerId}`, [practitionerId]);

  const saveToLocalStorage = useCallback((data) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(getStorageKey(), JSON.stringify(data));
    }
  }, [getStorageKey]);

  const loadFromLocalStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(getStorageKey());
        return saved ? JSON.parse(saved) : null;
      } catch (error) {
        console.error('Error loading from localStorage:', error);
        return null;
      }
    }
    return null;
  }, [getStorageKey]);

  const clearLocalStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(getStorageKey());
    }
  };

  // Helper function to format date without timezone issues
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calculate availability from bookings data
  const getAvailableSlots = useCallback(async (date) => {
    if (!practitionerId) return { morning: [], afternoon: [], conflicts: {}, practitionerBookings: {} };

    setLoadingAvailability(true);
    try {
      const dateStr = formatDateForAPI(date);

      // Define all possible time slots
      const allTimeSlots = {
        morning: [
          { api: '08:00', display: '8:00 AM - 9:00 AM' },
          { api: '09:00', display: '9:00 AM - 10:00 AM' },
          { api: '10:00', display: '10:00 AM - 11:00 AM' },
          { api: '11:00', display: '11:00 AM - 12:00 PM' }
        ],
        afternoon: [
          { api: '14:00', display: '2:00 PM - 3:00 PM' },
          { api: '15:00', display: '3:00 PM - 4:00 PM' },
          { api: '16:00', display: '4:00 PM - 5:00 PM' },
          { api: '17:00', display: '5:00 PM - 6:00 PM' }
        ]
      };

      // Fetch practitioner's bookings for this date
      const practitionerBookingsResponse = await fetch(`/api/bookings?practitioner_id=${practitionerId}&date=${dateStr}&status=confirmed`);

      let practitionerBookings = [];
      if (practitionerBookingsResponse.ok) {
        const practitionerData = await practitionerBookingsResponse.json();
        practitionerBookings = practitionerData.bookings || [];
      }

      // Get list of booked times for practitioner
      const bookedTimes = practitionerBookings.map(booking => booking.time);

      // Create practitioner bookings map for tooltips
      const practitionerBookingsMap = {};
      practitionerBookings.forEach(booking => {
        const displayTime = convertAPITimeToDisplayFormat(booking.time);
        practitionerBookingsMap[displayTime] = {
          patient: booking.patient?.full_name || 'Patient',
          service: booking.service_type,
          time: booking.time,
          date: booking.date,
          isBlocked: booking.service_type === 'blocked'
        };
      });

      // Calculate available slots (not booked by practitioner)
      const availableSlots = {
        morning: allTimeSlots.morning
          .filter(slot => !bookedTimes.includes(slot.api))
          .map(slot => slot.display),
        afternoon: allTimeSlots.afternoon
          .filter(slot => !bookedTimes.includes(slot.api))
          .map(slot => slot.display)
      };

      // Check for patient conflicts if user is authenticated
      let patientConflicts = {};
      if (user?.id) {
        try {
          const patientBookingsResponse = await fetch(`/api/bookings?patient_id=${user.id}&date=${dateStr}&status=confirmed`);
          if (patientBookingsResponse.ok) {
            const patientBookingsData = await patientBookingsResponse.json();
            const patientBookings = patientBookingsData.bookings || [];

            // Create conflict map: display time -> booking details
            patientBookings.forEach(booking => {
              const displayTime = convertAPITimeToDisplayFormat(booking.time);

              // Only create conflict if booking is with a different practitioner
              if (booking.practitioner_id !== practitionerId) {
                patientConflicts[displayTime] = {
                  practitioner: booking.practitioner?.full_name || 'Unknown Practitioner',
                  service: booking.service_type,
                  time: booking.time,
                  date: booking.date
                };
              }
            });
          }
        } catch (error) {
          console.warn('Error checking patient conflicts:', error);
        }
      }

      const result = {
        morning: availableSlots.morning,
        afternoon: availableSlots.afternoon,
        conflicts: patientConflicts,
        practitionerBookings: practitionerBookingsMap
      };

      return result;

    } catch (error) {
      console.error('Error loading availability:', error);
      return { morning: [], afternoon: [], conflicts: {}, practitionerBookings: {} };
    } finally {
      setLoadingAvailability(false);
    }
  }, [practitionerId, user?.id, setLoadingAvailability]);

  // Convert API time to display format (e.g., "08:00" -> "8:00 AM - 9:00 AM")
  const convertAPITimeToDisplayFormat = (apiTime) => {
    const hour = parseInt(apiTime.split(':')[0]);
    const nextHour = hour + 1;

    if (hour < 12) {
      const startTime = hour === 0 ? '12:00 AM' : `${hour}:00 AM`;
      const endTime = nextHour === 12 ? '12:00 PM' : `${nextHour}:00 AM`;
      return `${startTime} - ${endTime}`;
    } else {
      const startTime = hour === 12 ? '12:00 PM' : `${hour - 12}:00 PM`;
      const endTime = nextHour === 24 ? '12:00 AM' : nextHour > 12 ? `${nextHour - 12}:00 PM` : '12:00 PM';
      return `${startTime} - ${endTime}`;
    }
  };

  // Convert display time to API format (e.g., "8:00 AM - 9:00 AM" -> "08:00")
  const convertDisplayTimeToAPIFormat = (displayTime) => {
    const startTime = displayTime.split(' - ')[0];
    if (startTime.includes('AM')) {
      const hour = startTime.split(':')[0];
      const hourNum = parseInt(hour);
      if (hourNum === 12) return '00:00';
      return `${hourNum.toString().padStart(2, '0')}:00`;
    } else {
      const hour = startTime.split(':')[0];
      const hourNum = parseInt(hour);
      if (hourNum === 12) return '12:00';
      return `${(hourNum + 12).toString().padStart(2, '0')}:00`;
    }
  };

  // Add/remove booking from selection
  const toggleBookingSelection = (date, timeSlot) => {
    const dateStr = formatDateForAPI(date);
    const displayDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    // Convert display time to API format for storage
    const apiTimeFormat = convertDisplayTimeToAPIFormat(timeSlot);

    // Check if this booking is already selected
    const existingIndex = selectedBookings.findIndex(
      booking => booking.date === dateStr && booking.apiTime === apiTimeFormat
    );

    if (existingIndex >= 0) {
      // Remove the booking
      setSelectedBookings(prev => prev.filter((_, index) => index !== existingIndex));
    } else {
      // Add the booking
      const newBooking = {
        date: dateStr,
        timeSlot,           // Display format: "8:00 AM - 9:00 AM"
        apiTime: apiTimeFormat, // API format: "08:00"
        displayDate,
        displayTime: timeSlot
      };
      setSelectedBookings(prev => [...prev, newBooking]);
    }
  };

  // Check if a booking is selected
  const isBookingSelected = (date, timeSlot) => {
    const dateStr = formatDateForAPI(date);
    const apiTimeFormat = convertDisplayTimeToAPIFormat(timeSlot);
    return selectedBookings.some(
      booking => booking.date === dateStr && booking.apiTime === apiTimeFormat
    );
  };

  // Check if a date has any bookings selected
  const dateHasBookings = (date) => {
    const dateStr = formatDateForAPI(date);
    return selectedBookings.some(booking => booking.date === dateStr);
  };

  // Check if a date is the current viewing date
  const isCurrentViewingDate = (date) => {
    return isSameDay(date, currentDate);
  };

  // Calendar utilities
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const filterAvailableSlots = (slots, date) => {
    let filteredSlots = { ...slots };

    if (isToday(date)) {
      const now = new Date();
      const currentHour = now.getHours();

      // If it's afternoon time (12 PM or later), don't show morning slots
      if (currentHour >= 12) {
        filteredSlots.morning = [];
      }
    }

    return filteredSlots;
  };

  // Update available slots when current viewing date changes or when user/auth state changes
  useEffect(() => {
    const loadSlots = async () => {
      const slots = await getAvailableSlots(currentDate);
      setAvailableSlots(slots);
    };

    if (practitionerId && !authLoading && localStorageLoaded) {
      loadSlots();
    }
  }, [currentDate, practitionerId, user, authLoading, localStorageLoaded, getAvailableSlots]);

  // Utility function to safely parse and format specialties (same as parent component)
  const formatSpecialties = (specialty) => {
    if (!specialty) return 'General Practice';
    
    try {
      // If it's already an array, join it
      if (Array.isArray(specialty)) {
        const validSpecialties = specialty.filter(item => item && item.trim());
        return validSpecialties.length > 0 ? validSpecialties.join(' • ') : 'General Practice';
      }
      
      // If it's a string, try to parse as JSON
      if (typeof specialty === 'string') {
        // First check if it looks like JSON (starts with [ or ")
        if (specialty.trim().startsWith('[') || specialty.trim().startsWith('"')) {
          const parsed = JSON.parse(specialty);
          if (Array.isArray(parsed)) {
            const validSpecialties = parsed.filter(item => item && item.trim());
            return validSpecialties.length > 0 ? validSpecialties.join(' • ') : 'General Practice';
          }
          return parsed || 'General Practice';
        }
        // If not JSON, treat as regular string
        return specialty.trim() || 'General Practice';
      }
      
      return 'General Practice';
    } catch {
      // If JSON parsing fails, treat as regular string
      return typeof specialty === 'string' ? (specialty.trim() || 'General Practice') : 'General Practice';
    }
  };

  // Fetch practitioner data
  useEffect(() => {
    const fetchPractitioner = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/practitioners/${practitionerId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch practitioner');
        }
        
        const data = await response.json();
        setPractitioner(data.practitioner);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (practitionerId) {
      fetchPractitioner();
    }
  }, [practitionerId]);

  // Fetch book number from recent bookings when on confirmation step
  useEffect(() => {
    const fetchBookNumber = async () => {
      // Only fetch if we're on step 5, don't have a book number, and have a user
      if (currentStep === 5 && !currentBookNumber && user) {
        try {
          // Get recent bookings for this user and practitioner
          const response = await fetch(`/api/bookings?patient_id=${user.id}&practitioner_id=${practitionerId}`);

          if (!response.ok) {
            console.error('Failed to fetch bookings');
            return;
          }

          const data = await response.json();

          // Get the most recent booking session
          if (data.bookings && data.bookings.length > 0) {
            // Sort by created_at to get the most recent
            const sortedBookings = data.bookings.sort((a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            const latestBookNumber = sortedBookings[0].book_number;

            if (latestBookNumber) {
              setCurrentBookNumber(latestBookNumber);

              // Also restore the booking details for confirmation page
              const bookingsWithSameNumber = data.bookings.filter(booking => booking.book_number === latestBookNumber);

              if (bookingsWithSameNumber.length > 0) {
                const firstBooking = bookingsWithSameNumber[0];

                // Restore service information
                if (firstBooking.service_type) {
                  const [serviceName, sessionType] = firstBooking.service_type.split(' - ');
                  setSelectedService({
                    serviceId: serviceName.toLowerCase().replace(/\s+/g, '-'),
                    serviceName: serviceName,
                    session: {
                      type: sessionType || 'Initial Visit',
                      price: firstBooking.price
                    }
                  });
                }

                // Restore booking slots
                const restoredBookings = bookingsWithSameNumber.map(booking => ({
                  date: booking.date,
                  timeSlot: booking.time,
                  apiTime: booking.time,
                  displayDate: new Date(booking.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  }),
                  displayTime: booking.time
                }));
                setSelectedBookings(restoredBookings);

                // Restore form data
                if (firstBooking.reason) {
                  setFormData(prev => ({ ...prev, reasonForVisit: firstBooking.reason }));
                }
              }
            }
          }
        } catch (error) {
          console.error('Error fetching book number:', error);
        }
      }
    };

    fetchBookNumber();
  }, [currentStep, currentBookNumber, user, practitionerId]);

  // Load state from localStorage first, then initialize available slots
  useEffect(() => {
    if (practitionerId) {
      const savedState = loadFromLocalStorage();
      if (savedState) {
        if (savedState.selectedService) setSelectedService(savedState.selectedService);
        if (savedState.selectedBookings) setSelectedBookings(savedState.selectedBookings);
        if (savedState.formData) setFormData(savedState.formData);
        if (savedState.consentAgreed !== undefined) setConsentAgreed(savedState.consentAgreed);
        if (savedState.policyAgreed !== undefined) setPolicyAgreed(savedState.policyAgreed);
        if (savedState.currentDate) {
          const savedDate = new Date(savedState.currentDate);
          if (!isNaN(savedDate.getTime())) {
            setCurrentDate(savedDate);
          }
        }
      }
      setLocalStorageLoaded(true);
    }
  }, [practitionerId, loadFromLocalStorage]);


  // Save state to localStorage whenever key state changes
  useEffect(() => {
    if (practitionerId) {
      const stateToSave = {
        selectedService,
        selectedBookings,
        formData,
        consentAgreed,
        policyAgreed,
        currentDate: currentDate.toISOString(),
        lastUpdated: new Date().toISOString()
      };
      saveToLocalStorage(stateToSave);
    }
  }, [practitionerId, selectedService, selectedBookings, formData, consentAgreed, policyAgreed, currentDate, saveToLocalStorage]);

  // Generate services based on practitioner's specialty_rate data
  const services = useMemo(() => {
    if (!practitioner?.specialty_rate || Object.keys(practitioner.specialty_rate).length === 0) {
      // Fallback to general service if no specialty rates are defined
      const defaultRate = 100;
      return [
        {
          id: 'general-consultation',
          name: 'General Consultation',
          sessions: [
            { type: 'Initial Visit', price: Math.round(defaultRate * 1.5), selected: false },
            { type: 'Follow Up', price: defaultRate, selected: false }
          ]
        }
      ];
    }

    // Create services based on specialty_rate data
    return Object.entries(practitioner.specialty_rate).map(([specialty, rate]) => ({
      id: specialty.toLowerCase().replace(/\s+/g, '-'),
      name: specialty,
      sessions: [
        { type: 'Initial Visit', price: Math.round(Number(rate) * 1.5), selected: false },
        { type: 'Follow Up', price: Number(rate), selected: false }
      ]
    }));
  }, [practitioner]);

  const steps = [
    { number: 1, title: 'Specialty', active: currentStep === 1 },
    { number: 2, title: 'Appointment Type', active: currentStep === 2 },
    { number: 3, title: 'Date & Time', active: currentStep === 3 },
    { number: 4, title: 'Basic Information', active: currentStep === 4 },
    { number: 5, title: 'Confirmation', active: currentStep === 5 }
  ];

  const handleBack = () => {
    if (currentStep === 5) {
      // Navigate to previous step instead of URL navigation
      router.push(`/book/${practitionerId}?step=4`);
    } else if (currentStep > 1) {
      // Navigate to previous step for steps 2-4
      router.push(`/book/${practitionerId}?step=${currentStep - 1}`);
    } else {
      // For step 1, go back to previous page
      router.back();
    }
  };

  const handleNextStep = async () => {
    // Add validation before proceeding to next step
    if (currentStep === 1 && !selectedService) {
      toast.error('Please select a service before proceeding.');
      return;
    }
    if (currentStep === 3 && selectedBookings.length === 0) {
      toast.error('Please select at least one date and time slot before proceeding.');
      return;
    }
    if (currentStep === 4 && !isFormValid()) {
      toast.error('Please agree to the consent forms.');
      return;
    }

    if (currentStep === 4) {
      // This is the final step - submit the booking
      setIsSubmittingBooking(true);
      try {
        const bookingSuccess = await submitBooking();
        if (bookingSuccess) {
          // Clear localStorage after successful booking
          clearLocalStorage();
          router.push(`/book/${practitionerId}?step=5`);
        }
        // If booking fails, stay on current step
      } finally {
        setIsSubmittingBooking(false);
      }
    } else if (currentStep < 5) {
      router.push(`/book/${practitionerId}?step=${currentStep + 1}`);
    }
  };

  const handleServiceSelect = (serviceId, sessionIndex) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedService({
        serviceId: serviceId,
        serviceName: service.name,
        session: service.sessions[sessionIndex]
      });
    }
  };

  // Handle date selection and update available slots
  const handleDateSelect = async (date) => {
    if (!isPastDate(date)) {
      setCurrentDate(date);
      const slots = await getAvailableSlots(date);
      setAvailableSlots(slots);
    }
  };

  // Handle time slot selection (now toggles selection)
  const handleTimeSlotSelect = (time) => {
    toggleBookingSelection(currentDate, time);
  };

  // Handle form field changes
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Navigate calendar months
  const navigateMonth = async (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
    // Update available slots for the new month's current viewing date
    const slots = await getAvailableSlots(newDate);
    setAvailableSlots(slots);
  };


  const isFormValid = () => {
    return consentAgreed && policyAgreed;
  };

  // Check if user can navigate to a specific step
  const canNavigateToStep = (targetStep) => {
    if (targetStep === 1) return true; // Always allow going to step 1
    if (targetStep === 2) return selectedService !== null; // Need service selected
    if (targetStep === 3) return selectedService !== null; // Need service selected
    if (targetStep === 4) return selectedService !== null && selectedBookings.length > 0; // Need service and bookings
    if (targetStep === 5) return selectedService !== null && selectedBookings.length > 0 && isFormValid(); // Need everything
    return false;
  };

  // Handle step navigation
  const handleStepClick = (targetStep) => {
    // Don't allow any navigation from confirmation step (step 5)
    if (currentStep === 5) {
      toast.error('Booking is confirmed. You cannot navigate to previous steps.');
      return;
    }

    // Don't allow forward navigation if current step requirements aren't met
    if (targetStep > currentStep) {
      if (!canNavigateToStep(targetStep)) {
        let message = '';
        if (targetStep === 2 && !selectedService) {
          message = 'Please select a service first.';
        } else if (targetStep === 3 && !selectedService) {
          message = 'Please select a service first.';
        } else if (targetStep === 4 && (!selectedService || selectedBookings.length === 0)) {
          message = 'Please select a service and at least one appointment slot first.';
        } else if (targetStep === 5 && (!selectedService || selectedBookings.length === 0 || !isFormValid())) {
          message = 'Please complete all previous steps first.';
        }
        toast.error(message);
        return;
      }
    }

    // Allow navigation if requirements are met or going backward
    router.push(`/book/${practitionerId}?step=${targetStep}`);
  };

  const handleCancel = () => {
    // If we're on the confirmation step and have a book number, show confirmation modal
    if (currentStep === 5 && currentBookNumber) {
      setShowCancelModal(true);
    } else {
      // If not on confirmation step, just navigate away
      router.push('/find-practitioner');
    }
  };

  const confirmCancelBooking = async () => {
    setShowCancelModal(false);

    try {
      const response = await fetch(`/api/bookings?book_number=${currentBookNumber}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(`Failed to cancel booking: ${data.error}`);
        return;
      }

      toast.success(`Successfully cancelled ${data.cancelledBookings?.length || 0} bookings`);

      // Clear the book number and reset state
      setCurrentBookNumber(null);
      setSelectedService(null);
      setSelectedBookings([]);
      setCurrentDate(new Date());
      setFormData({
        patientName: '',
        patientEmail: '',
        patientPhone: '',
        reasonForVisit: ''
      });
      setConsentAgreed(false);
      setPolicyAgreed(false);

      // Navigate to find-practitioner page
      router.push('/find-practitioner');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking. Please try again.');
    }
  };

  // Submit multiple bookings function
  const submitBooking = async () => {
    if (!selectedService || selectedBookings.length === 0) {
      toast.error('Please complete all required fields before booking.');
      return false;
    }

    if (!user) {
      toast.error('Please log in to make a booking.');
      router.push('/auth/signin');
      return false;
    }

    try {
      if (isRescheduleMode && currentBookNumber) {
        // Reschedule mode: Update existing bookings with same book number

        const rescheduleData = selectedBookings.map(booking => ({
          practitioner_id: practitionerId,
          patient_id: user.id,
          date: booking.date,
          time: booking.apiTime,
          service_type: `${selectedService.serviceName} - ${selectedService.session.type}`,
          price: selectedService.session.price,
          reason: formData.reasonForVisit || null,
          book_number: currentBookNumber, // Keep the same book number
          status: 'confirmed',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        const response = await fetch('/api/bookings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            book_number: currentBookNumber,
            reschedule_data: rescheduleData
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(`Failed to reschedule booking: ${data.error}`);
          throw new Error(data.error);
        }

        toast.success(`Successfully rescheduled ${data.bookings?.length || 0} bookings!`);
        setIsRescheduleMode(false); // Exit reschedule mode
        return true;
      } else {
        // Normal booking mode: Create new bookings
        const bookNumber = `BK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        // Store the book number for use in confirmation
        setCurrentBookNumber(bookNumber);

        // Create multiple booking requests with the same book_number
        const bookingPromises = selectedBookings.map(async (booking) => {
          const bookingData = {
            practitioner_id: practitionerId,
            patient_id: user.id, // Use actual authenticated patient ID
            date: booking.date,
            time: booking.apiTime, // Use pre-converted API time format
            service_type: `${selectedService.serviceName} - ${selectedService.session.type}`,
            price: selectedService.session.price,
            reason: formData.reasonForVisit || null,
            book_number: bookNumber // Same book number for all bookings in this session
          };

          const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData),
          });

          if (!response.ok) {
            const errorData = await response.json();
            const errorMessage = `Failed to book ${booking.displayDate} at ${booking.timeSlot}: ${errorData.error}`;
            toast.error(errorMessage);
            throw new Error(errorMessage);
          }

          return await response.json();
        });

        // Execute all booking requests
        const results = await Promise.all(bookingPromises);
        toast.success(`${results.length} booking${results.length > 1 ? 's' : ''} created successfully!`);
        return true;
      }
    } catch (error) {
      console.error('Error creating bookings:', error);
      toast.error(`Failed to create booking: ${error.message}`);
      return false;
    }
  };

  const handleReschedule = () => {
    // Enable reschedule mode - keep book number and selected service
    setIsRescheduleMode(true);

    // Only reset booking slots and date - keep service and form data
    setSelectedBookings([]);
    setCurrentDate(new Date());

    // Go back to step 3 (Date & Time selection) since service is already selected
    router.push(`/book/${practitionerId}?step=3`);
  };

  const handleStartNewBooking = () => {
    // Clear localStorage first
    clearLocalStorage();

    // Reset ALL booking data and states
    setCurrentBookNumber(null);
    setIsRescheduleMode(false);
    setSelectedService(null);
    setSelectedBookings([]);
    setCurrentDate(new Date());
    setFormData({
      patientName: '',
      patientEmail: '',
      patientPhone: '',
      reasonForVisit: ''
    });
    setConsentAgreed(false);
    setPolicyAgreed(false);
    setAvailableSlots({ morning: [], afternoon: [], conflicts: {}, practitionerBookings: {} });

    // Go back to step 1 for a fresh start
    router.push(`/book/${practitionerId}?step=1`);
  };

  // Get display text for selected service
  const getSelectedServiceDisplay = () => {
    if (!selectedService) return 'No service selected';
    return `${selectedService.serviceName} - ${selectedService.session.type}`;
  };

  // Check if step 1 is valid (service selected)
  const isStep1Valid = () => {
    return selectedService !== null;
  };

  // Show unified loading screen until all data is ready
  const isFullyLoaded = !authLoading && !loading && user && userProfile?.user_type === 'patient' && practitioner && !error;

  if (!isFullyLoaded) {
    return (
      <div className="font-sans min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            {/* Main Loading Animation */}
            <div className="mb-8">
              <div className="relative w-28 h-28 mx-auto">
                {/* Outer rotating ring */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-600 rounded-full animate-spin [animation-duration:3s]"></div>
                {/* Inner pulsing ring */}
                <div className="absolute inset-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-full animate-pulse"></div>
                {/* Center icon */}
                <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                {/* Floating particles */}
                <div className="absolute -top-3 -right-3 w-6 h-6 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75 [animation-delay:0.5s]"></div>
                <div className="absolute -top-3 -left-3 w-3 h-3 bg-purple-400 rounded-full animate-ping opacity-75 [animation-delay:1s]"></div>
                <div className="absolute -bottom-3 -right-3 w-5 h-5 bg-yellow-400 rounded-full animate-ping opacity-75 [animation-delay:1.5s]"></div>
              </div>
            </div>

            {/* Dynamic Loading Content */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Preparing Your Booking Experience
              </h1>
              <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">
                {authLoading && "Verifying your authentication..."}
                {!authLoading && loading && "Loading practitioner information and booking calendar..."}
                {!authLoading && !loading && !user && "Setting up your session..."}
                {!authLoading && !loading && user && !practitioner && "Finalizing booking setup..."}
              </p>
            </div>

            {/* Progress Steps */}
            <div className="mt-12 space-y-6">
              {/* Progress Bar */}
              <div className="w-80 max-w-full mx-auto">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full transition-all duration-1000 ease-out animate-pulse"
                       style={{
                         width: authLoading ? '25%' :
                                loading ? '60%' :
                                !user ? '80%' : '95%'
                       }}>
                  </div>
                </div>
              </div>

              {/* Loading Steps */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-center space-x-3">
                  <div className={`w-3 h-3 rounded-full transition-colors duration-500 ${!authLoading ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                  <span className={`transition-colors duration-500 ${!authLoading ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                    Authentication verified
                  </span>
                </div>

                <div className="flex items-center justify-center space-x-3">
                  <div className={`w-3 h-3 rounded-full transition-colors duration-500 ${!authLoading && !loading ? 'bg-green-500' : !authLoading ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  <span className={`transition-colors duration-500 ${!authLoading && !loading ? 'text-green-600 font-medium' : !authLoading ? 'text-gray-600' : 'text-gray-400'}`}>
                    Practitioner profile loaded
                  </span>
                </div>

                <div className="flex items-center justify-center space-x-3">
                  <div className={`w-3 h-3 rounded-full transition-colors duration-500 ${user && practitioner ? 'bg-green-500' : !authLoading && !loading ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                  <span className={`transition-colors duration-500 ${user && practitioner ? 'text-green-600 font-medium' : !authLoading && !loading ? 'text-gray-600' : 'text-gray-400'}`}>
                    Booking system ready
                  </span>
                </div>
              </div>

              {/* Animated dots */}
              <div className="flex justify-center space-x-2 mt-8">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !practitioner) {
    return (
      <div className="font-sans min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>

          {/* Error Content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Oops! Something went wrong</h2>
            <p className="text-red-600 font-medium">
              {error || 'Practitioner not found'}
            </p>
            <p className="text-gray-600">
              We could not load the practitioner&apos;s booking page. This might be due to an invalid link or the practitioner may no longer be available.
            </p>
          </div>

          {/* Action Button */}
          <div className="mt-8">
            <button
              onClick={handleBack}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Go Back</span>
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-sm text-gray-500">
            <p>Need help? <a href="/contact" className="text-blue-600 hover:underline">Contact our support team</a></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="font-sans min-h-screen bg-gray-50"
           style={{
             animation: 'fadeIn 0.6s ease-out'
           }}>

      {/* Progress Steps */}
      <div className="mt-24">
        <ProgressSteps
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
          canNavigateToStep={canNavigateToStep}
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pt-8 pb-8">
        {/* Reschedule Mode Indicator */}
        {isRescheduleMode && (
          <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div>
                <h3 className="text-orange-800 font-semibold">Reschedule Mode</h3>
                <p className="text-orange-700 text-sm">
                  You are rescheduling booking <strong>{currentBookNumber}</strong>. Select new dates and times to update your existing appointments.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Practitioner Info */}
        <PractitionerInfo
          practitioner={practitioner}
          currentStep={currentStep}
          selectedService={selectedService}
          selectedBookings={selectedBookings}
          formatSpecialties={formatSpecialties}
          getSelectedServiceDisplay={getSelectedServiceDisplay}
        />

        {/* Services Section */}
        {currentStep === 1 && (
          <Step1ServiceSelection
            services={services}
            selectedService={selectedService}
            onServiceSelect={handleServiceSelect}
          />
        )}

        {/* Appointment Type Section */}
        {currentStep === 2 && (
          <Step2AppointmentType
            appointmentType={appointmentType}
            setAppointmentType={setAppointmentType}
            onNext={() => router.push(`/book/${practitionerId}?step=3`)}
            onBack={() => router.push(`/book/${practitionerId}?step=1`)}
          />
        )}

        {/* Date & Time Selection */}
        {currentStep === 3 && (
          <Step3DateTimeSelection
            currentDate={currentDate}
            availableSlots={filterAvailableSlots(availableSlots, currentDate)}
            selectedBookings={selectedBookings}
            loadingAvailability={loadingAvailability}
            onDateSelect={handleDateSelect}
            onTimeSlotSelect={handleTimeSlotSelect}
            onNavigateMonth={navigateMonth}
            onClearBookings={() => setSelectedBookings([])}
            onToggleBookingSelection={toggleBookingSelection}
            formatMonth={formatMonth}
            getDaysInMonth={getDaysInMonth}
            isPastDate={isPastDate}
            dateHasBookings={dateHasBookings}
            isCurrentViewingDate={isCurrentViewingDate}
            isBookingSelected={isBookingSelected}
            selectedService={selectedService}
          />
        )}

        {/* Basic Information Form */}
        {currentStep === 4 && (
          <Step4BasicInformation
            formData={formData}
            consentAgreed={consentAgreed}
            policyAgreed={policyAgreed}
            onFormChange={handleFormChange}
            onConsentChange={setConsentAgreed}
            onPolicyChange={setPolicyAgreed}
          />
        )}

        {/* Booking Confirmation */}
        {currentStep === 5 && (
          <Step5Confirmation
            practitioner={practitioner}
            selectedService={selectedService}
            selectedBookings={selectedBookings}
            onReschedule={handleReschedule}
            onCancel={handleCancel}
            onBack={handleBack}
            getSelectedServiceDisplay={getSelectedServiceDisplay}
            bookNumber={currentBookNumber}
            onStartNewBooking={handleStartNewBooking}
          />
        )}

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex justify-between items-center mt-8">
            <button 
              onClick={handleBack}
              className="flex items-center space-x-2 px-4 py-2 rounded-full text-white bg-secondary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNextStep}
              disabled={
                isSubmittingBooking ||
                (currentStep === 1 && !isStep1Valid()) ||
                (currentStep === 3 && selectedBookings.length === 0) ||
                (currentStep === 4 && !isFormValid())
              }
              className={`px-6 py-2 rounded-full transition-colors font-medium flex items-center justify-center space-x-2 ${
                isSubmittingBooking ||
                (currentStep === 1 && !isStep1Valid()) ||
                (currentStep === 3 && selectedBookings.length === 0) ||
                (currentStep === 4 && !isFormValid())
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              {isSubmittingBooking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting Booking...</span>
                </>
              ) : (
                <>
                  {currentStep === 1 ? 'Select Appointment Type →' : 
                   currentStep === 2 ? 'Select Date and Time →' :
                   currentStep === 3 ? 'Add Basic Information →' :
                   'Confirm Booking →'}
                </>
              )}
            </button>
          </div>
        )}

        {/* Cancel Booking Confirmation Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Cancel Booking</h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to cancel all bookings with book number <strong>{currentBookNumber}</strong>? This action cannot be undone.
              </p>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  onClick={confirmCancelBooking}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
};

export default PractitionerBooking;