"use client";

interface BookAppointmentButtonProps {
  practitionerId: string;
  user: any;
  onServicesTab?: boolean;
  practitionerWebsite?: string;
}

export const BookAppointmentButton = ({
  practitionerId,
  user,
  onServicesTab = false,
  practitionerWebsite
}: BookAppointmentButtonProps) => {
  const handleBookAppointment = () => {
    // If practitioner has a website, redirect there
    if (practitionerWebsite) {
      // Ensure the URL has a protocol
      const websiteUrl = practitionerWebsite.startsWith('http')
        ? practitionerWebsite
        : `https://${practitionerWebsite}`;
      window.open(websiteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // If no website is available, hide the button
  if (!practitionerWebsite) {
    return null;
  }

  return (
    <button
      onClick={handleBookAppointment}
      className="py-3 px-6 rounded-full font-medium transition-colors inline-block text-center bg-secondary text-white hover:bg-green-600"
    >
      Book Appointment
    </button>
  );
};
