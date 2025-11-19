"use client";

import { useParams, useRouter } from "next/navigation";
import { useEvents } from "@/hooks/useEvents";
import Image from "next/image";
import { Calendar, MapPin, DollarSign, ArrowLeft, User, Share2, Heart } from "lucide-react";
import Breadcrumb from "@/components/commons/breadcrumb";
import { useEffect, useState } from "react";

interface TicketType {
  id: string;
  price: number;
  is_active?: boolean;
}

const EventDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { events, loading, error } = useEvents();
  const eventId = parseInt(params.id as string);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

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
        console.error(`Error fetching tickets for event ${eventId}:`, error);
        setTicketTypes([]);
      } finally {
        setLoadingTickets(false);
      }
    };

    fetchTicketTypes();
  }, [eventId]);

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
                {event.author && (
                  <div className="bg-gray-100 px-4 py-3 rounded-lg mt-4">
                    <p className="text-gray-700 text-xl font-medium">Hosted by {event.author}</p>
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
              {event.author && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About Your Host</h2>
                  <div className="space-y-4">
                    {/* Host Image */}
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-200">
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    </div>
                    {/* Host Name and Description */}
                    <div>
                      <p className="text-gray-600 leading-relaxed">
                        Host description will be displayed here. This section can include information about the host&apos;s background, expertise, and experience.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default EventDetailPage;
