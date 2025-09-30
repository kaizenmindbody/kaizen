import { FAQ } from '@/types/faq';
import { useState, useEffect } from 'react';
import { UseFaqReturn } from '@/types/content';

export function useFaq(): UseFaqReturn {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFaqs() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/faq');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        setFaqs(result.data || []);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch FAQs');
      } finally {
        setLoading(false);
      }
    }

    fetchFaqs();
  }, []);

  return { faqs, loading, error };
}