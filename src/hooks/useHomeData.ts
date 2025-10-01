import { useState, useEffect } from 'react';
import { Icon, User as HomepageUser, FAQItem, PersonEvent, FAQ as HomeFAQ } from '@/types/homepage';
import { UseHomeDataReturn } from '@/types/content';

export function useHomeData(): UseHomeDataReturn {
  // State for conditions
  const [conditions, setConditions] = useState<Icon[]>([]);
  const [conditionsLoading, setConditionsLoading] = useState(true);
  const [conditionsError, setConditionsError] = useState<string | null>(null);

  // State for modalities
  const [modalities, setModalities] = useState<Icon[]>([]);
  const [modalitiesLoading, setModalitiesLoading] = useState(true);
  const [modalitiesError, setModalitiesError] = useState<string | null>(null);

  // State for TCMs
  const [tcms, setTcms] = useState<HomepageUser[]>([]);
  const [tcmsLoading, setTcmsLoading] = useState(true);
  const [tcmsError, setTcmsError] = useState<string | null>(null);

  // State for TCM FAQs
  const [tcmFaqs, setTcmFaqs] = useState<FAQItem[]>([]);
  const [tcmFaqsLoading, setTcmFaqsLoading] = useState(true);
  const [tcmFaqsError, setTcmFaqsError] = useState<string | null>(null);

  // State for person events
  const [personEvents, setPersonEvents] = useState<PersonEvent[]>([]);
  const [personEventsLoading, setPersonEventsLoading] = useState(true);
  const [personEventsError, setPersonEventsError] = useState<string | null>(null);

  // State for home FAQs
  const [homeFaqs, setHomeFaqs] = useState<HomeFAQ[]>([]);
  const [homeFaqsLoading, setHomeFaqsLoading] = useState(true);
  const [homeFaqsError, setHomeFaqsError] = useState<string | null>(null);

  // Generic fetch function
  const fetchData = async <T>(
    url: string,
    setData: (data: T[]) => void,
    setLoading: (loading: boolean) => void,
    setError: (error: string | null) => void,
    dataName: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }

      setData(result.data || []);
    } catch (err) {
      console.error(`Error fetching ${dataName}:`, err);
      setError(err instanceof Error ? err.message : `Failed to fetch ${dataName}`);
    } finally {
      setLoading(false);
    }
  };

  // Individual fetch functions
  const fetchConditions = async () => {
    await fetchData('/api/home/conditions', setConditions, setConditionsLoading, setConditionsError, 'conditions');
  };

  const fetchModalities = async () => {
    await fetchData('/api/home/modalities', setModalities, setModalitiesLoading, setModalitiesError, 'modalities');
  };

  const fetchTcms = async () => {
    await fetchData('/api/home/tcms', setTcms, setTcmsLoading, setTcmsError, 'TCMs');
  };

  const fetchTcmFaqs = async () => {
    await fetchData('/api/home/tcm-faqs', setTcmFaqs, setTcmFaqsLoading, setTcmFaqsError, 'TCM FAQs');
  };

  const fetchPersonEvents = async () => {
    await fetchData('/api/home/person-events', setPersonEvents, setPersonEventsLoading, setPersonEventsError, 'person events');
  };

  const fetchHomeFaqs = async () => {
    await fetchData('/api/home/home-faqs', setHomeFaqs, setHomeFaqsLoading, setHomeFaqsError, 'home FAQs');
  };

  // Fetch all data
  const fetchAllData = async () => {
    await Promise.all([
      fetchConditions(),
      fetchModalities(),
      fetchTcms(),
      fetchTcmFaqs(),
      fetchPersonEvents(),
      fetchHomeFaqs()
    ]);
  };

  // Load all data on mount
  useEffect(() => {
    fetchAllData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Computed states
  const isLoading = conditionsLoading || modalitiesLoading || tcmsLoading || tcmFaqsLoading ||
                   personEventsLoading || homeFaqsLoading;

  const hasErrors = !!(conditionsError || modalitiesError || tcmsError || tcmFaqsError ||
                      personEventsError || homeFaqsError);

  return {
    // Data
    conditions,
    modalities,
    tcms,
    tcmFaqs,
    personEvents,
    homeFaqs,

    // Loading states
    conditionsLoading,
    modalitiesLoading,
    tcmsLoading,
    tcmFaqsLoading,
    personEventsLoading,
    homeFaqsLoading,
    isLoading,

    // Error states
    conditionsError,
    modalitiesError,
    tcmsError,
    tcmFaqsError,
    personEventsError,
    homeFaqsError,
    hasErrors,

    // Refresh functions
    refreshConditions: fetchConditions,
    refreshModalities: fetchModalities,
    refreshTcms: fetchTcms,
    refreshTcmFaqs: fetchTcmFaqs,
    refreshPersonEvents: fetchPersonEvents,
    refreshHomeFaqs: fetchHomeFaqs,
    refreshAll: fetchAllData
  };
}

// Individual hook functions for backward compatibility (optional)
export const useConditions = () => {
  const { conditions, conditionsLoading, conditionsError } = useHomeData();
  return { conditions, loading: conditionsLoading, error: conditionsError };
};

export const useModalities = () => {
  const { modalities, modalitiesLoading, modalitiesError } = useHomeData();
  return { modalities, loading: modalitiesLoading, error: modalitiesError };
};

export const useTcms = () => {
  const { tcms, tcmsLoading, tcmsError } = useHomeData();
  return { tcms, loading: tcmsLoading, error: tcmsError };
};

export const useTCMFaqs = () => {
  const { tcmFaqs, tcmFaqsLoading, tcmFaqsError } = useHomeData();
  return { tcmFaqs, loading: tcmFaqsLoading, error: tcmFaqsError };
};

export const usePersonEvents = () => {
  const { personEvents, personEventsLoading, personEventsError } = useHomeData();
  return { personEvents, loading: personEventsLoading, error: personEventsError };
};

export const useHomeFaqs = () => {
  const { homeFaqs, homeFaqsLoading, homeFaqsError } = useHomeData();
  return { homeFaqs, loading: homeFaqsLoading, error: homeFaqsError };
};