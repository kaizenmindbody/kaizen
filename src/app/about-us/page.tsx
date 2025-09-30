"use client";

import Breadcrumb from "@/components/commons/breadcrumb";
import Image from "next/image";
import Link from "next/link";
import { useAboutUs } from "@/hooks/useAboutUs";
import { HashLoader } from "react-spinners";


const AboutUsPage = () => {
  const { aboutUsItems, loading: aboutUsLoading, error: aboutUsError } = useAboutUs();

  return (
    <>
      <Breadcrumb pageName="About Us" />

      {/* Hero Section */}
      <section className="pb-[20px] pt-[80px] sm:pt-[120px]">
        <div className="container">
          <div className="flex flex-wrap items-center">
            {/* Left Images */}
            <div className="w-full px-4 lg:w-1/2">
              <div className="wow fadeInUp relative mb-12 lg:mb-0" data-wow-delay=".1s">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Left Image - Doctor Team */}
                  <div className="space-y-4">
                    <div className="rounded-lg overflow-hidden">
                      <Image
                        src="/images/aboutus/about1.png"
                        alt="Professional medical team"
                        width={250}
                        height={300}
                        className="h-72 w-full object-cover"
                      />
                    </div>

                    <div className="rounded-lg overflow-hidden">
                      <Image
                        src="/images/aboutus/about2.png"
                        alt="Doctor consultation"
                        width={250}
                        height={300}
                        className="h-72 w-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Right Image - Doctor consultation */}
                  <div className="flex flex-col justify-center space-y-4">
                    <div className="w-full text-center rounded-lg bg-secondary px-6 py-8 text-sm font-medium text-white">
                      Over 30+<br />Years Experience
                    </div>
                    
                    <div className="rounded-lg overflow-hidden">
                      <Image
                        src="/images/aboutus/about3.png"
                        alt="Professional female doctor"
                        width={600}
                        height={400}
                        className="h-96 w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="w-full px-4 lg:w-1/2">
              <div className="wow fadeInUp lg:pl-12 relative" data-wow-delay=".2s">
                <div className="mb-3 text-sm font-medium text-green-500 uppercase tracking-wider">
                  About Our Company
                </div>

                <h1 className="mb-6 text-3xl font-bold leading-tight text-secondary dark:text-white sm:text-4xl lg:text-4xl">
                  We Always Ensure Best Treatment For Your Health
                </h1>

                <p className="mb-4 text-base leading-relaxed text-gray-600 dark:text-gray-300">
                  At Doccare, we understand the importance of accessible and convenient healthcare. Our mission is to simplify the process of finding and booking appointments with qualified healthcare professionals, ensuring that you receive the care you need when you need it.
                </p>

                <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
                  We envision a world where healthcare is easily accessible to everyone. Whether you&apos;re seeking routine check-ups, specialized consultations, or emergency care, we strive to connect you with the right medical professionals effortlessly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Second Hero Section */}
      <section className="">
        <div className="container">
          <div className="flex flex-wrap items-center">
            {/* Left Image */}
            <div className="w-full px-4 lg:w-1/2">
              <div className="wow fadeInUp relative mb-12 lg:mb-0" data-wow-delay=".1s">
                <div className="rounded-lg overflow-hidden">

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gray-50 py-16 dark:bg-gray-900">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-secondary dark:text-white lg:text-4xl">
              Why Choose Us
            </h2>
          </div>

          {/* Loading State */}
          {aboutUsLoading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <HashLoader color="#EA7D00" size={50} />
            </div>
          ) : aboutUsError ? (
            <div className="text-center text-red-500">
              <p>Error loading about us data: {aboutUsError}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {aboutUsItems.map((item, index) => (
                <div key={item.id} className="wow fadeInUp text-center border border-gray-200 rounded-lg p-6 dark:border-gray-700" data-wow-delay={`.${index + 1}s`}>
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    {item.image ? (
                      <div className="h-16 w-16 rounded-full overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                        {item.icon ? (
                          <div dangerouslySetInnerHTML={{ __html: item.icon }} />
                        ) : (
                          <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                  <h3 className="mb-3 text-lg font-bold text-secondary dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-base text-body-color">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-400 to-orange-500 py-32">
        <div className="absolute right-[150px] top-0 h-full w-1/4 hidden lg:block">
          <div className="relative h-full">
            <Image
              src="/images/home/girl.png"
              alt="Professional doctor"
              fill
              className="object-cover object-center"
            />
          </div>
        </div>

        <div className="container relative">
          <div className="w-full lg:w-2/3">
            <div className="wow fadeInUp" data-wow-delay=".1s">
              <h2 className="mb-6 text-3xl font-bold text-white lg:text-4xl">
                Be on Your Way to Feeling Better with the Kaizen
              </h2>
              <p className="mb-8 text-lg text-white/90">
                Take the first step towards better health by connecting with our experienced healthcare professionals.
              </p>
              <Link href="/contact" className="inline-block rounded-lg bg-white px-8 py-4 text-base font-semibold text-orange-500 transition duration-300 hover:bg-gray-100">
                Contact With Us
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10"></div>
        <div className="absolute -bottom-5 right-20 h-20 w-20 rounded-full bg-white/10"></div>
        <div className="absolute right-40 top-1/2 h-6 w-6 rounded-full bg-white/20"></div>
      </section>

    </>
  );
};

export default AboutUsPage;