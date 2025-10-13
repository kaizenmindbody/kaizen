import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchServicePricing as fetchServicePricingAction,
  saveServicePricing as saveServicePricingAction,
  clearError,
  clearSuccessMessage,
  setServicePricings,
  setPackagePricings,
  ServicePricing,
  PackagePricing,
} from '@/store/slices/servicePricingSlice';
import { supabase } from '@/lib/supabase';

export interface UseServicePricingReturn {
  servicePricings: ServicePricing[];
  packagePricings: PackagePricing[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  fetchServicePricing: (practitionerId: string, isClinicSpecific?: boolean) => Promise<void>;
  saveServicePricing: (
    practitionerId: string,
    servicePricings: ServicePricing[],
    packagePricings: PackagePricing[],
    isClinicSpecific?: boolean
  ) => Promise<boolean>;
  updateServicePricings: (servicePricings: ServicePricing[]) => void;
  updatePackagePricings: (packagePricings: PackagePricing[]) => void;
  clearError: () => void;
  clearSuccessMessage: () => void;
}

export function useServicePricing(practitionerId?: string, isClinicSpecific: boolean = false): UseServicePricingReturn {
  const dispatch = useAppDispatch();
  const {
    servicePricings,
    packagePricings,
    loading,
    saving,
    error,
    successMessage,
    initialized,
  } = useAppSelector((state) => state.servicePricing);

  const fetchServicePricing = useCallback(async (practitionerId: string, isClinicSpecific: boolean = false) => {
    await dispatch(fetchServicePricingAction({ practitionerId, isClinicSpecific }));
  }, [dispatch]);

  const saveServicePricingHandler = useCallback(
    async (
      practitionerId: string,
      servicePricings: ServicePricing[],
      packagePricings: PackagePricing[],
      isClinicSpecific: boolean = false
    ): Promise<boolean> => {
      try {
        // Get the session token
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          throw new Error('Not authenticated. Please sign in again.');
        }

        const result = await dispatch(
          saveServicePricingAction({
            practitionerId,
            servicePricings,
            packagePricings,
            token,
            isClinicSpecific,
          })
        );

        if (result.meta.requestStatus === 'fulfilled') {
          // Reload data after successful save
          await dispatch(fetchServicePricingAction({ practitionerId, isClinicSpecific }));
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error in saveServicePricing:', error);
        return false;
      }
    },
    [dispatch]
  );

  const updateServicePricings = useCallback(
    (servicePricings: ServicePricing[]) => {
      dispatch(setServicePricings(servicePricings));
    },
    [dispatch]
  );

  const updatePackagePricings = useCallback(
    (packagePricings: PackagePricing[]) => {
      dispatch(setPackagePricings(packagePricings));
    },
    [dispatch]
  );

  const clearErrorHandler = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const clearSuccessMessageHandler = useCallback(() => {
    dispatch(clearSuccessMessage());
  }, [dispatch]);

  // Auto-fetch service pricing on mount if practitionerId is provided
  useEffect(() => {
    if (practitionerId && !initialized) {
      fetchServicePricing(practitionerId, isClinicSpecific);
    }
  }, [practitionerId, isClinicSpecific, initialized, fetchServicePricing]);

  return {
    servicePricings,
    packagePricings,
    loading,
    saving,
    error,
    successMessage,
    fetchServicePricing,
    saveServicePricing: saveServicePricingHandler,
    updateServicePricings,
    updatePackagePricings,
    clearError: clearErrorHandler,
    clearSuccessMessage: clearSuccessMessageHandler,
  };
}
