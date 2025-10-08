import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchPractitionerTypes as fetchPractitionerTypesAction,
  addPractitionerType as addPractitionerTypeAction,
  updatePractitionerType as updatePractitionerTypeAction,
  deletePractitionerType as deletePractitionerTypeAction,
  PractitionerType,
} from '@/store/slices/practitionerTypesSlice';

export interface UsePractitionerTypesReturn {
  practitionerTypes: PractitionerType[];
  loading: boolean;
  error: string | null;
  fetchPractitionerTypes: () => Promise<void>;
  addPractitionerType: (title: string) => Promise<boolean>;
  updatePractitionerType: (id: string, title: string) => Promise<boolean>;
  deletePractitionerType: (id: string) => Promise<boolean>;
}

export function usePractitionerTypes(): UsePractitionerTypesReturn {
  const dispatch = useAppDispatch();
  const { practitionerTypes, loading, error, initialized } = useAppSelector((state) => state.practitionerTypes);

  const fetchPractitionerTypes = useCallback(async () => {
    await dispatch(fetchPractitionerTypesAction());
  }, [dispatch]);

  const addPractitionerType = useCallback(async (title: string): Promise<boolean> => {
    const result = await dispatch(addPractitionerTypeAction(title));
    return result.meta.requestStatus === 'fulfilled';
  }, [dispatch]);

  const updatePractitionerType = useCallback(async (id: string, title: string): Promise<boolean> => {
    const result = await dispatch(updatePractitionerTypeAction({ id, title }));
    return result.meta.requestStatus === 'fulfilled';
  }, [dispatch]);

  const deletePractitionerType = useCallback(async (id: string): Promise<boolean> => {
    const result = await dispatch(deletePractitionerTypeAction(id));
    return result.meta.requestStatus === 'fulfilled';
  }, [dispatch]);

  // Auto-fetch practitioner types on mount only if not already initialized
  useEffect(() => {
    if (!initialized) {
      fetchPractitionerTypes();
    }
  }, [initialized, fetchPractitionerTypes]);

  return {
    practitionerTypes,
    loading,
    error,
    fetchPractitionerTypes,
    addPractitionerType,
    updatePractitionerType,
    deletePractitionerType,
  };
}
