import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchClinics as fetchClinicsAction,
  addClinic as addClinicAction,
  updateClinic as updateClinicAction,
  deleteClinic as deleteClinicAction
} from '@/store/slices/clinicsSlice';
import { Clinic } from '@/types/clinic';
import { UseClinicsReturn } from '@/types/content';

export function useClinics(): UseClinicsReturn {
  const dispatch = useAppDispatch();
  const { clinics, loading, error, initialized } = useAppSelector((state) => state.clinics);

  useEffect(() => {
    // Only fetch if data has never been loaded before
    if (!initialized) {
      dispatch(fetchClinicsAction());
    }
  }, [initialized, dispatch]);

  const addClinic = useCallback(async (clinicData: Partial<Clinic>): Promise<boolean> => {
    const result = await dispatch(addClinicAction(clinicData));
    return addClinicAction.fulfilled.match(result);
  }, [dispatch]);

  const updateClinic = useCallback(async (id: number, clinicData: Partial<Clinic>): Promise<boolean> => {
    const result = await dispatch(updateClinicAction({ id, clinicData }));
    return updateClinicAction.fulfilled.match(result);
  }, [dispatch]);

  const deleteClinic = useCallback(async (id: number): Promise<boolean> => {
    const result = await dispatch(deleteClinicAction(id));
    return deleteClinicAction.fulfilled.match(result);
  }, [dispatch]);

  const refreshClinics = useCallback(async () => {
    await dispatch(fetchClinicsAction());
  }, [dispatch]);

  return {
    clinics,
    loading,
    error,
    addClinic,
    updateClinic,
    deleteClinic,
    refreshClinics
  };
}
