import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchEvents as fetchEventsAction,
  addEvent as addEventAction,
  updateEvent as updateEventAction,
  deleteEvent as deleteEventAction
} from '@/store/slices/eventsSlice';
import { Event } from '@/types/event';

export interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  addEvent: (eventData: Partial<Event>) => Promise<boolean>;
  updateEvent: (id: number, eventData: Partial<Event>) => Promise<boolean>;
  deleteEvent: (id: number) => Promise<boolean>;
  refreshEvents: () => Promise<void>;
}

export function useEvents(): UseEventsReturn {
  const dispatch = useAppDispatch();
  const { events, loading, error, initialized } = useAppSelector((state) => state.events);

  useEffect(() => {
    // Only fetch if data has never been loaded before
    if (!initialized) {
      dispatch(fetchEventsAction());
    }
  }, [initialized, dispatch]);

  const addEvent = useCallback(async (eventData: Partial<Event>): Promise<boolean> => {
    const result = await dispatch(addEventAction(eventData));
    return addEventAction.fulfilled.match(result);
  }, [dispatch]);

  const updateEvent = useCallback(async (id: number, eventData: Partial<Event>): Promise<boolean> => {
    const result = await dispatch(updateEventAction({ id, eventData }));
    return updateEventAction.fulfilled.match(result);
  }, [dispatch]);

  const deleteEvent = useCallback(async (id: number): Promise<boolean> => {
    const result = await dispatch(deleteEventAction(id));
    return deleteEventAction.fulfilled.match(result);
  }, [dispatch]);

  const refreshEvents = useCallback(async () => {
    await dispatch(fetchEventsAction());
  }, [dispatch]);

  return {
    events,
    loading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    refreshEvents
  };
}
