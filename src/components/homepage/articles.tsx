import React from 'react';
import Image from 'next/image';
import { User, Calendar } from 'lucide-react';
import { ArticlesProps } from '@/types/homepage';

// Skeleton Loading Component for Article Card
const ArticleSkeleton = () => {
  return (
    <article className="font-sans group bg-white border border-[#E6E8EE] rounded-2xl overflow-hidden shadow-lg p-2 animate-pulse">
      <div className="flex flex-col sm:flex-row">
        {/* Image Skeleton */}
        <div className="sm:w-1/3 lg:w-2/5 p-2">
          <div className="w-full h-48 sm:h-full bg-gray-200 rounded-lg"></div>
        </div>

        {/* Content Skeleton */}
        <div className="sm:w-2/3 lg:w-3/5 flex flex-col justify-between py-4 px-2">
          {/* Meta Information Skeleton */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>

          {/* Title Skeleton */}
          <div className="mb-3">
            <div className="h-4 bg-gray-200 rounded w-4/5 mb-1"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>

          {/* Description Skeleton */}
          <div className="mb-2 flex-grow">
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>

          {/* Read More Button Skeleton */}
          <div className="h-8 bg-gray-200 rounded-full w-24 self-start"></div>
        </div>
      </div>
    </article>
  );
};

const LatestArticlesSection = ({title, articles, loading}: ArticlesProps & { loading?: boolean }) => {

  return (
    <section className="relative bg-white py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-[24px] md:text-[32px] text-[#3D375F]">
            {title}
          </h2>
        </div>

        {/* Loading State or Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-6">
            {Array.from({ length: 2 }, (_, index) => (
              <ArticleSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-6">
            {articles?.map((article) => (
              <article
                key={article.id}
                className="font-sans group bg-white border border-[#E6E8EE] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 p-2"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="sm:w-1/3 lg:w-2/5 p-2 border-lg">
                    <Image
                      src={article.image}
                      width={300}
                      height={300}
                      alt={article.title}
                      className="w-full h-full rounded-lg object-cover transition-transform duration-300"
                    />
                  </div>

                  {/* Content */}
                  <div className="sm:w-2/3 lg:w-3/5 flex flex-col justify-between py-4 px-2">
                    {/* Meta Information */}
                    <div className="flex items-center gap-4 mb-4 text-[12px] md:text-[14px] text-[#465D7C]">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                        <span>{article.date}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-[16px] font-[600] text-[#012047] leading-tight mb-3 transition-colors duration-300">
                      {article.title}
                    </h3>

                    {/* Excerpt with 2-line limit and ellipsis */}
                    <p className="text-[12px] md:text-[14px] text-[#465D7C] leading-relaxed mb-2 flex-grow line-clamp-2 overflow-hidden">
                      {article.description}
                    </p>

                    {/* Read More Button */}
                    <button
                      className="flex items-center text-[14px] font-[500] text-[#0E82FD] border border-[#0E82FD] rounded-full px-4 py-1 transition-all duration-300 self-start
                                hover:bg-[#0E82FD] hover:text-white"
                    >
                      Read More
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestArticlesSection;