// Booking related interfaces

export interface Booking {
  id?: string;
  practitionerId?: string;
  selectedService?: SelectedService;
  selectedDateTime?: Date;
  selectedDate?: string;
  selectedTime?: string;
  appointmentType?: string;
  patientName?: string;
  patientEmail?: string;
  patientPhone?: string;
  notes?: string;
  status?: string;
  totalCost?: number;
  createdAt?: string;
  updatedAt?: string;
  // Display properties used in booking flow
  date?: string;
  timeSlot?: string;
  apiTime?: string;
  displayDate?: string;
  displayTime?: string;
}

export interface SelectedService {
  serviceId: string;
  serviceName: string;
  session: {
    type: string;
    price: number;
  };
}

export interface Service {
  id: string;
  name: string;
  sessions: {
    type: string;
    price: number;
    selected: boolean;
  }[];
}

export interface Practitioner {
  id: string;
  full_name: string;
  specialty?: string | string[];
  avatar?: string;
  clinic?: string;
  rating?: number;
  total_reviews?: number;
  consultation_fee?: number;
  review?: string;
  degrees?: string | string[];
  address?: string;
}

// Form data interface for patient information
export interface FormData {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  notes?: string;
  reasonForVisit?: string;
}

// Step progress interface
export interface Step {
  number: number;
  title: string;
  active: boolean;
}

// Component Props interfaces
export interface BookingSummaryProps {
  currentStep: number;
  selectedService: SelectedService | null;
  selectedBookings: Booking[];
  getSelectedServiceDisplay: () => string;
}

export interface Step5ConfirmationProps {
  practitioner: Practitioner;
  selectedService: SelectedService | null;
  selectedBookings: Booking[];
  onReschedule: () => void;
  onCancel: () => void;
  onBack: () => void;
  getSelectedServiceDisplay: () => string;
  bookNumber?: string;
  onStartNewBooking?: () => void;
}

export interface Step4BasicInformationProps {
  formData: FormData;
  consentAgreed: boolean;
  policyAgreed: boolean;
  onFormChange: (field: string, value: string) => void;
  onConsentChange: (agreed: boolean) => void;
  onPolicyChange: (agreed: boolean) => void;
}

export interface Step1ServiceSelectionProps {
  services: Service[];
  selectedService: SelectedService | null;
  onServiceSelect: (serviceId: string, sessionIndex: number) => void;
}

export interface Step3DateTimeSelectionProps {
  currentDate: Date;
  availableSlots: {
    morning: string[];
    afternoon: string[];
    conflicts?: any;
    practitionerBookings?: any;
  };
  selectedBookings: Booking[];
  loadingAvailability: boolean;
  onDateSelect: (date: Date) => void;
  onTimeSlotSelect: (time: string) => void;
  onNavigateMonth: (direction: number) => void;
  onClearBookings: () => void;
  onToggleBookingSelection: (date: Date, timeSlot: string) => void;
  formatMonth: (date: Date) => string;
  getDaysInMonth: (date: Date) => (Date | null)[];
  isPastDate: (date: Date) => boolean;
  dateHasBookings: (date: Date) => boolean;
  isCurrentViewingDate: (date: Date) => boolean;
  isBookingSelected: (date: Date, timeSlot: string) => boolean;
  selectedService: SelectedService | null;
}

export interface Step2AppointmentTypeProps {
  appointmentType: string;
  setAppointmentType: (type: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export interface ProgressStepsProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepNumber: number) => void;
  canNavigateToStep: (stepNumber: number) => boolean;
}

export interface PractitionerInfoProps {
  practitioner: Practitioner;
  currentStep: number;
  selectedService: SelectedService | null;
  selectedBookings: Booking[];
  formatSpecialties: (specialty: string | string[]) => string;
  getSelectedServiceDisplay: () => string;
}