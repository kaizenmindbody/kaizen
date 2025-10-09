import Image from 'next/image';
import { MapPin } from 'lucide-react';

export const Events = () => {
  return (
    <div>
      <div className="mb-6">
        {/* Header with gradient */}
        <div>
          <h3 className="text-2xl font-bold text-orange-500 mb-4">Event/Webinar</h3>
        </div>
        {/* Event Card */}
        <div className="relative">
          {/* Hero Image */}
          <div className="relative h-48 overflow-hidden">
            <Image
              src="/images/home/webinars.png"
              alt="Gua Sha Workshop"
              width={800}
              height={300}
              className="w-full h-full rounded-lg object-cover"
            />
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Event Content */}
          <div className="p-4 md:p-6">
            <div className="mb-4">
              <div className="flex-1">
                <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4'>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                    Beginner Gua Sha Workshop
                  </h3>
                  <h4 className="text-lg md:text-2xl font-bold text-gray-900">
                    Sat, Sept 2, 2025, 2-5pm
                  </h4>
                </div>

                <div className='flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-4'>
                  <div className="text-sm font-semibold text-gray-900">FEE: <span className="text-lg font-bold text-orange-600">$60</span></div>
                  <div className="text-sm font-semibold text-gray-900">
                    LOCATION:
                    <div className="text-gray-700 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-xs md:text-sm">756 Park Ave, Suite 2300, New York, NY</span>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed pt-6">
                    Gua Sha has been used for thousands of years to drain lymph nodes create better circulation and many other health benefits. It has been known to be a great anti-aging tool. Learn how to do it properly! Come join us!
                  </p>
                </div>

                <div className="flex justify-center gap-3">
                  <button className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-2">
                    YES! I WANT TO REGISTER
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
