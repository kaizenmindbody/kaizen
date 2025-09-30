import { useState, useEffect, useCallback } from 'react';
import { Specialty, UseSpecialtyReturn } from '@/types/user';

export function useSpecialty(): UseSpecialtyReturn {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecialties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        setError('Cannot fetch specialties on server side');
        return;
      }

      const response = await fetch('/api/specialty');

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setSpecialties(result.data || []);
    } catch (err) {
      console.error('Error fetching specialties:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch specialties';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const addSpecialty = useCallback(async (title: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/specialty', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Refresh the specialties list
      await fetchSpecialties();
      return true;
    } catch (err) {
      console.error('Error adding specialty:', err);
      setError(err instanceof Error ? err.message : 'Failed to add specialty');
      return false;
    }
  }, [fetchSpecialties]);

  const updateSpecialty = useCallback(async (id: string, title: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/specialty', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, title: title.trim() }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Refresh the specialties list
      await fetchSpecialties();
      return true;
    } catch (err) {
      console.error('Error updating specialty:', err);
      setError(err instanceof Error ? err.message : 'Failed to update specialty');
      return false;
    }
  }, [fetchSpecialties]);

  const deleteSpecialty = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/specialty', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      // Refresh the specialties list
      await fetchSpecialties();
      return true;
    } catch (err) {
      console.error('Error deleting specialty:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete specialty');
      return false;
    }
  }, [fetchSpecialties]);

  const refreshSpecialties = useCallback(async () => {
    await fetchSpecialties();
  }, [fetchSpecialties]);

  useEffect(() => {
    fetchSpecialties();
  }, [fetchSpecialties]);

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