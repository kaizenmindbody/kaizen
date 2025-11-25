"use client";

import { useParams, useRouter } from "next/navigation";
import { useEvents } from "@/hooks/useEvents";
import Image from "next/image";
import { Calendar, MapPin, DollarSign, ArrowLeft, User, Share2, Heart, Phone, Mail } from "lucide-react";
import Breadcrumb from "@/components/commons/breadcrumb";
import { useEffect, useState } from "react";

interface TicketType {
  id: string;
  price: number;
  is_active?: boolean;
}

interface EventHost {
  id: string;
  firstname: string;
  lastname: string;
  avatar: string;
  bio: string;
  email: string;
  phone: string;
}

interface HostEvent {
  id: number;
  event_name: string;
  event_image: string;
  address: string;
  event_start_datetime: string;
}

const EventDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { events, loading, error } = useEvents();
  const eventId = parseInt(params.id as string);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [eventHost, setEventHost] = useState<EventHost | null>(null);
  const [loadingHost, setLoadingHost] = useState(false);
  const [hostEvents, setHostEvents] = useState<HostEvent[]>([]);
  const [loadingHostEvents, setLoadingHostEvents] = useState(false);

  // Find the event by ID
  const event = events.find(e => e.id === eventId);

  // Fetch ticket types for this event
  useEffect(() => {
    if (!eventId) return;

    const fetchTicketTypes = async () => {
      setLoadingTickets(true);
      try {
        const response = await fetch(`/api/events/${eventId}/tickets`);
        const result = await response.json();

        if (result.success && result.tickets) {
          setTicketTypes(
            result.tickets.map((ticket: any) => ({
              id: ticket.id,
              price: parseFloat(ticket.price) || 0,
              is_active: ticket.is_active !== false && !ticket.markedAsSoldOut
            }))
          );
        } else {
          setTicketTypes([]);
        }
      } catch (error) {
        setTicketTypes([]);
      } finally {
        setLoadingTickets(false);
      }
    };

    fetchTicketTypes();
  }, [eventId]);

  // Fetch event host information
  useEffect(() => {
    if (!event || !(event as any).host_id) return;

    const fetchEventHost = async () => {
      setLoadingHost(true);
      try {
        const { supabase } = await import('@/lib/supabase');

        // Fetch host user data
        const { data: hostData, error: hostError } = await supabase
          .from('Users')
          .select('id, firstname, lastname, avatar, email, phone, website, title, degree')
          .eq('id', (event as any).host_id)
          .single();

        if (hostError || !hostData) {
          console.error('Error fetching host:', hostError);
          setEventHost(null);
          return;
        }

        // Fetch host profile from EventHosts table
        const { data: hostProfileData } = await supabase
          .from('EventHosts')
          .select('bio, avatar')
          .eq('user_id', (event as any).host_id)
          .single();

        setEventHost({
          id: hostData.id,
          firstname: hostData.firstname || '',
          lastname: hostData.lastname || '',
          avatar: hostProfileData?.avatar || hostData.avatar || 'https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/avatars/default.jpg',
          bio: hostProfileData?.bio || '',
          email: hostData.email || '',
          phone: hostData.phone || ''
        });
      } catch (error) {
        console.error('Error fetching host:', error);
        setEventHost(null);
      } finally {
        setLoadingHost(false);
      }
    };

    fetchEventHost();
  }, [event]);

  // Fetch other events by this host
  useEffect(() => {
    if (!event) {
      console.log('No event data available yet');
      return;
    }

    const hostId = (event as any).host_id;

    console.log('Current event:', event);
    console.log('Host ID from event:', hostId);

    if (!hostId) {
      console.log('No host_id found on event - this event may not have a host assigned');
      return;
    }

    const fetchHostEvents = async () => {
      setLoadingHostEvents(true);
      try {
        const { supabase } = await import('@/lib/supabase');

        console.log('Fetching events for host_id:', hostId);

        const { data: eventsData, error: eventsError } = await supabase
          .from('Events')
          .select('id, event_name, event_image, address, event_start_datetime, host_id')
          .eq('host_id', hostId)
          .order('event_start_datetime', { ascending: false })
          .limit(10);

        if (eventsError) {
          console.error('Error fetching host events:', eventsError);
          setHostEvents([]);
          return;
        }

        console.log('Raw events data from database:', eventsData);

        // Filter out current event and limit to 3
        const filteredEvents = (eventsData || [])
          .filter((e: any) => {
            const isSameEvent = String(e.id) === String(eventId) || String(e.id) === String((event as any).id);
            console.log('Comparing:', e.id, 'vs', eventId, 'and', (event as any).id, 'Same?', isSameEvent);
            return !isSameEvent;
          })
          .slice(0, 3);

        console.log('Host events found:', filteredEvents.length, 'Total events by host:', eventsData?.length || 0);
        console.log('Filtered events:', filteredEvents);
        setHostEvents(filteredEvents);
      } catch (error) {
        console.error('Error fetching host events:', error);
        setHostEvents([]);
      } finally {
        setLoadingHostEvents(false);
      }
    };

    fetchHostEvents();
  }, [event, eventId]);

  // Get minimum price from ticket types for this event
  const getEventPrice = (): { price: number; hasMultiplePrices: boolean } => {
    if (ticketTypes.length === 0) {
      return { price: 0, hasMultiplePrices: false };
    }

    // Filter active tickets only
    const activeTickets = ticketTypes.filter(t => t.is_active !== false);
    
    if (activeTickets.length === 0) {
      return { price: 0, hasMultiplePrices: false };
    }

    const prices = activeTickets.map(t => t.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const hasMultiplePrices = minPrice !== maxPrice;

    return { price: minPrice, hasMultiplePrices };
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Breadcrumb pageName="Events" description="Events" />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Breadcrumb pageName="Event Details" />
        <section className="font-sans pb-[60px] sm:pb-[120px] pt-[40px] sm:pt-[80px]">
          <div className="container">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800">Error loading event: {error}</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Event not found
  if (!event) {
    return (
      <>
        <Breadcrumb pageName="Event Details" />
        <section className="font-sans pb-[60px] sm:pb-[120px] pt-[40px] sm:pt-[80px]">
          <div className="container">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
              <p className="text-gray-600 mb-6">The event you&apos;re looking for doesn&apos;t exist.</p>
              <button
                onClick={() => router.push('/events')}
                className="inline-flex items-center bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Events
              </button>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Events" description="Events" />

      <section className="font-sans pb-[60px] sm:pb-[120px] pt-[40px] sm:pt-[80px]">
        <div className="container">
          {/* Back Button */}
          <button
            onClick={() => router.push('/events')}
            className="inline-flex items-center text-gray-600 hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Events
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Image and Price */}
            <div className="lg:col-span-1 space-y-6">
              {/* Event Image */}
              <div className="relative w-full h-[400px] lg:h-[600px] bg-gray-200 rounded-2xl overflow-hidden">
                {event.image ? (
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                    <Calendar className="w-24 h-24 text-secondary/30" />
                  </div>
                )}
              </div>

              {/* Ticket Price Section */}
              <div className="space-y-4">
                {/* Ticket Price Label and Amount */}
                <div>
                  <p className="text-sm text-gray-500 mb-2">Ticket Price</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {(() => {
                      if (loadingTickets) {
                        return 'Loading...';
                      }
                      const { price, hasMultiplePrices } = getEventPrice();
                      if (price === 0) {
                        return 'Free';
                      }
                      return hasMultiplePrices ? `From $${price.toFixed(2)}` : `$${price.toFixed(2)}`;
                    })()}
                  </p>
                </div>

                {/* Buy Ticket Button and Icons in one line */}
                <div className="flex items-center gap-3">
                  <button className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                    Buy Ticket Now
                  </button>
                  <button className="flex items-center justify-center border border-gray-300 hover:border-secondary hover:bg-secondary/5 text-gray-700 p-3 rounded-lg transition-colors duration-200">
                    <Share2 className="w-5 h-5 text-secondary" />
                  </button>
                  <button className="flex items-center justify-center border border-gray-300 hover:border-secondary hover:bg-secondary/5 text-gray-700 p-3 rounded-lg transition-colors duration-200">
                    <Heart className="w-5 h-5 text-secondary" />
                  </button>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="lg:col-span-2 flex flex-col">
              {/* Event Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {event.title}
              </h1>

              {/* Event Meta Information */}
              <div className="space-y-4 mb-8">
                {/* Date */}
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-[1em] h-[1em]" />
                  <p className="font-semibold">{formatDate(event.created_at)}</p>
                </div>

                {/* Location */}
                {event.location && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-[1em] h-[1em]" />
                    <p className="font-semibold">{event.location}</p>
                  </div>
                )}

                {/* Hosted By */}
                {(eventHost || event.author) && (
                  <div className="bg-gray-100 px-4 py-3 rounded-lg mt-4">
                    <p className="text-gray-700 text-xl font-medium">
                      Hosted by {eventHost ? `${eventHost.firstname} ${eventHost.lastname}` : event.author}
                    </p>
                  </div>
                )}
              </div>

              {/* Event Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Description</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {/* What To Bring */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Essential Info + What To Bring (or Not Bring)</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>We will serve tea and a snack</li>
                  <li>Includes a gua sha tool for you to take home</li>
                  <li>Doors will open at 5:30pm</li>
                </ul>
              </div>

              {/* About Your Host */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About Your Host</h2>
                {loadingHost ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : eventHost ? (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Host Image */}
                      <div className="flex-shrink-0">
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-200">
                          <Image
                            src={eventHost.avatar}
                            alt={`${eventHost.firstname} ${eventHost.lastname}`}
                            fill
                            sizes="128px"
                            className="object-cover"
                          />
                        </div>
                      </div>

                      {/* Host Information */}
                      <div className="flex-1 space-y-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {eventHost.firstname} {eventHost.lastname}
                        </h3>

                        {eventHost.bio && (
                          <p className="text-gray-600 leading-relaxed">
                            {eventHost.bio}
                          </p>
                        )}

                        {/* Contact Info */}
                        <div className="flex flex-wrap gap-4 pt-2">
                          {eventHost.email && (
                            <a
                              href={`mailto:${eventHost.email}`}
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              <Mail className="w-4 h-4" />
                              {eventHost.email}
                            </a>
                          )}
                          {eventHost.phone && (
                            <a
                              href={`tel:${eventHost.phone}`}
                              className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-4 h-4" />
                              {eventHost.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <p className="text-gray-600">Host information not available.</p>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* More Events by This Host - Full Width Section Below Grid */}
          {eventHost && hostEvents.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                More Events by {eventHost.firstname} {eventHost.lastname}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostEvents.map((hostEvent) => (
                  <div
                    key={hostEvent.id}
                    onClick={() => router.push(`/events/${hostEvent.id}`)}
                    className="group cursor-pointer bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all"
                  >
                    {/* Event Image */}
                    <div className="relative w-full h-48 bg-gray-200">
                      {hostEvent.event_image ? (
                        <Image
                          src={hostEvent.event_image}
                          alt={hostEvent.event_name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                          <Calendar className="w-12 h-12 text-secondary/30" />
                        </div>
                      )}
                    </div>

                    {/* Event Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-2 group-hover:text-primary transition-colors mb-3">
                        {hostEvent.event_name}
                      </h3>
                      {hostEvent.event_start_datetime && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(hostEvent.event_start_datetime)}</span>
                        </div>
                      )}
                      {hostEvent.address && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{hostEvent.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default EventDetailPage;
