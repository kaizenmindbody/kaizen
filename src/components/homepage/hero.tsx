"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import states from 'states-us';

// Create state options from states-us package
const stateOptions = [
  { value: '', label: 'All States' },
  ...states.map(state => ({
    value: state.name,
    label: state.name
  }))
];

// Custom styles for React Select
const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    border: '1px solid #E6E8EE',
    borderRadius: '0.5rem',
    padding: '0.25rem',
    backgroundColor: '#f9fafb',
    boxShadow: state.isFocused ? '0 0 0 2px #EA7D00' : 'none',
    borderColor: state.isFocused ? '#EA7D00' : '#E6E8EE',
    '&:hover': {
      borderColor: '#EA7D00',
    },
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#EA7D00' : state.isFocused ? '#FEF3E7' : 'white',
    color: state.isSelected ? 'white' : '#374151',
    '&:hover': {
      backgroundColor: state.isSelected ? '#EA7D00' : '#FEF3E7',
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#6b7280',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#374151',
  }),
};

const Hero = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState({ value: '', label: 'All States' });

  const handleSearch = () => {
    // Build query parameters for the search
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }
    if (selectedState?.value) {
      params.append('location', selectedState.value);
    }

    // Navigate to find-practitioner page with search parameters
    const queryString = params.toString();
    router.push(`/find-practitioner${queryString ? `?${queryString}` : ''}`);
  };
  return (
    <>
      <section
        id="home"
        className="relative z-10 overflow-hidden bg-white pb-16 pt-[120px] dark:bg-gray-dark md:pb-[50px] md:pt-[150px] xl:pb-[80px] xl:pt-[180px] 2xl:pb-[100px] 2xl:pt-[210px]"
      >
        <div className="container">
          <div className="-mx-4 flex flex-wrap items-center">
            {/* Left Column - Text Content */}
            <div className="w-full px-4 lg:w-1/2">
              <div className="max-w-[600px]">
                <h1 className="mb-5 text-[48px] leading-tight text-secondary dark:text-primary sm:leading-tight md:leading-tight">
                  Find the Best Nearby{" "}
                  <span className="text-secondary-light">Licensed Acupuncturist</span>{" "}
                  For You
                </h1>
                
                <div className="mb-8">
                  <h2 className="mb-4 text-2xl text-black dark:text-white md:text-3xl">
                    How can I help you?
                  </h2>
                  <p className="font-sans text-base leading-relaxed text-black dark:text-body-color-dark sm:text-lg">
                    Find a trusted practitioner near you. Search by price, 
                    location, health condition, vibe, practitioner, whatever you like. 
                    Book an appointment. Tell me what you are looking to treat and 
                    I can make recommendations.
                  </p>
                  <div className="mt-4 flex items-center">
                    <input
                      type="text"
                      placeholder="Type your question and tell me how I can help."
                      className="flex-1 rounded-l-lg border border-stroke-stroke bg-white px-4 py-3 text-base text-black placeholder-gray-500 focus:border-primary focus:outline-none dark:border-stroke-dark dark:bg-dark dark:text-white dark:placeholder-gray-400"
                      spellCheck="false"
                    />
                    <button className="rounded-r-lg bg-primary px-6 py-3 text-white transition-colors hover:bg-primary/80">
                      <svg 
                        className="h-6 w-6" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M2 12l18-8-8 18-2-8z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="w-full px-4 lg:w-1/2">
              {/* Practitioner Image */}
              <div className="relative z-10 flex h-[400px] items-end justify-center overflow-hidden rounded-full md:h-[500px] lg:h-[550px] xl:h-[600px]">
                <Image
                  src="/images/home/home-hero.png"
                  width={500}
                  height={500}
                  alt="Licensed Acupuncturist"
                  className="h-full w-auto object-cover object-top"
                />
                {/* <Image
                  src="/images/home/home-hero.png"
                  alt="logo"
                  width={600}
                  height={600}
                  className="w-full dark:hidden object-cover"
                /> */}
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="mt-12 text-left max-w-5xl m-auto">
            <h3 className="mb-2 text-[32px] text-primary ">
              Search The Directory
            </h3>
            
            <div className="mx-auto ">
              <div className="flex flex-col gap-4 border border-[#E6E8EE] rounded-xl bg-white p-6 shadow-two dark:bg-dark md:flex-row md:items-center md:gap-6">
                {/* Search Input */}
                <div className="flex-1">
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search acupuncturists, message therapists"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full rounded-lg border border-stroke-stroke bg-gray-50 py-3 pl-10 pr-4 text-base text-black placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 dark:border-stroke-dark dark:bg-gray-dark dark:text-white dark:placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* State Select */}
                <div className="flex-1">
                  <Select
                    instanceId="hero-state-select"
                    value={selectedState}
                    onChange={(option) => setSelectedState(option)}
                    options={stateOptions}
                    styles={customSelectStyles}
                    placeholder="Select State..."
                    isSearchable
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                  />
                </div>


                {/* Search Button */}
                <div>
                  <button
                    onClick={handleSearch}
                    className="w-full rounded-lg bg-primary px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-primary/80 md:w-auto"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;