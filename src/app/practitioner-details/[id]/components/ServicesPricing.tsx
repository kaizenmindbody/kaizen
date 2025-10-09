import { CheckCircle } from 'lucide-react';

interface ServicesPricingProps {
  practitioner: any;
}

export const ServicesPricing = ({ practitioner }: ServicesPricingProps) => {
  return (
    <div>
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-orange-500 mb-4 md:mb-6">Services, Pricing</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Left Side - Services and Pricing */}
        <div className="space-y-4 md:space-y-6">
          {/* Combined Services and Pricing Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Available Services & Rates</h4>

            {practitioner?.specialty_rate && Object.keys(practitioner.specialty_rate).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(practitioner.specialty_rate).map(([specialty, rate]) => (
                  <div key={specialty} className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div className="flex-1">
                      <div className="text-base font-medium text-gray-900">{specialty}</div>
                      <div className="text-sm text-gray-500 mt-1">Professional treatment and consultation</div>
                    </div>
                    <div className="text-lg font-bold text-gray-900">${Number(rate)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div className="flex-1">
                    <div className="text-base font-medium text-gray-900">General Consultation</div>
                    <div className="text-sm text-gray-500 mt-1">Comprehensive health assessment and treatment planning</div>
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    Contact for pricing
                  </div>
                </div>
                {practitioner?.specialties?.map((specialty) => (
                  <div key={specialty} className="flex justify-between items-center py-3 border-b border-gray-100">
                    <div className="flex-1">
                      <div className="text-base font-medium text-gray-900">{specialty}</div>
                      <div className="text-sm text-gray-500 mt-1">Specialized treatment and care</div>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      Contact for pricing
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Insurance Information */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 md:p-6">
            <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
              INSURANCE
            </h4>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              We currently do not directly bill insurance. If you would like to submit a receipt to your insurance company, we can generate an invoice for you.
            </p>
          </div>
        </div>

        {/* Right Side - Cancellation Policy */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Cancellation Policy</h4>
            <div className="text-sm md:text-base text-gray-700 leading-relaxed">
              {practitioner?.cancellation_policy ? (
                <p>{practitioner.cancellation_policy}</p>
              ) : (
                <div className="space-y-3">
                  <p>Please provide 24 hours notice for cancellations.</p>
                  <p>Late cancellations or no-shows may be subject to a fee.</p>
                  <p>We understand that unexpected situations arise. Please contact us as soon as possible if you need to reschedule your appointment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
