interface AboutProps {
  practitioner: any;
}

export const About = ({ practitioner }: AboutProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      <div className="lg:col-span-2 order-2 lg:order-1">
        <div className="space-y-8">
          {/* Main About Section */}
          <div>
            <h3 className="text-2xl font-bold text-orange-500 mb-4">About {practitioner.full_name}</h3>
            <div className="text-gray-700 leading-relaxed">
              {practitioner.about ? (
                <div dangerouslySetInnerHTML={{ __html: practitioner.about }} />
              ) : (
                <p>No about information provided.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="order-1 lg:order-2">
        <div className="bg-gray-50 rounded-xl p-4 lg:p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Specialties</h4>

          <div className="space-y-2">
            {practitioner.specialties && practitioner.specialties.length > 0 ? (
              practitioner.specialties.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  {item}
                </div>
              ))
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                General Practice
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 lg:p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">What To Expect On Your First Visit</h4>
          <p className="text-sm text-gray-600">
            Your first visit will include a comprehensive consultation and treatment plan discussion.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 lg:p-6 mb-6">
          <h4 className="font-semibold text-gray-900 mb-4">Insurance</h4>
          <div className="space-y-2">
            {practitioner.insurance_accepted && practitioner.insurance_accepted.length > 0 ? (
              practitioner.insurance_accepted.map((insurance, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  {insurance}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">
                Please contact the office for insurance information.
              </p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 lg:p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Cancellation Policy</h4>
          <p className="text-sm text-gray-600">
            {practitioner.cancellation_policy || 'Please provide 24 hours notice for cancellations. Late cancellations or no-shows may be subject to a fee.'}
          </p>
        </div>
      </div>
    </div>
  );
};
