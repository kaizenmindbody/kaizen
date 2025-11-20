import { useState, useEffect } from 'react';
import { AboutUsItem, UseAboutUsReturn } from '@/types/content';

export function useAboutUs(): UseAboutUsReturn {
  const [aboutUsItems, setAboutUsItems] = useState<AboutUsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAboutUs() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/about-us');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        setAboutUsItems(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch about us data');
      } finally {
        setLoading(false);
      }
    }

    fetchAboutUs();
  }, []);

  return { aboutUsItems, loading, error };
}