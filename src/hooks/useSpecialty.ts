import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchSpecialties as fetchSpecialtiesAction,
  addSpecialty as addSpecialtyAction,
  updateSpecialty as updateSpecialtyAction,
  deleteSpecialty as deleteSpecialtyAction
} from '@/store/slices/specialtiesSlice';
import { UseSpecialtyReturn } from '@/types/user';

export function useSpecialty(): UseSpecialtyReturn {
  const dispatch = useAppDispatch();
  const { specialties, loading, error, initialized } = useAppSelector((state) => state.specialties);

  useEffect(() => {
    // Only fetch if data has never been loaded before
    if (!initialized) {
      dispatch(fetchSpecialtiesAction());
    }
  }, [initialized, dispatch]);

  const addSpecialty = useCallback(async (title: string): Promise<boolean> => {
    const result = await dispatch(addSpecialtyAction(title));
    return addSpecialtyAction.fulfilled.match(result);
  }, [dispatch]);

  const updateSpecialty = useCallback(async (id: string, title: string): Promise<boolean> => {
    const result = await dispatch(updateSpecialtyAction({ id, title }));
    return updateSpecialtyAction.fulfilled.match(result);
  }, [dispatch]);

  const deleteSpecialty = useCallback(async (id: string): Promise<boolean> => {
    const result = await dispatch(deleteSpecialtyAction(id));
    return deleteSpecialtyAction.fulfilled.match(result);
  }, [dispatch]);

  const refreshSpecialties = useCallback(async () => {
    await dispatch(fetchSpecialtiesAction());
  }, [dispatch]);

  return {
    specialties,
    loading,
    error,
    addSpecialty,
    updateSpecialty,
    deleteSpecialty,
    refreshSpecialties
  };
}