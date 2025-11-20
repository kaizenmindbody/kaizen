"use client";

import ScrollUp from "@/components/commons/scrollup";
import Hero from "@/components/homepage/hero";
import IconSearchCard from "@/components/homepage/icon-search-card";
import TcmPractitioner from "@/components/homepage/tcm-practitioner";
import FeaturedUsers from "../components/homepage/featured-users";
import { useHomeData } from "@/hooks/useHomeData";
import TcmFaqSection from "../components/homepage/tcm-faq";
import LatestArticlesSection from "../components/homepage/articles";
import PersonEvent from "../components/homepage/person-event";
import FAQSection from "../components/homepage/faq";
import TestimonialsSection from "../components/homepage/tetimonials";
import GoogleReviews from "../components/homepage/google-reviews";
import BrowseShop from "../components/homepage/browse-shop";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { ProfileData } from "@/types/user";

export default function Home() {
  const { userProfile } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  // Use the unified home data hook
  const {
    conditions,
    modalities,
    tcms,
    tcmFaqs,
    personEvents,
    homeFaqs,
    shops,
    testimonials,
    conditionsLoading,
    modalitiesLoading,
    tcmsLoading,
    tcmFaqsLoading,
    personEventsLoading,
    homeFaqsLoading,
    shopsLoading,
    testimonialsLoading,
    conditionsError,
    modalitiesError,
    tcmsError,
    tcmFaqsError,
    personEventsError,
    homeFaqsError,
    shopsError,
    testimonialsError,
    hasErrors
  } = useHomeData();

  // Fetch full profile data including reviews
  useEffect(() => {
    const fetchProfileData = async () => {
      if (userProfile?.id) {
        try {
          const response = await fetch(`/api/profile?user_id=${userProfile.id}`);
          if (response.ok) {
            const data = await response.json();
            setProfileData(data);
          }
        } catch (error) {
        }
      }
    };

    fetchProfileData();
  }, [userProfile?.id]);

  // Handle error states
  if (hasErrors) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">
          {conditionsError && <div>Error loading conditions: {conditionsError}</div>}
          {modalitiesError && <div>Error loading modalities: {modalitiesError}</div>}
          {tcmsError && <div>Error loading TCMs: {tcmsError}</div>}
          {tcmFaqsError && <div>Error loading TCM FAQs: {tcmFaqsError}</div>}
          {personEventsError && <div>Error loading person events: {personEventsError}</div>}
          {homeFaqsError && <div>Error loading home FAQs: {homeFaqsError}</div>}
          {shopsError && <div>Error loading shops: {shopsError}</div>}
          {testimonialsError && <div>Error loading testimonials: {testimonialsError}</div>}
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollUp />
      <Hero />
      <IconSearchCard title="Search By Condition" data={conditions} loading={conditionsLoading} />
      <IconSearchCard title="Search By Modality" data={modalities} bgColor="#8ED0834D" loading={modalitiesLoading} />
      <BrowseShop title="Browse and Shop - Nourish Your Mind and Body" shops={shops} loading={shopsLoading} />
      <PersonEvent title="Explore Events - Experience Wellness Together" events={personEvents} loading={personEventsLoading} />
      <TcmPractitioner />
      <FeaturedUsers title="Featured TCM Practitioners" users={tcms} loading={tcmsLoading} />
      <TcmFaqSection title="Want to Learn More About Traditional Chinese Medicine?" faqItems={tcmFaqs} loading={tcmFaqsLoading} />
      <LatestArticlesSection title="Latest Insightful Articles" />
      <FAQSection title="Frequently Asked Questions" faqs={homeFaqs} loading={homeFaqsLoading} />
      <GoogleReviews embedUrl={profileData?.reviews} />
      <TestimonialsSection testimonials={testimonials} loading={testimonialsLoading} />
    </>
  );
}