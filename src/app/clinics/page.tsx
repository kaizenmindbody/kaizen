"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/commons/breadcrumb";
import { useClinics } from "@/hooks/useClinics";
import { useState, useMemo } from "react";
import states from "states-us";

// Skeleton Loading Component for Clinics Page
const ClinicsSkeleton = () => {
  return (
    <>
      <Breadcrumb pageName="Clinics" />
      <section className="pb-[60px] sm:pb-[120px] pt-[80px] sm:pt-[150px] animate-pulse">
        <div className="container">
          {/* Search and Filter Bar Skeleton */}
          <div className="mb-8 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="h-4 bg-gray-200 rounded w-48"></div>

            <div className="flex flex-col lg:flex-row w-full lg:w-auto gap-3 lg:gap-2">
              {/* Search Input Skeleton */}
              <div className="relative w-full lg:w-auto">
                <div className="h-10 bg-gray-200 rounded w-full lg:min-w-[200px]"></div>
              </div>

              {/* State Dropdown Skeleton */}
              <div className="h-10 bg-gray-200 rounded w-full lg:min-w-[160px]"></div>

              {/* All Clinics Dropdown Skeleton */}
              <div className="h-10 bg-gray-200 rounded w-full lg:min-w-[120px]"></div>
            </div>
          </div>

          {/* Clinics Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {Array.from({ length: 9 }, (_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-dark rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-center gap-4">
                  {/* Clinic Image Skeleton */}
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex-shrink-0"></div>

                  {/* Clinic Info Skeleton */}
                  <div className="flex-1 min-w-0">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button Skeleton */}
          <div className="text-center">
            <div className="h-12 bg-gray-200 rounded-3xl w-48 mx-auto"></div>
          </div>
        </div>
      </section>
    </>
  );
};

