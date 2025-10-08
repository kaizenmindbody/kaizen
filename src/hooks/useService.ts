import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchServices as fetchServicesAction,
  addService as addServiceAction,
  updateService as updateServiceAction,
  deleteService as deleteServiceAction,
} from '@/store/slices/servicesSlice';

export interface Service {
  id: string;
  title: string;
  type: 'real' | 'virtual';
  created_at?: string;
  updated_at?: string;
}

export interface UseServiceReturn {
  services: Service[];
  loading: boolean;
  error: string | null;
  fetchServices: () => Promise<void>;
  addService: (title: string, type: 'real' | 'virtual') => Promise<boolean>;
  updateService: (id: string, title: string, type: 'real' | 'virtual') => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;
}

export function useService(): UseServiceReturn {
  const dispatch = useAppDispatch();
  const { services, loading, error, initialized } = useAppSelector((state) => state.services);

  const fetchServices = useCallback(async () => {
    await dispatch(fetchServicesAction());
  }, [dispatch]);

  const addService = useCallback(async (title: string, type: 'real' | 'virtual'): Promise<boolean> => {
    const result = await dispatch(addServiceAction({ title, type }));
    return result.meta.requestStatus === 'fulfilled';
  }, [dispatch]);

  const updateService = useCallback(async (id: string, title: string, type: 'real' | 'virtual'): Promise<boolean> => {
    const result = await dispatch(updateServiceAction({ id, title, type }));
    return result.meta.requestStatus === 'fulfilled';
  }, [dispatch]);

  const deleteService = useCallback(async (id: string): Promise<boolean> => {
    const result = await dispatch(deleteServiceAction(id));
    return result.meta.requestStatus === 'fulfilled';
  }, [dispatch]);

  // Auto-fetch services on mount only if not already initialized
  useEffect(() => {
    if (!initialized) {
      fetchServices();
    }
  }, [initialized, fetchServices]);

  return {
    services,
    loading,
    error,
    fetchServices,
    addService,
    updateService,
    deleteService,
  };
}
