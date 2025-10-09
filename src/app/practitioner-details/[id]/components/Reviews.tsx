import { Star } from 'lucide-react';

export const Reviews = () => {
  return (
    <div>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-orange-500 mb-4 md:mb-6">Reviews</h3>
        </div>

        {/* Rating Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">4.9</div>
            <div className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">Overall</div>
            <div className="flex justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
          </div>

          {/* Care + Service */}
          <div className="text-center">
            <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">5.0</div>
            <div className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">Care + Service</div>
            <div className="flex justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
          </div>

          {/* Wait Time */}
          <div className="text-center">
            <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">4.8</div>
            <div className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">Wait Time</div>
            <div className="flex justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 md:w-4 md:h-4 ${star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>

          {/* Office Environment */}
          <div className="text-center">
            <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">4.9</div>
            <div className="text-xs md:text-sm font-medium text-gray-600 mb-1 md:mb-2">Office Environment</div>
            <div className="flex justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Individual Reviews */}
        <div className="space-y-4 md:space-y-6">
          {/* Review 1 */}
          <div className="border-b border-gray-200 pb-4 md:pb-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                A
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="text-xs md:text-sm text-gray-500">• 2 weeks ago</span>
                </div>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                  I experienced a 30 minute acupuncture session at the Harlem Wellness Fair this past weekend. It was such a meditative experience. Special shoutout to Johanne for accommodating everyone with ease and grace even as the rain poured down around us. While I didn&apos;t have any specific pain to target, Johanne was able to pin point prime area for deep relaxation in mind, body, and soul. I travelled to another place while sitting in the middle of Marcus Garvey park with rain pouring, cool wind blowing, and other clients approaching the tent. I look forward to connecting with Harlem Chi for a longer session in the near future.
                </p>
              </div>
            </div>
          </div>

          {/* Review 2 */}
          <div className="border-b border-gray-200 pb-4 md:pb-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                M
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="text-xs md:text-sm text-gray-500">• 1 month ago</span>
                </div>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                  I experienced a 30 minute acupuncture session at the Harlem Wellness Fair this past weekend. It was such a meditative experience. Special shoutout to Johanne for accommodating everyone with ease and grace even as the rain poured down around us. While I didn&apos;t have any specific pain to target, Johanne was able to pin point prime area for deep relaxation in mind, body, and soul. I travelled to another place while sitting in the middle of Marcus Garvey park with rain pouring, cool wind blowing, and other clients approaching the tent. I look forward to connecting with Harlem Chi for a longer session in the near future.
                </p>
              </div>
            </div>
          </div>

          {/* Review 3 */}
          <div className="border-b border-gray-200 pb-4 md:pb-6">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                S
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <span className="text-xs md:text-sm text-gray-500">• 2 months ago</span>
                </div>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                  I experienced a 30 minute acupuncture session at the Harlem Wellness Fair this past weekend. It was such a meditative experience. Special shoutout to Johanne for accommodating everyone with ease and grace even as the rain poured down around us. While I didn&apos;t have any specific pain to target, Johanne was able to pin point prime area for deep relaxation in mind, body, and soul. I travelled to another place while sitting in the middle of Marcus Garvey park with rain pouring, cool wind blowing, and other clients approaching the tent. I look forward to connecting with Harlem Chi for a longer session in the near future.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* More Reviews Button */}
        <div className="text-center pt-4">
          <button className="text-blue-600 hover:underline font-medium text-sm md:text-base">
            More Google Reviews
          </button>
        </div>
      </div>
    </div>
  );
};
