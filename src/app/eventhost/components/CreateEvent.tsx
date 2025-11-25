// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/lib/toast';
import dynamic from 'next/dynamic';

const Autocomplete = dynamic(
  () => import('@react-google-maps/api').then(mod => ({ default: mod.Autocomplete })),
  {
    ssr: false,
    loading: () => <input
      type="text"
      placeholder="Loading address autocomplete..."
      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
      disabled
    />
  }
);

interface TicketType {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  salesStartDate: string;
  salesEndDate: string;
  price: number;
  requiresApproval: boolean;
  suggestedPricing: boolean;
  markedAsSoldOut: boolean;
}

interface Waiver {
  id: string;
  title: string;
  content: string;
  required: boolean;
}

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

interface CreateEventProps {
  setActiveTab?: (tab: string) => void;
  editingEvent?: EventData | null;
  onEventUpdated?: () => void;
}

export default function CreateEvent({ setActiveTab, editingEvent, onEventUpdated }: CreateEventProps = {}) {
  const { user } = useAuth();

  // Form state
  const [eventName, setEventName] = useState('');
  const [eventFormat, setEventFormat] = useState<'in-person' | 'virtual' | 'tba'>('in-person');
  const [eventSummary, setEventSummary] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [whatToBring, setWhatToBring] = useState('');
  const [hideAddress, setHideAddress] = useState(false);
  const [enableTicketing, setEnableTicketing] = useState(false);
  const [nonRefundable, setNonRefundable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Event date and time state
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');

  // Separate address fields
  const [addressFields, setAddressFields] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });

  // Event image upload state
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [eventImagePreview, setEventImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ticket types state
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);

  // Waivers state
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [editingWaiver, setEditingWaiver] = useState<Waiver | null>(null);

  // Coupons state
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);

  // Google Maps Autocomplete states
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  // LocalStorage key for form persistence
  const FORM_STORAGE_KEY = 'event_form_draft';
  const [hasSavedData, setHasSavedData] = useState(false);

  // Handle event image selection
  const handleEventImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      setEventImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle add ticket type
  const handleAddTicketType = () => {
    if (!eventStartDate) {
      showToast.error('Please set the event start date first before adding tickets');
      return;
    }
    setEditingTicket(null);
    setShowTicketModal(true);
  };

  // Handle edit ticket type
  const handleEditTicketType = (ticket: TicketType) => {
    setEditingTicket(ticket);
    setShowTicketModal(true);
  };

  // Handle delete ticket type
  const handleDeleteTicketType = (ticketId: string) => {
    setTicketTypes(ticketTypes.filter(t => t.id !== ticketId));
  };

  // Handle save ticket type from modal
  const handleSaveTicketType = (ticketData: Omit<TicketType, 'id'>) => {
    if (editingTicket) {
      // Update existing ticket
      setTicketTypes(ticketTypes.map(t =>
        t.id === editingTicket.id
          ? { ...ticketData, id: editingTicket.id }
          : t
      ));
    } else {
      // Add new ticket
      const newTicket: TicketType = {
        ...ticketData,
        id: Date.now().toString(),
      };
      setTicketTypes([...ticketTypes, newTicket]);
    }
    setShowTicketModal(false);
  };

  // Handle add waiver
  const handleAddWaiver = () => {
    setEditingWaiver(null);
    setShowWaiverModal(true);
  };

  // Handle edit waiver
  const handleEditWaiver = (waiver: Waiver) => {
    setEditingWaiver(waiver);
    setShowWaiverModal(true);
  };

  // Handle delete waiver
  const handleDeleteWaiver = (waiverId: string) => {
    setWaivers(waivers.filter(w => w.id !== waiverId));
  };

  // Handle save waiver from modal
  const handleSaveWaiver = (waiverData: Omit<Waiver, 'id'>) => {
    if (editingWaiver) {
      // Update existing waiver
      setWaivers(waivers.map(w =>
        w.id === editingWaiver.id
          ? { ...waiverData, id: editingWaiver.id }
          : w
      ));
    } else {
      // Add new waiver
      const newWaiver: Waiver = {
        ...waiverData,
        id: Date.now().toString(),
      };
      setWaivers([...waivers, newWaiver]);
    }
    setShowWaiverModal(false);
  };

  // Load saved form data from localStorage on mount
  useEffect(() => {
    // Only load saved data if not editing an existing event
    if (!editingEvent && typeof window !== 'undefined') {
      const savedData = localStorage.getItem(FORM_STORAGE_KEY);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          // Check if there's actually meaningful data saved
          const hasData = parsed.eventName || parsed.eventSummary || parsed.eventDescription;
          if (hasData) {
            setHasSavedData(true);
            setEventName(parsed.eventName || '');
            setEventFormat(parsed.eventFormat || 'in-person');
            setEventSummary(parsed.eventSummary || '');
            setEventDescription(parsed.eventDescription || '');
            setWhatToBring(parsed.whatToBring || '');
            setEventStartDate(parsed.eventStartDate || '');
            setEventEndDate(parsed.eventEndDate || '');
            setAddressFields(parsed.addressFields || {
              street: '',
              city: '',
              state: '',
              zipCode: '',
            });
            setHideAddress(parsed.hideAddress || false);
            setEnableTicketing(parsed.enableTicketing || false);
            setNonRefundable(parsed.nonRefundable || false);
            setTicketTypes(parsed.ticketTypes || []);
            setWaivers(parsed.waivers || []);
            // Note: We don't restore image file, only preview URL
            if (parsed.eventImagePreview) {
              setEventImagePreview(parsed.eventImagePreview);
            }
          }
        } catch (error) {
        }
      }
    }
  }, [editingEvent]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    // Only save if not editing an existing event
    if (!editingEvent && typeof window !== 'undefined') {
      const formData = {
        eventName,
        eventFormat,
        eventSummary,
        eventDescription,
        whatToBring,
        eventStartDate,
        eventEndDate,
        addressFields,
        hideAddress,
        enableTicketing,
        nonRefundable,
        ticketTypes,
        waivers,
        eventImagePreview,
      };
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
    }
  }, [
    eventName,
    eventFormat,
    eventSummary,
    eventDescription,
    whatToBring,
    eventStartDate,
    eventEndDate,
    addressFields,
    hideAddress,
    enableTicketing,
    nonRefundable,
    ticketTypes,
    waivers,
    eventImagePreview,
    editingEvent,
  ]);

  // Clear saved form data
  const clearSavedFormData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(FORM_STORAGE_KEY);
      setHasSavedData(false);
    }
  };

  // Start fresh - clear all form fields and saved data
  const handleStartFresh = () => {
    clearSavedFormData();
    setEventName('');
    setEventFormat('in-person');
    setEventSummary('');
    setEventDescription('');
    setWhatToBring('');
    setEventStartDate('');
    setEventEndDate('');
    setAddressFields({
      street: '',
      city: '',
      state: '',
      zipCode: '',
    });
    setHideAddress(false);
    setEnableTicketing(false);
    setNonRefundable(false);
    setEventImageFile(null);
    setEventImagePreview('');
    setTicketTypes([]);
    setWaivers([]);
    showToast.success('Form cleared - starting fresh!');
  };

  // Load event data when editing
  useEffect(() => {
    const loadEventData = async () => {
      if (editingEvent) {
        setEventName(editingEvent.event_name);
        setEventFormat((editingEvent as any).event_format || 'in-person');
        setEventSummary(editingEvent.event_summary);
        setEventDescription(editingEvent.event_description);
        setWhatToBring(editingEvent.what_to_bring || '');

        // Convert datetime to format required by datetime-local input (YYYY-MM-DDTHH:mm)
        // Handle timezone correctly - datetime-local expects local time, not UTC
        const formatDateTimeForInput = (dateString: string) => {
          if (!dateString || typeof dateString !== 'string' || dateString.trim() === '') {
            return '';
          }
          
          try {
            // First, try to parse if it's already in YYYY-MM-DDTHH:mm format (with or without seconds)
            // This handles cases where the date might already be close to the right format
            const simpleFormatMatch = dateString.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
            if (simpleFormatMatch) {
              // If it's already in the right format (or close), use it directly
              return simpleFormatMatch[1];
            }
            
            // Otherwise, parse the date string - JavaScript Date automatically handles timezone conversion
            // Supabase returns dates as ISO 8601 strings (e.g., "2024-01-15T10:30:00+00:00" or "2024-01-15T10:30:00Z")
            const date = new Date(dateString);
            
            // Check if date is valid
            if (isNaN(date.getTime())) {
              return '';
            }
            
            // Get local date/time components (not UTC)
            // This ensures the datetime-local input shows the correct local time
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            const formatted = `${year}-${month}-${day}T${hours}:${minutes}`;
            return formatted;
          } catch (error) {
            return '';
          }
        };

        // Format dates for datetime-local input
        // Ensure we have valid date strings before formatting
        const startDateStr = editingEvent.event_start_datetime;
        const endDateStr = editingEvent.event_end_datetime;
        
        if (startDateStr) {
          const startDateFormatted = formatDateTimeForInput(startDateStr);
          if (startDateFormatted) {
            setEventStartDate(startDateFormatted);
          } else {
            // If formatting failed, try to set empty to show the field is empty
            setEventStartDate('');
          }
        } else {
          setEventStartDate('');
        }
        
        if (endDateStr) {
          const endDateFormatted = formatDateTimeForInput(endDateStr);
          if (endDateFormatted) {
            setEventEndDate(endDateFormatted);
          } else {
            setEventEndDate('');
          }
        } else {
          setEventEndDate('');
        }

        // Parse address
        const addressParts = editingEvent.address.split(', ');
        if (addressParts.length >= 4) {
          setAddressFields({
            street: addressParts[0],
            city: addressParts[1],
            state: addressParts[2],
            zipCode: addressParts[3],
          });
        }

        setHideAddress(editingEvent.hide_address);
        setEnableTicketing(editingEvent.enable_ticketing);
        setNonRefundable(editingEvent.non_refundable);

        // Set existing image preview
        if (editingEvent.event_image) {
          setEventImagePreview(editingEvent.event_image);
        }

        // Fetch and load ticket types
        try {
          const response = await fetch(`/api/events/${editingEvent.id}/tickets`);
          const result = await response.json();

          if (response.ok && result.success) {
            setTicketTypes(result.tickets || []);
          } else {
            // If fetching fails, just start with empty tickets
            setTicketTypes([]);
          }
        } catch (error) {
          // If there's an error, just start with empty tickets
          setTicketTypes([]);
        }

        // Fetch and load selected coupons for this event
        try {
          const response = await fetch(`/api/events/${editingEvent.id}/coupons`);
          const result = await response.json();

          if (response.ok && result.success && result.couponIds) {
            setSelectedCoupons(result.couponIds.map((id: number) => id.toString()));
          } else {
            // If fetching fails, just start with empty coupons
            setSelectedCoupons([]);
          }
        } catch (error) {
          // If there's an error, just start with empty coupons
          setSelectedCoupons([]);
        }
      } else {
        // Clear all form fields when not editing
        setEventName('');
        setEventFormat('in-person');
        setEventSummary('');
        setEventDescription('');
        setWhatToBring('');
        setEventStartDate('');
        setEventEndDate('');
        setAddressFields({
          street: '',
          city: '',
          state: '',
          zipCode: '',
        });
        setHideAddress(false);
        setEnableTicketing(false);
        setNonRefundable(false);
        setEventImageFile(null);
        setEventImagePreview('');
        setTicketTypes([]);
        setWaivers([]);
        setSelectedCoupons([]);
      }
    };

    loadEventData();
  }, [editingEvent]);

  // Fetch available coupons for the host
  useEffect(() => {
    const fetchCoupons = async () => {
      if (!user?.id) return;

      setLoadingCoupons(true);
      try {
        const response = await fetch(`/api/coupons?host_id=${user.id}`);
        const result = await response.json();

        if (response.ok && result.success) {
          // Only show active coupons
          const activeCoupons = result.coupons.filter((c: any) => c.is_active);
          setAvailableCoupons(activeCoupons);
        }
      } catch (error) {
        console.error('Failed to fetch coupons:', error);
      } finally {
        setLoadingCoupons(false);
      }
    };

    fetchCoupons();
  }, [user]);

  // Handle coupon selection toggle
  const handleToggleCoupon = (couponId: string) => {
    setSelectedCoupons(prev =>
      prev.includes(couponId)
        ? prev.filter(id => id !== couponId)
        : [...prev, couponId]
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent, saveAsDraft = false) => {
    e.preventDefault();

    if (!user?.id) {
      showToast.error('You must be logged in to create an event');
      return;
    }

    // Only validate required fields if publishing (not saving as draft)
    if (!saveAsDraft) {
      if (!eventName.trim()) {
        showToast.error('Event name is required');
        return;
      }

      if (!eventSummary.trim()) {
        showToast.error('Event summary is required');
        return;
      }

      if (!eventDescription.trim()) {
        showToast.error('Event description is required');
        return;
      }

      if (!eventStartDate || !eventEndDate) {
        showToast.error('Event start and end dates are required');
        return;
      }

      // Validate address fields
      if (!addressFields.street.trim() || !addressFields.city.trim() || !addressFields.state.trim() || !addressFields.zipCode.trim()) {
        showToast.error('Complete address is required (street, city, state, and zip code)');
        return;
      }

      // Validate event dates
      const startDate = new Date(eventStartDate);
      const endDate = new Date(eventEndDate);

      if (endDate < startDate) {
        showToast.error('Event End Date and Time cannot be before Event Start Date and Time');
        return;
      }

      // For create mode, image is required. For edit mode, image is optional
      if (!editingEvent && !eventImageFile) {
        showToast.error('Event image is required');
        return;
      }
    } else {
      // When saving as draft, only require event name at minimum
      if (!eventName.trim()) {
        showToast.error('Event name is required to save as draft');
        return;
      }

      // If dates are provided, still validate that end date is after start date
      if (eventStartDate && eventEndDate) {
        const startDate = new Date(eventStartDate);
        const endDate = new Date(eventEndDate);

        if (endDate < startDate) {
          showToast.error('Event End Date and Time cannot be before Event Start Date and Time');
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      // Combine address fields into single string (filter out empty parts for drafts)
      const addressParts = [
        addressFields.street,
        addressFields.city,
        addressFields.state,
        addressFields.zipCode
      ].filter(part => part?.trim());
      const fullAddress = addressParts.join(', ');

      // Prepare form data
      const formData = new FormData();
      formData.append('host_id', user.id);
      formData.append('title', eventName);
      formData.append('event_format', eventFormat);
      formData.append('summary', eventSummary || '');
      formData.append('description', eventDescription || '');
      formData.append('what_to_bring', whatToBring || '');
      formData.append('start_date', eventStartDate || '');
      formData.append('end_date', eventEndDate || '');
      formData.append('location', fullAddress);
      formData.append('hide_address', hideAddress.toString());
      formData.append('enable_ticketing', enableTicketing.toString());
      formData.append('non_refundable', nonRefundable.toString());
      formData.append('status', saveAsDraft ? 'draft' : 'published');
      formData.append('ticket_types', JSON.stringify(ticketTypes));
      formData.append('selected_coupons', JSON.stringify(selectedCoupons));

      // Add event image if new file selected
      if (eventImageFile) {
        formData.append('event_image', eventImageFile);
      }

      // For edit mode, add event ID and existing image URL
      if (editingEvent) {
        formData.append('event_id', editingEvent.id);
        if (editingEvent.event_image && !eventImageFile) {
          formData.append('existing_image_url', editingEvent.event_image);
        }
      }

      // Submit to API
      const apiUrl = editingEvent ? '/api/events/update' : '/api/events/create';
      const method = editingEvent ? 'PUT' : 'POST';

      const response = await fetch(apiUrl, {
        method,
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || `Failed to ${editingEvent ? 'update' : 'create'} event`);
      }

      // Success!
      const successAction = editingEvent ? 'updated' : (saveAsDraft ? 'saved as draft' : 'created');
      showToast.success(result.message || `Event ${successAction} successfully!`);

      // Clear saved form data from localStorage
      clearSavedFormData();

      // Reset form only if creating (not editing)
      if (!editingEvent) {
        setEventName('');
        setEventFormat('in-person');
        setEventSummary('');
        setEventDescription('');
        setWhatToBring('');
        setEventStartDate('');
        setEventEndDate('');
        setAddressFields({
          street: '',
          city: '',
          state: '',
          zipCode: '',
        });
        setHideAddress(false);
        setEnableTicketing(false);
        setNonRefundable(false);
        setEventImageFile(null);
        setEventImagePreview('');
        setTicketTypes([]);
        setWaivers([]);
        setSelectedCoupons([]);
      }

      // Callback for refresh
      if (onEventUpdated) {
        onEventUpdated();
      }

      // Redirect to Manage Events tab after a short delay
      setTimeout(() => {
        if (setActiveTab) {
          setActiveTab('Manage an Event');
        }
      }, 1500);

    } catch (error: any) {
      showToast.error(error.message || `Failed to ${editingEvent ? 'update' : 'create'} event. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if Google Maps is loaded
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        setIsGoogleMapsLoaded(true);
      } else {
        setTimeout(checkGoogleMaps, 100);
      }
    };
    checkGoogleMaps();
  }, []);

  const onLoadAutocomplete = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();

      if (place.address_components) {
        const components = place.address_components;
        let street = '';
        let city = '';
        let state = '';
        let zipCode = '';

        // Extract street number and route
        const streetNumber = components.find(c => c.types.includes('street_number'))?.long_name || '';
        const route = components.find(c => c.types.includes('route'))?.long_name || '';
        street = `${streetNumber} ${route}`.trim();

        // Extract city
        city = components.find(c => c.types.includes('locality'))?.long_name ||
               components.find(c => c.types.includes('sublocality'))?.long_name || '';

        // Extract state
        state = components.find(c => c.types.includes('administrative_area_level_1'))?.short_name || '';

        // Extract zip code
        zipCode = components.find(c => c.types.includes('postal_code'))?.long_name || '';

        setAddressFields({
          street,
          city,
          state,
          zipCode,
        });
      }
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {editingEvent ? 'Edit Event' : 'Create an Event or Experience'}
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          {editingEvent
            ? 'Update your event details below. Changes will be reflected on the Kaizen site.'
            : 'Ready to create an Event or Experience? Fill out the form below. The information will be displayed on the event pages on the Kaizen site.'}
        </p>
      </div>

      {/* Saved Data Notification */}
      {hasSavedData && !editingEvent && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-900">Draft Restored</h3>
                <p className="text-sm text-blue-700 mt-1">
                  We&apos;ve restored your previous work. Your form data is automatically saved as you type.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleStartFresh}
              className="ml-4 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 rounded-lg transition whitespace-nowrap"
            >
              Start Fresh
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Event Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Name *
            </label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter event name"
              disabled={isSubmitting}
            />
          </div>

          {/* Event Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Format *
            </label>
            <select
              value={eventFormat}
              onChange={(e) => setEventFormat(e.target.value as 'in-person' | 'virtual' | 'tba')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="in-person">In-person</option>
              <option value="virtual">Virtual</option>
              <option value="tba">To Be Announced</option>
            </select>
          </div>

          {/* Date and Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date and Time *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  min={eventStartDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <div className="space-y-4">
              {/* Street Address with Google Places Autocomplete */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Street Address *
                </label>
                {isGoogleMapsLoaded ? (
                  <Autocomplete
                    onLoad={onLoadAutocomplete}
                    onPlaceChanged={onPlaceChanged}
                    options={{
                      componentRestrictions: { country: ['us', 'ca'] },
                      fields: ['address_components', 'formatted_address', 'geometry', 'name'],
                      types: ['address']
                    }}
                  >
                    <input
                      type="text"
                      value={addressFields.street}
                      onChange={(e) => setAddressFields({ ...addressFields, street: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Start typing your address..."
                      autoComplete="off"
                    />
                  </Autocomplete>
                ) : (
                  <input
                    type="text"
                    value={addressFields.street}
                    onChange={(e) => setAddressFields({ ...addressFields, street: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-100"
                    placeholder="Loading Google Maps..."
                    disabled
                  />
                )}
              </div>

              {/* City, State, Zip in a grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={addressFields.city}
                    onChange={(e) => setAddressFields({ ...addressFields, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={addressFields.state}
                    onChange={(e) => setAddressFields({ ...addressFields, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="State"
                    maxLength={2}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Zip Code *
                  </label>
                  <input
                    type="text"
                    value={addressFields.zipCode}
                    onChange={(e) => setAddressFields({ ...addressFields, zipCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Zip Code"
                  />
                </div>
              </div>

              {/* Hide Address Toggle */}
              <div className="flex items-center justify-between gap-3 p-4 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700 flex-1">
                  Want to Hide the address until a User Registers?
                </span>
                <button
                  type="button"
                  onClick={() => setHideAddress(!hideAddress)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                    hideAddress ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      hideAddress ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Event Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Summary *
            </label>
            <textarea
              rows={2}
              value={eventSummary}
              onChange={(e) => setEventSummary(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Brief summary of your event (2-3 sentences)"
              disabled={isSubmitting}
            ></textarea>
          </div>

          {/* Event Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Description *
            </label>
            <textarea
              rows={6}
              value={eventDescription}
              onChange={(e) => setEventDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Detailed description of your event..."
              disabled={isSubmitting}
            ></textarea>
          </div>

          {/* What to Bring */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What to Bring (or Not to bring)
            </label>
            <textarea
              rows={3}
              value={whatToBring}
              onChange={(e) => setWhatToBring(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="List items participants should bring or not bring..."
              disabled={isSubmitting}
            ></textarea>
          </div>

          {/* Event Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Image *
            </label>
            <div className="space-y-4">
              {/* Image Preview */}
              {eventImagePreview && (
                <div className="relative w-full max-w-2xl mx-auto rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
                  <div className="relative w-full" style={{ paddingBottom: '66.67%' }}>
                    <Image
                      src={eventImagePreview}
                      alt="Event preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Upload Button and File Info */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition"
                >
                  {eventImagePreview ? 'Change Image' : 'Upload Image'}
                </button>
                {eventImageFile && (
                  <span className="text-sm text-gray-600">
                    {eventImageFile.name}
                  </span>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleEventImageChange}
                className="hidden"
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 space-y-1">
                  <strong>Image Requirements:</strong>
                  <br />
                  Dimensions: 1200 x 630 pixels (landscape orientation, 3:2 aspect ratio)
                  <br />
                  File Size: Maximum 5MB | Format: JPG, PNG, or WebP
                </p>
              </div>
            </div>
          </div>

          {/* Three Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Card 1: Ticket Options */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Options</h3>

              {ticketTypes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 font-medium mb-2">No Ticket Types Yet</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Add Your First Ticket Type to Get Started.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddTicketType}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                  >
                    Add Ticket Type
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* List of ticket types */}
                  {ticketTypes.map((ticket) => (
                    <div key={ticket.id} className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{ticket.name}</h4>
                            {ticket.markedAsSoldOut && (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                                Sold Out
                              </span>
                            )}
                          </div>
                          {ticket.description && (
                            <p className="text-xs text-gray-500 mt-1">{ticket.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditTicketType(ticket)}
                            className="text-primary hover:text-primary-dark text-sm"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTicketType(ticket.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Price: ${ticket.price.toFixed(2)}</span>
                          <span>Qty: {ticket.quantity}</span>
                        </div>
                        {ticket.requiresApproval && (
                          <div className="text-blue-600">• Requires Approval</div>
                        )}
                        {ticket.suggestedPricing && (
                          <div className="text-green-600">• Suggested Pricing</div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add more button */}
                  <button
                    type="button"
                    onClick={handleAddTicketType}
                    className="w-full px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition"
                  >
                    Add Another Ticket Type
                  </button>
                </div>
              )}
            </div>

            {/* Card 2: Enable Ticketing */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticketing Settings</h3>
              <div className="space-y-4">
                {/* Enable Ticketing Toggle */}
                <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Enable Ticketing with Kaizen
                    </div>
                    <div className="text-xs text-gray-500">
                      Sell tickets directly through your Kaizen account.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnableTicketing(!enableTicketing)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                      enableTicketing ? 'bg-primary' : 'bg-gray-300'
                    }`}
                    aria-label="Toggle ticketing"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        enableTicketing ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Non-Refundable Toggle */}
                <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Non-Refundable Event?
                    </div>
                    <div className="text-xs text-gray-500">
                      When enabled, tickets to your event will be non-refundable.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNonRefundable(!nonRefundable)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                      nonRefundable ? 'bg-primary' : 'bg-gray-300'
                    }`}
                    aria-label="Toggle non-refundable"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        nonRefundable ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3: Waivers */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Waivers</h3>

              {waivers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 font-medium mb-2">No Waivers Yet</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Add liability waivers or terms that attendees must agree to before registering.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddWaiver}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                  >
                    Add Waiver
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* List of waivers */}
                  {waivers.map((waiver) => (
                    <div key={waiver.id} className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900">{waiver.title}</h4>
                            {waiver.required && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{waiver.content}</p>
                        </div>
                        <div className="flex gap-2 ml-2">
                          <button
                            type="button"
                            onClick={() => handleEditWaiver(waiver)}
                            className="text-primary hover:text-primary-dark text-sm"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteWaiver(waiver.id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add more button */}
                  <button
                    type="button"
                    onClick={handleAddWaiver}
                    className="w-full px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition"
                  >
                    Add Another Waiver
                  </button>
                </div>
              )}
            </div>

            {/* Card 4: Coupons */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Discount Coupons (Optional)</h3>

              {loadingCoupons ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading coupons...</p>
                </div>
              ) : availableCoupons.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <p className="text-gray-600 font-medium mb-2">No Active Coupons</p>
                  <p className="text-sm text-gray-500 mb-4">
                    Create discount coupons in the Manage Coupons section to apply them to your events.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Select which discount coupons can be used for this event. Attendees can apply these codes at checkout.
                  </p>
                  <div className="space-y-3">
                    {availableCoupons.map((coupon) => (
                      <div
                        key={coupon.id}
                        className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedCoupons.includes(coupon.id.toString())
                            ? 'border-primary bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => handleToggleCoupon(coupon.id.toString())}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex items-center h-5 mt-0.5">
                            <input
                              type="checkbox"
                              checked={selectedCoupons.includes(coupon.id.toString())}
                              onChange={() => handleToggleCoupon(coupon.id.toString())}
                              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900 font-mono text-sm">
                                {coupon.code}
                              </span>
                              <span className="text-sm font-semibold text-primary">
                                {coupon.discount_type === 'percentage'
                                  ? `${coupon.discount_value}% OFF`
                                  : `$${coupon.discount_value} OFF`}
                              </span>
                            </div>
                            {coupon.description && (
                              <p className="text-xs text-gray-600 mb-1">{coupon.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span>Uses: {coupon.used_count} / {coupon.max_uses}</span>
                              <span>•</span>
                              <span>Valid until: {new Date(coupon.valid_until).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedCoupons.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800 font-medium">
                        {selectedCoupons.length} coupon{selectedCoupons.length !== 1 ? 's' : ''} selected for this event
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={(e) => handleSubmit(e, false)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{editingEvent ? 'Updating Event...' : 'Publishing Event...'}</span>
                </>
              ) : (
                editingEvent ? 'Update & Publish Event' : 'Publish Event'
              )}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={(e) => handleSubmit(e as any, true)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                'Save as Draft'
              )}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                if (setActiveTab) {
                  setActiveTab(editingEvent ? 'Manage an Event' : 'Dashboard');
                }
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Add/Edit Ticket Type Modal */}
      {showTicketModal && (
        <TicketTypeModal
          ticket={editingTicket}
          onSave={handleSaveTicketType}
          onClose={() => setShowTicketModal(false)}
          eventStartDate={eventStartDate}
        />
      )}

      {/* Add/Edit Waiver Modal */}
      {showWaiverModal && (
        <WaiverModal
          waiver={editingWaiver}
          onSave={handleSaveWaiver}
          onClose={() => setShowWaiverModal(false)}
        />
      )}
    </div>
  );
}

// Ticket Type Modal Component
interface TicketTypeModalProps {
  ticket: TicketType | null;
  onSave: (ticket: Omit<TicketType, 'id'>) => void;
  onClose: () => void;
  eventStartDate: string;
}

function TicketTypeModal({ ticket, onSave, onClose, eventStartDate }: TicketTypeModalProps) {
  const [formData, setFormData] = useState({
    name: ticket?.name || '',
    description: ticket?.description || '',
    quantity: ticket?.quantity.toString() || '',
    salesStartDate: ticket?.salesStartDate || '',
    salesEndDate: ticket?.salesEndDate || '',
    price: ticket?.price.toString() || '',
    requiresApproval: ticket?.requiresApproval || false,
    suggestedPricing: ticket?.suggestedPricing || false,
    markedAsSoldOut: ticket?.markedAsSoldOut || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.price || !formData.quantity || !formData.salesStartDate || !formData.salesEndDate) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate quantity is a positive integer
    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity < 1) {
      alert('Please enter a valid quantity (minimum 1)');
      return;
    }

    // Validate price is valid
    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      alert('Please enter a valid price (minimum 0)');
      return;
    }

    // Validate that end date is not before start date
    const startDate = new Date(formData.salesStartDate);
    const endDate = new Date(formData.salesEndDate);
    const eventStart = new Date(eventStartDate);

    if (endDate < startDate) {
      alert('Sales End Date and Time cannot be before Sales Start Date and Time');
      return;
    }

    // Validate that sales end date doesn't exceed event start date
    if (endDate > eventStart) {
      alert('Ticket sales must end before or at the event start time');
      return;
    }

    onSave({
      name: formData.name,
      description: formData.description,
      quantity: quantity,
      salesStartDate: formData.salesStartDate,
      salesEndDate: formData.salesEndDate,
      price: price,
      requiresApproval: formData.requiresApproval,
      suggestedPricing: formData.suggestedPricing,
      markedAsSoldOut: formData.markedAsSoldOut,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {ticket ? 'Edit Ticket Type' : 'Add Ticket Type'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ticket Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ticket Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., General Admission, VIP, Early Bird"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Additional details about this ticket type..."
              ></textarea>
            </div>

            {/* Maximum Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Quantity *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter number of tickets available"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the maximum number of tickets available for this ticket type
              </p>
            </div>

            {/* Ticket Sales Dates and Times */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Ticket Sales Dates and Times
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Sales Start Date and Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.salesStartDate}
                    onChange={(e) => setFormData({ ...formData, salesStartDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Sales End Date and Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.salesEndDate}
                    onChange={(e) => setFormData({ ...formData, salesEndDate: e.target.value })}
                    min={formData.salesStartDate}
                    max={eventStartDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Sales must end before or at the event start time
                  </p>
                </div>
              </div>
            </div>

            {/* Ticket Price Section */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Ticket Price</h3>

              {/* Price */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                {/* Requires Approval */}
                <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 flex-1">
                    Requires Approval
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, requiresApproval: !formData.requiresApproval })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                      formData.requiresApproval ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.requiresApproval ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Suggested Pricing */}
                <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 flex-1">
                    Suggested Pricing
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, suggestedPricing: !formData.suggestedPricing })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                      formData.suggestedPricing ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.suggestedPricing ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Mark as Sold Out */}
                <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 flex-1">
                    Mark as Sold Out
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, markedAsSoldOut: !formData.markedAsSoldOut })}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                      formData.markedAsSoldOut ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.markedAsSoldOut ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              >
                {ticket ? 'Update Ticket' : 'Add Ticket'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Waiver Modal Component
interface WaiverModalProps {
  waiver: Waiver | null;
  onSave: (waiver: Omit<Waiver, 'id'>) => void;
  onClose: () => void;
}

function WaiverModal({ waiver, onSave, onClose }: WaiverModalProps) {
  const [formData, setFormData] = useState({
    title: waiver?.title || '',
    content: waiver?.content || '',
    required: waiver?.required ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title || !formData.content) {
      alert('Please fill in all required fields');
      return;
    }

    onSave({
      title: formData.title,
      content: formData.content,
      required: formData.required,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {waiver ? 'Edit Waiver' : 'Add Waiver'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Waiver Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waiver Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Liability Waiver, Photo Release, Code of Conduct"
                required
              />
            </div>

            {/* Waiver Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waiver Content *
              </label>
              <textarea
                rows={10}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter the full text of the waiver that attendees must read and agree to..."
                required
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                This text will be displayed to attendees during registration
              </p>
            </div>

            {/* Required Toggle */}
            <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">
                  Required *
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  Attendees must agree to this waiver before registering
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, required: !formData.required })}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${
                  formData.required ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.required ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Modal Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              >
                {waiver ? 'Update Waiver' : 'Add Waiver'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
