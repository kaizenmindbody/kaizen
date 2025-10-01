import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchDegrees as fetchDegreesAction,
  addDegree as addDegreeAction,
  updateDegree as updateDegreeAction,
  deleteDegree as deleteDegreeAction
} from '@/store/slices/degreesSlice';
import { UseDegreeReturn } from '@/types/user';

export function useDegrees(): UseDegreeReturn {
  const dispatch = useAppDispatch();
  const { degrees, loading, error, initialized } = useAppSelector((state) => state.degrees);

  useEffect(() => {
    // Only fetch if data has never been loaded before
    if (!initialized) {
      dispatch(fetchDegreesAction());
    }
  }, [initialized, dispatch]);

  const addDegree = useCallback(async (title: string): Promise<boolean> => {
    const result = await dispatch(addDegreeAction(title));
    return addDegreeAction.fulfilled.match(result);
  }, [dispatch]);

  const updateDegree = useCallback(async (id: string, title: string): Promise<boolean> => {
    const result = await dispatch(updateDegreeAction({ id, title }));
    return updateDegreeAction.fulfilled.match(result);
  }, [dispatch]);

  const deleteDegree = useCallback(async (id: string): Promise<boolean> => {
    const result = await dispatch(deleteDegreeAction(id));
    return deleteDegreeAction.fulfilled.match(result);
  }, [dispatch]);

  const refreshDegrees = useCallback(async () => {
    await dispatch(fetchDegreesAction());
  }, [dispatch]);

  return {
    degrees,
    loading,
    error,
    addDegree,
    updateDegree,
    deleteDegree,
    refreshDegrees
  };
}
