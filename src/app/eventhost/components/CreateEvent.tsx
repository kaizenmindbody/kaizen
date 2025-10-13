import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import '@placekit/autocomplete-js/dist/placekit-autocomplete.css';

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

interface CreateEventProps {
  setActiveTab?: (tab: string) => void;
}

export default function CreateEvent({ setActiveTab }: CreateEventProps = {}) {
  const { user } = useAuth();

  // Form state
  const [eventName, setEventName] = useState('');
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

  const [address, setAddress] = useState('');

  // Event image upload state
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [eventImagePreview, setEventImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ticket types state
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState<TicketType | null>(null);

  const addressInputRef = useRef<HTMLInputElement>(null);
  const placekitInstance = useRef<any>(null);

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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('You must be logged in to create an event');
      return;
    }

    // Validate required fields
    if (!eventName.trim()) {
      toast.error('Event name is required');
      return;
    }

    if (!eventSummary.trim()) {
      toast.error('Event summary is required');
      return;
    }

    if (!eventDescription.trim()) {
      toast.error('Event description is required');
      return;
    }

    if (!eventStartDate || !eventEndDate) {
      toast.error('Event start and end dates are required');
      return;
    }

    if (!address.trim()) {
      toast.error('Event address is required');
      return;
    }

    // Validate event dates
    const startDate = new Date(eventStartDate);
    const endDate = new Date(eventEndDate);

    if (endDate < startDate) {
      toast.error('Event End Date and Time cannot be before Event Start Date and Time');
      return;
    }

    if (!eventImageFile) {
      toast.error('Event image is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('host_id', user.id);
      formData.append('title', eventName);
      formData.append('description', `${eventSummary}\n\n${eventDescription}${whatToBring ? `\n\nWhat to Bring:\n${whatToBring}` : ''}`);
      formData.append('start_date', eventStartDate);
      formData.append('end_date', eventEndDate);
      formData.append('location', address);
      formData.append('event_image', eventImageFile);
      formData.append('ticket_types', JSON.stringify(ticketTypes));

      // Submit to API
      const response = await fetch('/api/events/create', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create event');
      }

      // Success!
      toast.success(result.message || 'Event created successfully!');

      // Reset form
      setEventName('');
      setEventSummary('');
      setEventDescription('');
      setWhatToBring('');
      setEventStartDate('');
      setEventEndDate('');
      setAddress('');
      setHideAddress(false);
      setEnableTicketing(false);
      setNonRefundable(false);
      setEventImageFile(null);
      setEventImagePreview('');
      setTicketTypes([]);

      // Redirect to Manage Events tab after a short delay
      setTimeout(() => {
        if (setActiveTab) {
          setActiveTab('Manage an Event');
        }
      }, 1500);

    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize PlaceKit autocomplete
  useEffect(() => {
    const initPlaceKit = async () => {
      // Only run on client-side
      if (typeof window === 'undefined') return;
      if (!addressInputRef.current || placekitInstance.current) return;

      try {
        // Dynamically import PlaceKit to avoid SSR issues
        const placekit = await import('@placekit/autocomplete-js');

        const apiKey = process.env.NEXT_PUBLIC_PLACEKIT_API_KEY;
        if (!apiKey) {
          console.error('PlaceKit API key is not configured');
          return;
        }

        placekitInstance.current = placekit.default(apiKey, {
          target: addressInputRef.current,
          countries: ['us', 'ca'],
          types: ['street', 'city', 'administrative'],
          maxResults: 5,
          panel: {
            className: 'placekit-panel',
          },
        });

        // Listen for address selection
        placekitInstance.current.on('pick', (value: any, item: any) => {
          // Build full address string from components
          const addressParts = [];

          if (item.name) addressParts.push(item.name);
          if (item.city) addressParts.push(item.city);
          if (item.administrative) addressParts.push(item.administrative);

          // Extract zip code - handle both string and array formats
          const zipCode = Array.isArray(item.zipcode)
            ? item.zipcode[0] || ''
            : item.zipcode || '';
          if (zipCode) addressParts.push(zipCode);

          // Join all parts with commas
          const fullAddress = addressParts.join(', ');
          setAddress(fullAddress);

          console.log('Address selected:', fullAddress);

          // Close the dropdown by blurring the input
          setTimeout(() => {
            if (addressInputRef.current) {
              addressInputRef.current.blur();
            }
          }, 100);
        });

      } catch (error) {
        console.error('Error initializing PlaceKit:', error);
      }
    };

    initPlaceKit();

    // Cleanup
    return () => {
      if (placekitInstance.current) {
        placekitInstance.current.destroy();
        placekitInstance.current = null;
      }
    };
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create an Event or Experience</h1>
        <p className="text-sm text-gray-600 mt-2">
          Ready to create an Event or Experience? Fill out the form below. The information will be displayed on the event pages on the Kaizen site.
        </p>
      </div>

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
              required
            />
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
                  required
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
                  required
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
              {/* Address with PlaceKit Autocomplete */}
              <input
                ref={addressInputRef}
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Start typing your address..."
                autoComplete="off"
                required
              />
              <p className="text-xs text-gray-500">
                Enter the full event address (street, city, state, zip code)
              </p>

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
              required
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
              required
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
                <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-300">
                  <Image
                    src={eventImagePreview}
                    alt="Event preview"
                    fill
                    className="object-cover"
                  />
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

              <p className="text-xs text-gray-500">
                Upload a high-quality image that represents your event. Recommended size: 1200x630px
              </p>
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
                  <span className="text-sm font-medium text-gray-700 flex-1 min-w-0 break-words">
                    Enable Ticketing with Kaizen
                  </span>
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
                  <span className="text-sm font-medium text-gray-700 flex-1 min-w-0 break-words">
                    Non-Refundable Event?
                  </span>
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
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Add liability waivers or terms that attendees must agree to before registering.
                </p>
                <button
                  type="button"
                  className="w-full px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition"
                >
                  Add Waiver
                </button>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Event...' : 'Create Event'}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Draft
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                if (setActiveTab) {
                  setActiveTab('Dashboard');
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
}

function TicketTypeModal({ ticket, onSave, onClose }: TicketTypeModalProps) {
  const [formData, setFormData] = useState({
    name: ticket?.name || '',
    description: ticket?.description || '',
    quantity: ticket?.quantity.toString() || '50',
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

    // Validate that end date is not before start date
    const startDate = new Date(formData.salesStartDate);
    const endDate = new Date(formData.salesEndDate);

    if (endDate < startDate) {
      alert('Sales End Date and Time cannot be before Sales Start Date and Time');
      return;
    }

    onSave({
      name: formData.name,
      description: formData.description,
      quantity: parseInt(formData.quantity),
      salesStartDate: formData.salesStartDate,
      salesEndDate: formData.salesEndDate,
      price: parseFloat(formData.price),
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
              <select
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="75">75</option>
                <option value="100">100</option>
                <option value="150">150</option>
                <option value="200">200</option>
                <option value="250">250</option>
                <option value="500">500</option>
                <option value="1000">1000</option>
              </select>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
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
