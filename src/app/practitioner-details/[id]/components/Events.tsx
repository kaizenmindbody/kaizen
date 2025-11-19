'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, Calendar, Clock, DollarSign, Ticket, Users, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

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
  ticketTypes?: TicketType[];
}

interface EventsProps {
  practitionerId: string;
}

export const Events = ({ practitionerId }: EventsProps) => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTickets, setLoadingTickets] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/events/host/${practitionerId}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to fetch events');
        }

        // Filter to show only published events
        const publishedEvents = (result.events || []).filter(
          (event: EventData) => event.status === 'published'
        );

        setEvents(publishedEvents);

        // Fetch ticket types for each event that has ticketing enabled
        publishedEvents.forEach(async (event: EventData) => {
          if (event.enable_ticketing) {
            await fetchTicketTypes(event.id);
          }
        });
      } catch (err: any) {
        console.error('Error fetching events:', err);
        setError(err.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    if (practitionerId) {
      fetchEvents();
    }
  }, [practitionerId]);

  const fetchTicketTypes = async (eventId: string) => {
    setLoadingTickets(prev => ({ ...prev, [eventId]: true }));
    try {
      const response = await fetch(`/api/events/${eventId}/tickets`);
      const result = await response.json();

      if (response.ok && result.success) {
        setEvents(prevEvents =>
          prevEvents.map(event =>
            event.id === eventId
              ? { ...event, ticketTypes: result.tickets || [] }
              : event
          )
        );
      }
    } catch (error) {
      console.error('Error fetching ticket types:', error);
    } finally {
      setLoadingTickets(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTimeOnly = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isTicketSalesActive = (ticket: TicketType) => {
    const now = new Date();
    const startDate = new Date(ticket.salesStartDate);
    const endDate = new Date(ticket.salesEndDate);
    return now >= startDate && now <= endDate;
  };

  const handleRegister = (event: EventData, ticket?: TicketType) => {
    // TODO: Implement event registration logic
    if (ticket) {
      toast.success(`Registration for "${event.event_name}" - ${ticket.name} coming soon!`);
    } else {
      toast.success(`Registration for "${event.event_name}" coming soon!`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Available</h3>
        <p className="text-gray-500">This practitioner hasn&apos;t scheduled any events yet. Check back later!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-orange-500 mb-4">Events & Webinars</h3>
        <p className="text-gray-600">Upcoming events hosted by this practitioner</p>
      </div>

      <div className="space-y-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            {/* Event Image */}
            {event.event_image && (
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={event.event_image}
                  alt={event.event_name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
            )}

            {/* Event Content */}
            <div className="p-4 md:p-6">
              <div className="mb-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                      {event.event_name}
                    </h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {event.event_summary}
                    </p>
                  </div>

                  {event.status && (
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                        event.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : event.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {event.status}
                    </span>
                  )}
                </div>

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Date and Time */}
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Date & Time</p>
                      <p className="text-sm text-gray-700">{formatDateOnly(event.event_start_datetime)}</p>
                      <p className="text-sm text-gray-600">
                        {formatTimeOnly(event.event_start_datetime)} - {formatTimeOnly(event.event_end_datetime)}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Location</p>
                      {event.hide_address ? (
                        <p className="text-sm text-gray-600 italic">
                          Address will be shared upon registration
                        </p>
                      ) : (
                        <p className="text-sm text-gray-700">{event.address}</p>
                      )}
                    </div>
                  </div>

                  {/* Ticketing Info */}
                  {event.enable_ticketing && (
                    <div className="flex items-start gap-3">
                      <Ticket className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">Ticketing</p>
                        <p className="text-sm text-gray-700">Available through Kaizen</p>
                        {event.non_refundable && (
                          <p className="text-xs text-red-600 font-medium mt-1">Non-refundable</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Event Description */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">About This Event</h4>
                  <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                    {event.event_description}
                  </p>
                </div>

                {/* What to Bring */}
                {event.what_to_bring && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">What to Bring</h4>
                    <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
                      {event.what_to_bring}
                    </p>
                  </div>
                )}

                {/* Ticket Types Section */}
                {event.enable_ticketing && (
                  <div className="mb-6 border-t pt-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-orange-500" />
                      Ticket Options
                    </h4>

                    {loadingTickets[event.id] ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      </div>
                    ) : event.ticketTypes && event.ticketTypes.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {event.ticketTypes.map((ticket) => (
                          <div
                            key={ticket.id}
                            className={`border rounded-lg p-4 ${
                              ticket.markedAsSoldOut
                                ? 'bg-gray-50 border-gray-300'
                                : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-md transition-all'
                            }`}
                          >
                            {/* Ticket Header */}
                            <div className="mb-3">
                              <div className="flex items-start justify-between mb-1">
                                <h5 className="font-semibold text-gray-900">{ticket.name}</h5>
                                {ticket.markedAsSoldOut && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                                    Sold Out
                                  </span>
                                )}
                              </div>
                              {ticket.description && (
                                <p className="text-xs text-gray-600 mt-1">{ticket.description}</p>
                              )}
                            </div>

                            {/* Price */}
                            <div className="mb-3">
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-orange-600">
                                  ${ticket.price.toFixed(2)}
                                </span>
                                {ticket.suggestedPricing && (
                                  <span className="text-xs text-gray-500">(suggested)</span>
                                )}
                              </div>
                            </div>

                            {/* Ticket Details */}
                            <div className="space-y-2 mb-3 text-xs text-gray-600">
                              <div className="flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                <span>{ticket.quantity} tickets available</span>
                              </div>
                              {ticket.requiresApproval && (
                                <div className="flex items-center gap-2 text-blue-600">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>Requires approval</span>
                                </div>
                              )}
                              {isTicketSalesActive(ticket) && !ticket.markedAsSoldOut && (
                                <div className="flex items-center gap-2 text-green-600">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Sales active now</span>
                                </div>
                              )}
                            </div>

                            {/* Sales Dates */}
                            <div className="text-xs text-gray-500 mb-3 pt-2 border-t">
                              <p>Sales: {formatDateOnly(ticket.salesStartDate)}</p>
                              <p>Ends: {formatDateOnly(ticket.salesEndDate)}</p>
                            </div>

                            {/* Select Button */}
                            <button
                              onClick={() => handleRegister(event, ticket)}
                              disabled={ticket.markedAsSoldOut || !isTicketSalesActive(ticket)}
                              className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition ${
                                ticket.markedAsSoldOut || !isTicketSalesActive(ticket)
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-orange-500 text-white hover:bg-orange-600'
                              }`}
                            >
                              {ticket.markedAsSoldOut
                                ? 'Sold Out'
                                : !isTicketSalesActive(ticket)
                                ? 'Not Available'
                                : 'Select Ticket'}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <p className="text-gray-600">Ticket information coming soon</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Register Button (for events without ticketing) */}
                {!event.enable_ticketing && (
                  <div className="flex justify-center gap-3 pt-4 border-t">
                    <button
                      onClick={() => handleRegister(event)}
                      className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2"
                    >
                      YES! I WANT TO REGISTER
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
