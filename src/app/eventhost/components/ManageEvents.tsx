import { CalendarIcon, MapPinIcon, ClockIcon, TicketIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';

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

interface ManageEventsProps {
  events: EventData[];
  setActiveTab: (tab: string) => void;
  onEditEvent: (event: EventData) => void;
  onEventDeleted: () => void;
  hostId: string;
}

export default function ManageEvents({ events, setActiveTab, onEditEvent, onEventDeleted, hostId }: ManageEventsProps) {
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventData | null>(null);
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

  const handleDeleteClick = (event: EventData) => {
    setEventToDelete(event);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    setDeletingEventId(eventToDelete.id);
    try {
      const response = await fetch(
        `/api/events/delete?event_id=${eventToDelete.id}&host_id=${hostId}`,
        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete event');
      }

      toast.success('Event deleted successfully!');
      setShowDeleteConfirm(false);
      setEventToDelete(null);
      onEventDeleted();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete event');
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setEventToDelete(null);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
        <p className="text-gray-600 mt-1">View and manage your events</p>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events yet</h3>
          <p className="text-gray-500 mb-6">Get started by creating your first event.</p>
          <button
            onClick={() => setActiveTab('Create an Event')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            Create Your First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
              {/* Event Image */}
              {event.event_image && (
                <div className="relative h-48 w-full bg-gray-200 flex-shrink-0">
                  <Image
                    src={event.event_image}
                    alt={event.event_name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="p-6 flex flex-col flex-1">
                {/* Header with Status */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex-1">{event.event_name}</h3>
                  <span
                    className={`ml-2 px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                      event.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : event.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800'
                        : event.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {event.status}
                  </span>
                </div>

                {/* Event Summary */}
                <p className="text-gray-700 mb-3 font-medium">{event.event_summary}</p>

                {/* Event Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.event_description}</p>

                {/* Location */}
                <div className="flex items-start mb-3">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="text-gray-900">{event.address || 'No address specified'}</div>
                    {event.hide_address && (
                      <div className="flex items-center text-gray-500 mt-1">
                        <EyeSlashIcon className="h-4 w-4 mr-1" />
                        <span>Address hidden from public</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* What to Bring */}
                {event.what_to_bring && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-3">
                    <div className="text-xs font-semibold text-blue-900 mb-1">What to Bring:</div>
                    <div className="text-sm text-blue-800">{event.what_to_bring}</div>
                  </div>
                )}

                {/* Ticketing Info */}
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  {event.enable_ticketing && (
                    <div className="flex items-center text-sm text-gray-600">
                      <TicketIcon className="h-4 w-4 mr-1.5 text-primary" />
                      <span>Ticketing Enabled</span>
                    </div>
                  )}
                  {event.non_refundable && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium">
                      Non-Refundable
                    </span>
                  )}
                </div>

                {/* Spacer to push content to bottom */}
                <div className="flex-1"></div>

                {/* Date & Time - Moved to bottom */}
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-start">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <div className="text-gray-900 font-medium">
                        {formatDateTime(event.event_start_datetime)}
                      </div>
                      <div className="text-gray-500">
                        to {formatDateTime(event.event_end_datetime)}
                      </div>
                    </div>
                  </div>
                  {/* Created Date */}
                  <div className="text-xs text-gray-500 mt-2">
                    Created on {new Date(event.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                {/* Actions - Moved to bottom */}
                <div className="flex gap-3">
                  <button
                    onClick={() => onEditEvent(event)}
                    disabled={deletingEventId === event.id}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Edit Event
                  </button>
                  <button
                    onClick={() => handleDeleteClick(event)}
                    disabled={deletingEventId === event.id}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingEventId === event.id ? 'Deleting...' : 'Delete Event'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && eventToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Event?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;<strong>{eventToDelete.event_name}</strong>&quot;? This action cannot be undone and will permanently remove the event and all associated ticket types.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={!!deletingEventId}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={!!deletingEventId}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingEventId ? 'Deleting...' : 'Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