const ClinicsPage = () => {
  const { clinics: allClinics, loading, error } = useClinics();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("All States");
  const [currentPage, setCurrentPage] = useState(1);
  const clinicsPerPage = 9;

  // Filter clinics based on search and state
  const filteredClinics = useMemo(() => {
    let filtered = allClinics;

    if (searchTerm) {
      filtered = filtered.filter(clinic =>
        clinic.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedState !== "All States") {
      const selectedStateInfo = states.find(state => state.name === selectedState);
      const selectedStateCode = selectedStateInfo?.abbreviation?.toLowerCase() || '';
      const selectedStateLower = selectedState.toLowerCase();

      filtered = filtered.filter(clinic => {
        const clinicLocation = clinic.location?.toLowerCase() || '';

        // Enhanced matching - check for various formats
        return (
          clinicLocation.includes(selectedStateLower) ||
          clinicLocation.includes(selectedStateCode) ||
          clinicLocation.includes(selectedStateCode.toUpperCase()) ||
          // Check for " STATE " pattern (space before and after)
          clinicLocation.includes(` ${selectedStateCode} `) ||
          clinicLocation.includes(` ${selectedStateCode.toUpperCase()} `) ||
          // Check for ", STATE" pattern (comma before)
          clinicLocation.includes(`, ${selectedStateCode}`) ||
          clinicLocation.includes(`, ${selectedStateCode.toUpperCase()}`) ||
          // Check if location ends with state code
          clinicLocation.endsWith(selectedStateCode) ||
          clinicLocation.endsWith(selectedStateCode.toUpperCase())
        );
      });
    }

    return filtered.sort((a, b) => a.service.localeCompare(b.service));
  }, [allClinics, searchTerm, selectedState]);

  // Get US states for dropdown
  const stateOptions = useMemo(() => {
    const stateList = ["All States", ...states.map(state => state.name)];
    return stateList;
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(filteredClinics.length / clinicsPerPage);
  const startIndex = (currentPage - 1) * clinicsPerPage;
  const endIndex = startIndex + clinicsPerPage;
  const currentClinics = useMemo(() => 
    filteredClinics.slice(startIndex, endIndex), 
    [filteredClinics, startIndex, endIndex]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClinicClick = (clinicId: number) => {
    router.push(`/clinic-details/${clinicId}`);
  };

  const getServiceStyle = (service: string, index: number) => {
    // Define specific styles for each clinic to match the reference image
    const styles = [
      { bg: "bg-blue-100", textColor: "text-blue-600", iconBg: "bg-blue-500" },
      { bg: "bg-red-100", textColor: "text-red-600", iconBg: "bg-red-500" },
      { bg: "bg-gray-100", textColor: "text-gray-600", iconBg: "bg-gray-800" },
      { bg: "bg-purple-100", textColor: "text-purple-600", iconBg: "bg-purple-500" },
      { bg: "bg-gray-100", textColor: "text-gray-600", iconBg: "bg-gray-700" },
      { bg: "bg-teal-100", textColor: "text-teal-600", iconBg: "bg-teal-500" },
      { bg: "bg-pink-100", textColor: "text-pink-600", iconBg: "bg-pink-500" },
      { bg: "bg-green-100", textColor: "text-green-600", iconBg: "bg-green-500" },
      { bg: "bg-orange-100", textColor: "text-orange-600", iconBg: "bg-orange-500" }
    ];
    
    return styles[index % styles.length];
  };

  // Handle error state
  if (error) {
    return (
      <>
        <Breadcrumb pageName="Clinics" />
        <section className="pb-[60px] sm:pb-[120px] pt-[80px] sm:pt-[150px]">
          <div className="container">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-red-500">
                Error loading clinics: {error}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (loading) {
    return <ClinicsSkeleton />;
  }

  return (
    <>
      <Breadcrumb pageName="Clinics" />
      
      <section className="pb-[60px] sm:pb-[120px] pt-[80px] sm:pt-[150px]">
        <div className="container ">
          {/* Search and Filter Bar */}
          <div className="mb-8 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="text-black dark:text-white font-medium text-sm">
              Showing <span className="text-blue-600 font-bold">{filteredClinics.length}</span> Clinics For You
            </div>
            
            <div className="flex flex-col lg:flex-row w-full lg:w-auto gap-3 lg:gap-2">
              {/* Search Input - First on mobile, inline on desktop */}
              <div className="relative w-full lg:w-auto">
                <input
                  type="text"
                  placeholder="Search Clinics"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white w-full lg:min-w-[200px] bg-white"
                />
                <svg 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* State Dropdown */}
              <select 
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white w-full lg:min-w-[160px] bg-white appearance-none text-[16px] md:text-sm"
                style={{ WebkitAppearance: 'none' }}
              >
                {stateOptions.map(state => (
                  <option key={state} value={state} className="text-[16px] md:text-sm py-1">
                    {state}
                  </option>
                ))}
              </select>

              {/* All Clinics Dropdown */}
              <select 
                className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white w-full lg:min-w-[120px] bg-white appearance-none text-[16px] md:text-sm"
                style={{ WebkitAppearance: 'none' }}
              >
                <option className="text-[16px] md:text-sm py-1">All Clinics</option>
              </select>
            </div>
          </div>

          {/* Clinics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {currentClinics.map((clinic, index) => {
              const style = getServiceStyle(clinic.service, index);
              return (
                <div
                  key={clinic.id}
                  onClick={() => handleClinicClick(clinic.id)}
                  className="bg-white dark:bg-gray-dark rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {/* Clinic Image */}
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      {clinic.image && clinic.image.startsWith('http') ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={clinic.image}
                            alt={clinic.service}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`w-full h-full ${style.iconBg} flex items-center justify-center`}>
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Clinic Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-black dark:text-white mb-1">
                        {clinic.service}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span>{clinic.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <span>{clinic.member}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More Button */}
          {currentPage < totalPages && (
            <div className="text-center">
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-3xl font-medium transition-colors inline-flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Load More Clinics
              </button>
            </div>
          )}

          {/* No Results */}
          {filteredClinics.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                No clinics found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search criteria or browse all clinics
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ClinicsPage;