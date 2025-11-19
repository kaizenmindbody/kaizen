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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 9 }, (_, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Image Header Skeleton */}
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>

                {/* Clinic Info Skeleton */}
                <div className="p-6">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>

                  <div className="flex items-start gap-2 mb-3">
                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-1"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
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
    // Ensure allClinics is always an array
    if (!allClinics || !Array.isArray(allClinics)) {
      return [];
    }

    let filtered = allClinics;

    if (searchTerm) {
      filtered = filtered.filter(clinic => {
        const service = clinic.service || '';
        const location = clinic.location || '';
        return (
          service.toLowerCase().includes(searchTerm.toLowerCase()) ||
          location.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
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

    // Create a copy of the array before sorting to avoid mutating Redux state
    return [...filtered].sort((a, b) => a.service.localeCompare(b.service));
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
    console.error('Clinics page error:', error);
    return (
      <>
        <Breadcrumb pageName="Clinics" />
        <section className="pb-[60px] sm:pb-[120px] pt-[80px] sm:pt-[150px]">
          <div className="container">
            <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
              <div className="text-red-500 text-xl font-semibold">
                Error loading clinics
              </div>
              <div className="text-gray-600">
                {error}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
              >
                Retry
              </button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentClinics.map((clinic, index) => {
              const style = getServiceStyle(clinic.service, index);
              return (
                <div
                  key={clinic.id}
                  onClick={() => handleClinicClick(clinic.id)}
                  className="group bg-white dark:bg-gray-dark rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-primary/50 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                >
                  {/* Clinic Image/Icon Header */}
                  <div className={`relative h-48 ${style.bg} flex items-center justify-center overflow-hidden`}>
                    {clinic.image && clinic.image.startsWith('http') ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={clinic.image}
                          alt={clinic.service}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className={`w-24 h-24 ${style.iconBg} rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300`}>
                          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        {/* Decorative elements */}
                        <div className={`absolute -top-4 -right-4 w-32 h-32 ${style.iconBg} opacity-10 rounded-full`}></div>
                        <div className={`absolute -bottom-4 -left-4 w-24 h-24 ${style.iconBg} opacity-10 rounded-full`}></div>
                      </div>
                    )}
                  </div>

                  {/* Clinic Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {clinic.service}
                    </h3>

                    {/* Location */}
                    {clinic.location && (
                      <div className="flex items-start gap-2 mb-3">
                        <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{clinic.location}</span>
                      </div>
                    )}

                    {/* Phone/Member */}
                    {clinic.member && (
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{clinic.member}</span>
                      </div>
                    )}

                    {/* View Details Button */}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className={`flex items-center justify-between ${style.textColor} font-medium text-sm group-hover:translate-x-2 transition-transform duration-300`}>
                        <span>View Details</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
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
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {allClinics && allClinics.length > 0
                  ? `${allClinics.length} total clinics available, but none match your current filters.`
                  : 'No clinics available in the database.'}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search criteria or browse all clinics
              </p>
              {(searchTerm || selectedState !== "All States") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedState("All States");
                  }}
                  className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ClinicsPage;