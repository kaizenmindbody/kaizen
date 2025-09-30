import { Clinic } from '@/types/clinic';
import { useState, useEffect } from 'react';
import { UseClinicsReturn } from '@/types/content';

export function useClinics(): UseClinicsReturn {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClinics() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/clinics');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        setClinics(result.data || []);
      } catch (err) {
        console.error('Error fetching clinics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch clinics');
      } finally {
        setLoading(false);
      }
    }

    fetchClinics();
  }, []);

  return { clinics, loading, error };
}