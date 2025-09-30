"use client";
import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <>
      <footer className="font-sans relative bg-[#8ED08380] pt-12 dark:bg-gray-dark sm:pt-16 md:pt-20 lg:pt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Logo and Description */}
            <div className="text-center md:text-left">
              <div className="max-w-[360px] mx-auto md:mx-0 lg:mb-16">
                <Link href="/" className="mb-6 sm:mb-8 inline-block">
                  <Image
                    src="/images/logo.png"
                    width={140}
                    height={30}
                    alt="logo"
                    className="w-full h-full"
                  />
                </Link>
                <p className="mb-6 sm:mb-9 text-sm sm:text-base leading-relaxed text-secondary">
                  Effortlessly schedule your appointments with Kaizen. Prioritize your well-being by learning about your healthcare options and educate yourself on the powers of TCM and acupuncture.
                </p>
              </div>
            </div>

            {/* Company Links */}
            <div className="font-semibold text-secondary text-center md:text-left mb-4 lg:mb-0">
              <div className="lg:mb-16 md:px-8">
                <h2 className="mb-6 sm:mb-8 lg:mb-10 text-lg sm:text-xl font-bold">
                  Company
                </h2>
                <ul className="space-y-1 sm:space-y-0">
                  <li>
                    <Link
                      href="/about-us"
                      className="block sm:mb-4 text-sm sm:text-base duration-300 hover:text-secondary-light py-1"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq"
                      className="block sm:mb-4 text-sm sm:text-base duration-300 hover:text-secondary-light py-1"
                    >
                      FAQs
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="font-semibold text-secondary text-center md:text-left">
              <div className="lg:mb-16">
                <h2 className="mb-6 sm:mb-8 lg:mb-10 text-lg sm:text-xl font-bold text-secondary">
                  Join Our Newsletter
                </h2>
                <div className="flex gap-0 mb-4 w-full max-w-xs mx-auto md:mx-0">
                  <input
                    type="email"
                    placeholder="Enter Email"
                    className="bg-white flex-1 min-w-0 px-2 sm:px-3 py-3 text-sm border border-gray-300 rounded-l-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                  />
                  <button className="px-3 sm:px-4 py-3 bg-primary text-white font-medium text-sm rounded-r-lg hover:bg-primary/90 transition-colors duration-200 flex-shrink-0">
                    Submit
                  </button>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-4 pt-4 pb-12">
                  <Link href="#" className="p-2 bg-white rounded-lg hover:bg-secondary/80 transition-all duration-200">
                    <Image
                      src="/images/social/facebook.png"
                      width={40}
                      height={40}
                      alt="Facebook"
                      className="w-8 h-8 object-contain"
                    />
                  </Link>
                  <Link href="#" className="p-2 bg-white rounded-lg hover:bg-secondary/80 transition-all duration-200">
                    <Image
                      src="/images/social/instagram.png"
                      width={40}
                      height={40}
                      alt="Instagram"
                      className="w-8 h-8 object-contain"
                    />
                  </Link>
                  <Link href="#" className="p-2 bg-white rounded-lg hover:bg-secondary/80 transition-all duration-200">
                    <Image
                      src="/images/social/youtube.png"
                      width={40}
                      height={40}
                      alt="Google"
                      className="w-8 h-8 object-contain"
                    />
                  </Link>
                </div>
              </div>
            </div>

            
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-4 sm:py-6 bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
              <p className="text-center sm:text-left text-sm sm:text-base text-white order-2 sm:order-1">
                Copyright &copy; {new Date().getFullYear()} Kaizen. All Rights Reserved
              </p>
              <div className="flex items-center space-x-2 sm:space-x-4 order-1 sm:order-2">
                <a 
                  href="/privacy-policy" 
                  className="text-white hover:text-gray-200 transition-colors duration-200 text-sm sm:text-base"
                >
                  Privacy Policy
                </a>
                <span className="text-white text-sm sm:text-base">|</span>
                <a 
                  href="/terms-conditions" 
                  className="text-white hover:text-gray-200 transition-colors duration-200 text-sm sm:text-base"
                >
                  Terms & Conditions
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;