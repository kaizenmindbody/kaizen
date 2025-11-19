"use client";

import Breadcrumb from "@/components/commons/breadcrumb";
import { useEvents } from "@/hooks/useEvents";
import Image from "next/image";
import { Calendar, MapPin, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface TicketType {
  id: string;
  price: number;
  is_active?: boolean;
}

const EventsPage = () => {
  const { events, loading, error } = useEvents();
  const router = useRouter();
  const [ticketTypesMap, setTicketTypesMap] = useState<Record<number, TicketType[]>>({});
  const [loadingTickets, setLoadingTickets] = useState<Record<number, boolean>>({});
  const [navigatingEventId, setNavigatingEventId] = useState<number | null>(null);

  // Fetch ticket types for all events
  useEffect(() => {
    if (events.length === 0) return;

    const fetchTicketTypes = async () => {
      const ticketPromises = events.map(async (event) => {
        setLoadingTickets(prev => ({ ...prev, [event.id]: true }));
        try {
          const response = await fetch(`/api/events/${event.id}/tickets`);
          const result = await response.json();
          
          if (result.success && result.tickets) {
            return { eventId: event.id, tickets: result.tickets };
          }
          return { eventId: event.id, tickets: [] };
        } catch (error) {
          console.error(`Error fetching tickets for event ${event.id}:`, error);
          return { eventId: event.id, tickets: [] };
        } finally {
          setLoadingTickets(prev => ({ ...prev, [event.id]: false }));
        }
      });

      const results = await Promise.all(ticketPromises);
      const newMap: Record<number, TicketType[]> = {};
      
      results.forEach(({ eventId, tickets }) => {
        newMap[eventId] = tickets.map((ticket: any) => ({
          id: ticket.id,
          price: parseFloat(ticket.price) || 0,
          is_active: ticket.is_active !== false && !ticket.markedAsSoldOut
        }));
      });

      setTicketTypesMap(newMap);
    };

    fetchTicketTypes();
  }, [events]);

  // Get minimum price from ticket types for an event
  const getEventPrice = (eventId: number): { price: number; hasMultiplePrices: boolean } => {
    const tickets = ticketTypesMap[eventId] || [];
    
    if (tickets.length === 0) {
      return { price: 0, hasMultiplePrices: false };
    }

    // Filter active tickets only
    const activeTickets = tickets.filter(t => t.is_active !== false);
    
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

  return (
    <>
      <Breadcrumb
        pageName="Upcoming Events"
      />

      <section className="font-sans pb-[60px] sm:pb-[120px] pt-[40px] sm:pt-[80px]">
        <div className="container">

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-800">Error loading events: {error}</p>
            </div>
          )}

          {/* Events Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-body-color text-lg">No events available at the moment.</p>
                </div>
              ) : (
                events.map((event) => (
                  <article
                    key={event.id}
                    onClick={() => {
                      if (navigatingEventId) return; // Prevent multiple clicks
                      
                      setNavigatingEventId(event.id);
                      router.push(`/events/${event.id}`);
                      // State will reset automatically when component unmounts on navigation
                    }}
                    className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer relative ${
                      navigatingEventId === event.id ? 'opacity-75 pointer-events-none' : ''
                    }`}
                  >
                    {/* Loading Overlay */}
                    {navigatingEventId === event.id && (
                      <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 z-10 flex items-center justify-center rounded-2xl">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Loading...</span>
                        </div>
                      </div>
                    )}
                    {/* Event Image */}
                    <div className="relative w-full h-56 bg-gray-200">
                      {event.image ? (
                        <Image
                          src={event.image}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                          <Calendar className="w-16 h-16 text-secondary/30" />
                        </div>
                      )}
                    </div>

                    {/* Event Content */}
                    <div className="p-6">
                      {/* Date, Location, and Category in one line */}
                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-3 flex-wrap">
                        {/* Date */}
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1 text-secondary" />
                          <span>{formatDate(event.created_at)}</span>
                        </div>

                        {/* Location */}
                        {event.location && (
                          <>
                            <span className="text-gray-300">|</span>
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1 text-secondary" />
                              <span className="line-clamp-1">{event.location}</span>
                            </div>
                          </>
                        )}

                        {/* Category */}
                        {event.category && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span className="text-secondary font-medium">{event.category}</span>
                          </>
                        )}
                      </div>

                      {/* Event Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                        {event.title}
                      </h3>

                      {/* Price */}
                      <div className="flex items-center text-lg font-semibold text-gray-900">
                        <DollarSign className="w-5 h-5 mr-1 text-secondary" />
                        <span>
                          {(() => {
                            const { price, hasMultiplePrices } = getEventPrice(event.id);
                            if (loadingTickets[event.id]) {
                              return 'Loading...';
                            }
                            if (price === 0) {
                              return 'Free';
                            }
                            return hasMultiplePrices ? `From $${price.toFixed(2)}` : `$${price.toFixed(2)}`;
                          })()}
                        </span>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default EventsPage;