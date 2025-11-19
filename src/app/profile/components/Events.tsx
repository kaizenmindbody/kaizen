"use client";

import { ProfileData } from '@/types/user';
import { useState, useEffect, useCallback } from 'react';
import CreateEvent from '@/app/eventhost/components/CreateEvent';
import ManageEvents from '@/app/eventhost/components/ManageEvents';

interface EventsProps {
  profile: ProfileData | null;
  activeSubTab: string;
  onNavigate: (tab: string) => void;
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

const Events: React.FC<EventsProps> = ({ profile, activeSubTab, onNavigate }) => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);

  // Fetch events for this practitioner
  const fetchEvents = useCallback(async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/events/host/${profile.id}`);
      const result = await response.json();

      if (response.ok && result.success) {
        setEvents(result.events || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleEditEvent = (event: EventData) => {
    setEditingEvent(event);
    // Navigate to Create Event submenu
    onNavigate('Create Event');
  };

  const handleEventUpdated = () => {
    fetchEvents();
    setEditingEvent(null);
    // Navigate back to Manage Events
    onNavigate('Manage Events');
  };

  const handleEventDeleted = () => {
    fetchEvents();
  };

  const handleNavigateToCreateEvent = (tabName?: string) => {
    // Clear editing state when creating a new event
    if (tabName === 'Create an Event') {
      setEditingEvent(null);
    }
    onNavigate('Create Event');
  };

  const handleNavigateToManageEvents = (tabName?: string) => {
    onNavigate('Manage Events');
  };

  return (
    <div className="space-y-6">
      {activeSubTab === 'Create Event' && (
        <CreateEvent
          setActiveTab={handleNavigateToManageEvents}
          editingEvent={editingEvent}
          onEventUpdated={handleEventUpdated}
        />
      )}

      {activeSubTab === 'Manage Events' && (
        <ManageEvents
          events={events}
          setActiveTab={handleNavigateToCreateEvent}
          onEditEvent={handleEditEvent}
          onEventDeleted={handleEventDeleted}
          hostId={profile?.id || ''}
        />
      )}
    </div>
  );
};

export default Events;
