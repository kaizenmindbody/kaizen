import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchFaqs as fetchFaqsAction,
  addFaq as addFaqAction,
  updateFaq as updateFaqAction,
  deleteFaq as deleteFaqAction
} from '@/store/slices/faqsSlice';
import { UseFaqReturn } from '@/types/content';
import { FAQ } from '@/types/faq';

export function useFaq(): UseFaqReturn {
  const dispatch = useAppDispatch();
  const { faqs, loading, error, initialized } = useAppSelector((state) => state.faqs);

  useEffect(() => {
    // Only fetch if data has never been loaded before
    if (!initialized) {
      dispatch(fetchFaqsAction());
    }
  }, [initialized, dispatch]);

  const addFaq = useCallback(async (faqData: Partial<FAQ>): Promise<boolean> => {
    const result = await dispatch(addFaqAction(faqData));
    return addFaqAction.fulfilled.match(result);
  }, [dispatch]);

  const updateFaq = useCallback(async (id: number, faqData: Partial<FAQ>): Promise<boolean> => {
    const result = await dispatch(updateFaqAction({ id, faqData }));
    return updateFaqAction.fulfilled.match(result);
  }, [dispatch]);

  const deleteFaq = useCallback(async (id: number): Promise<boolean> => {
    const result = await dispatch(deleteFaqAction(id));
    return deleteFaqAction.fulfilled.match(result);
  }, [dispatch]);

  const refreshFaqs = useCallback(async () => {
    await dispatch(fetchFaqsAction());
  }, [dispatch]);

  return {
    faqs,
    loading,
    error,
    addFaq,
    updateFaq,
    deleteFaq,
    refreshFaqs
  };
}