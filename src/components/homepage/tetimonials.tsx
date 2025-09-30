import React from 'react';
import Image from 'next/image';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "John Doe",
      location: "New York",
      image: "/images/home/client.png",
      testimonial: "Doccure exceeded my expectations in healthcare. The seamless booking process, coupled with the expertise of the doctors, made my experience exceptional. Their commitment to quality care and convenience truly sets them apart. I highly recommend Doccure for anyone seeking reliable and accessible healthcare services."
    }
  ];

  return (
    <section 
      className="relative py-12 md:py-16 lg:py-20 overflow-hidden"
      style={{
        backgroundImage: `url('/images/home/testimonial-bg.png')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >

      <div className="container mx-auto px-4 relative z-10">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            
            {/* Left side - Profile Image */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden bg-gray-100 shadow-lg">
                <Image
                  src={testimonial.image}
                  width={250}
                  height={250}
                  alt={testimonial.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right side - Content */}
            <div className="flex-1 pt-4">
              {/* Header */}
              <div className="mb-2">
                <p className="text-primary text-[16px] md:text-[18px] font-bold mb-1">
                  Testimonials
                </p>
                <h2 className="text-[28px] md:text-[32px] text-primary leading-tight">
                  What Our Client Says
                </h2>
              </div>

              {/* Testimonial Text */}
              <p className="font-sans text-[16px] md:text-[18px] text-[#465D7C] leading-relaxed mb-4">
                {testimonial.testimonial}
              </p>

              {/* Client Info */}
              <div className="font-sans">
                <h4 className="text-[20px] md:text-[24px] font-[500] text-[#465D7C]">
                  {testimonial.name}
                </h4>
                <p className="text-[14px] text-[#465D7C]">
                  {testimonial.location}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialsSection;