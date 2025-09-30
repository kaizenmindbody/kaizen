import React from 'react';
import { Step2AppointmentTypeProps } from '@/types/booking';

const Step2AppointmentType: React.FC<Step2AppointmentTypeProps> = ({
  appointmentType,
  setAppointmentType,
  onNext,
  onBack
}) => {
  const appointmentTypes = [
    { id: 'in-person', label: 'In-Person Consultation', description: 'Meet with the practitioner at their clinic' },
    { id: 'virtual', label: 'Virtual Consultation', description: 'Video call consultation from home' },
    { id: 'phone', label: 'Phone Consultation', description: 'Audio call consultation' }
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Select Appointment Type</h3>

      <div className="space-y-4 mb-8">
        {appointmentTypes.map((type) => (
          <div
            key={type.id}
            onClick={() => setAppointmentType(type.id)}
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
              appointmentType === type.id
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-gray-200 hover:border-primary/50'
            }`}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name="appointmentType"
                value={type.id}
                checked={appointmentType === type.id}
                onChange={() => setAppointmentType(type.id)}
                className="mr-3 text-primary"
              />
              <div>
                <h4 className="font-medium text-gray-900">{type.label}</h4>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!appointmentType}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            appointmentType
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Step2AppointmentType;