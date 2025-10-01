"use client";

import Breadcrumb from "@/components/commons/breadcrumb";
import { useEvents } from "@/hooks/useEvents";
import Image from "next/image";
import { Calendar, MapPin, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";

const EventsPage = () => {
  const { events, loading, error } = useEvents();
  const router = useRouter();

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
                    onClick={() => router.push(`/events/${event.id}`)}
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer"
                  >
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
                          {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
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