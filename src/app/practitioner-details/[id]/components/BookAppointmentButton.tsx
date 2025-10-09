"use client";

import { useRouter } from 'next/navigation';

interface BookAppointmentButtonProps {
  practitionerId: string;
  user: any;
  onServicesTab?: boolean;
}

export const BookAppointmentButton = ({
  practitionerId,
  user,
  onServicesTab = false
}: BookAppointmentButtonProps) => {
  const router = useRouter();

  const handleBookAppointment = () => {
    // If we're already on the services tab, proceed with authentication check and booking
    if (onServicesTab) {
      // Check if user is authenticated
      if (!user) {
        // Store the intended booking URL in localStorage
        const bookingUrl = `/book/${practitionerId}?step=1`;
        localStorage.setItem('redirectAfterLogin', bookingUrl);

        // Redirect to login page
        router.push('/auth/signin');
        return;
      }

      // If user is a practitioner, don't allow booking (button should be disabled)
      if ((user as any).user_type === 'practitioner') {
        return; // Do nothing - button is disabled
      }

      // If user is authenticated patient, proceed to booking
      router.push(`/book/${practitionerId}?step=1`);
    } else {
      // If we're not on services tab, redirect to services tab first
      const servicesElement = document.querySelector('.navigation-tabs');
      if (servicesElement) {
        // Set the active tab to services
        const servicesTab = document.querySelector('[data-tab="Services & Pricing"]');
        if (servicesTab) {
          (servicesTab as HTMLButtonElement).click();
        }
        // Scroll to the tabs section
        servicesElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Check if user is practitioner to disable button
  const isPractitioner = user && (user as any).user_type === 'practitioner';
  const isDisabled = isPractitioner;

  return (
    <button
      onClick={handleBookAppointment}
      disabled={isDisabled}
      className={`py-3 px-6 rounded-full font-medium transition-colors inline-block text-center ${
        isDisabled
          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
          : 'bg-secondary text-white hover:bg-green-600'
      }`}
    >
      {isPractitioner ? 'Cannot Book (Practitioner Account)' : 'Book Appointment'}
    </button>
  );
};
