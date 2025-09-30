import React from 'react';
import { Service, SelectedService, Step1ServiceSelectionProps } from '@/types/booking';

// Using Service, SelectedService, and Step1ServiceSelectionProps from centralized types

const Step1ServiceSelection: React.FC<Step1ServiceSelectionProps> = ({
  services,
  selectedService,
  onServiceSelect
}) => {
  return (
    <div className="font-sans bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Choose Your Service
        </h3>
        <p className="text-gray-600">Select the service that best fits your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 hover:border-orange-300/50">
            <div className="flex items-center mb-4">
              <h4 className="text-xl font-bold text-gray-800">{service.name}</h4>
            </div>
            <div className="space-y-3">
              {service.sessions.map((session, index) => {
                const isSelected = selectedService?.serviceId === service.id &&
                                 selectedService?.session.type === session.type;

                return (
                  <div key={index} className="font-sans">
                    <div
                      onClick={() => onServiceSelect(service.id, index)}
                      className={`relative flex items-center justify-between overflow-hidden rounded-xl px-4 py-2 cursor-pointer transition-all duration-300 ${
                        isSelected
                          ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                          : 'bg-white border-2 border-gray-200 hover:border-orange-300 hover:shadow-md text-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-base font-semibold">
                          {session.type}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-secondary'}`}>
                          ${session.price}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Step1ServiceSelection;