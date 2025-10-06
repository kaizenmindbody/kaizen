"use client";

import { ProfileData } from '@/types/user';
import { useState } from 'react';

interface ManageServicesPricingProps {
  profile: ProfileData | null;
}

const ManageServicesPricing: React.FC<ManageServicesPricingProps> = ({ profile }) => {
  const [services, setServices] = useState([
    { id: 1, name: 'Initial Consultation', price: '150', duration: '60' },
    { id: 2, name: 'Follow-up Session', price: '100', duration: '45' },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Services and Pricing</h2>
        <p className="text-gray-600">Configure your services and set pricing for each specialty.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Your Services</h3>
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            Add New Service
          </button>
        </div>

        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                  <input
                    type="text"
                    defaultValue={service.name}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                  <input
                    type="number"
                    defaultValue={service.price}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (min)</label>
                  <input
                    type="number"
                    defaultValue={service.duration}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                  Remove Service
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Pricing Guidelines</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Set competitive rates based on your experience and specialty</li>
            <li>• Consider offering package deals for multiple sessions</li>
            <li>• Review and adjust pricing quarterly based on demand</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t mt-6">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageServicesPricing;
