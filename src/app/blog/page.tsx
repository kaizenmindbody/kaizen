"use client";

import Image from "next/image";
import Breadcrumb from "@/components/commons/breadcrumb";
import { useBlogs } from "@/hooks/useBlogs";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

// Skeleton Loading Component for Blog Page
const BlogSkeleton = () => {
  return (
    <>
      <Breadcrumb pageName="Blog" />
      <section className="font-sans pb-[60px] sm:pb-[120px] pt-[80px] sm:pt-[180px] animate-pulse">
        <div className="container">
          <div className="flex flex-wrap lg:flex-nowrap gap-8">
            {/* Main Content Skeleton */}
            <div className="w-full lg:w-3/4">
              {/* Blog Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={index} className="group">
                    {/* Image Skeleton */}
                    <div className="relative mb-4 overflow-hidden rounded-lg">
                      <div className="relative aspect-[16/10] w-full bg-gray-200"></div>
                      {/* Category Badge Skeleton */}
                      <div className="absolute top-4 left-4">
                        <div className="bg-gray-200 px-3 py-1 rounded-full w-16 h-6"></div>
                      </div>
                    </div>

                    {/* Content Skeleton */}
                    <div className="space-y-3">
                      {/* Author & Date Skeleton */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-gray-200"></div>
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-4 h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>

                      {/* Title Skeleton */}
                      <div className="space-y-2">
                        <div className="h-6 bg-gray-200 rounded w-4/5"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/5"></div>
                      </div>

                      {/* Excerpt Skeleton */}
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Skeleton */}
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-12 bg-gray-200 rounded"></div>
                  <div className="h-10 w-8 bg-gray-200 rounded"></div>
                  <div className="h-10 w-8 bg-gray-200 rounded"></div>
                  <div className="h-10 w-8 bg-gray-200 rounded"></div>
                  <div className="h-10 w-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="w-full lg:w-1/4">
              {/* Search Skeleton */}
              <div className="bg-white dark:bg-gray-dark rounded-lg shadow-three dark:shadow-none p-6 mb-8">
                <div className="h-6 bg-gray-200 rounded w-20 mb-4"></div>
                <div className="flex">
                  <div className="flex-1 h-12 bg-gray-200 rounded-l-lg"></div>
                  <div className="w-12 h-12 bg-gray-200 rounded-r-lg"></div>
                </div>
              </div>

              {/* Categories Skeleton */}
              <div className="bg-white dark:bg-gray-dark rounded-lg shadow-three dark:shadow-none p-6 mb-8">
                <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="space-y-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 rounded w-8"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latest News Skeleton */}
              <div className="bg-white dark:bg-gray-dark rounded-lg shadow-three dark:shadow-none p-6 mb-8">
                <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="space-y-4">
                  {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-16 w-16 bg-gray-200 rounded flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags Skeleton */}
              <div className="bg-white dark:bg-gray-dark rounded-lg shadow-three dark:shadow-none p-6">
                <div className="h-6 bg-gray-200 rounded w-16 mb-4"></div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 7 }, (_, i) => (
                    <div key={i} className="h-8 bg-gray-200 rounded-full w-16"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const BlogGridPage = () => {
  const { blogs: allBlogs, loading, error } = useBlogs();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const blogsPerPage = 6;
  const router = useRouter();

  // Filter blogs by category and search query, then sort alphabetically
  const filteredBlogs = useMemo(() => {
    let filtered = allBlogs;
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(blog => blog.category === selectedCategory);
    }
    
    // Filter by search query (search in title)
    if (searchQuery.trim()) {
      filtered = filtered.filter(blog => 
        blog.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort alphabetically by title (A to Z)
    return filtered.sort((a, b) => a.title.localeCompare(b.title));
  }, [allBlogs, selectedCategory, searchQuery]);

  // Generate categories from actual blog data
  const categories = useMemo(() => {
    const categoryCount = allBlogs.reduce((acc, blog) => {
      acc[blog.category] = (acc[blog.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoryList = [
      { name: 'All', count: allBlogs.length }
    ];

    Object.entries(categoryCount).forEach(([name, count]) => {
      categoryList.push({ name, count });
    });

    return categoryList;
  }, [allBlogs]);

  // Calculate pagination based on filtered blogs
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const startIndex = (currentPage - 1) * blogsPerPage;
  const endIndex = startIndex + blogsPerPage;
  const blogPosts = useMemo(() => 
    filteredBlogs.slice(startIndex, endIndex), 
    [filteredBlogs, startIndex, endIndex]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when category changes
  };

  const handleBlogClick = (blogId: number) => {
    router.push(`/blog-details/${blogId}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already happening in real-time, but we can add any additional logic here
  };

  // Get latest news (most recent blogs)
  const latestNews = useMemo(() => {
    return [...allBlogs]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 3)
      .map(blog => ({
        title: blog.title,
        image: blog.image,
        date: blog.updated_at
      }));
  }, [allBlogs]);

  // Handle error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">
          Error loading blogs: {error}
        </div>
      </div>
    );
  }

  // Handle loading state
  if (loading) {
    return <BlogSkeleton />;
  }



  const tags = [
    "business", "marketing", "design", "health",
    "technology", "fitness", "lifestyle"
  ];

  return (
    <>
      <Breadcrumb pageName="Blog" />

      <section className="font-sans pb-[60px] sm:pb-[120px] pt-[80px] sm:pt-[180px]">
        <div className="container">
          <div className="flex flex-wrap lg:flex-nowrap gap-8">
            {/* Main Content */}
            <div className="w-full lg:w-3/4">
              {/* Blog Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {blogPosts.map((post) => (
                  <div
                    key={post.id}
                    className="group cursor-pointer"
                    onClick={() => handleBlogClick(post.id)}
                  >
                    {/* Image */}
                    <div className="relative mb-4 overflow-hidden rounded-lg">
                      <div className="relative aspect-[16/10] w-full">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary px-3 py-1 text-xs font-medium text-white rounded-full">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      {/* Author & Date */}
                      <div className="flex items-center justify-between text-sm text-body-color">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {post.author.charAt(0)}
                            </span>
                          </div>
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <svg 
                            width="14" 
                            height="14" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="text-body-color"
                          >
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          <span>{post.updated_at}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-black dark:text-white group-hover:text-primary transition-colors duration-200 leading-tight">
                        {post.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-body-color leading-relaxed">
                        {post.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages >= 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 transition-colors ${
                        currentPage === 1 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-body-color hover:text-primary'
                      }`}
                    >
                      Prev
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, index) => {
                      const page = index + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded transition-colors ${
                            currentPage === page
                              ? 'bg-primary text-white'
                              : 'text-body-color hover:text-primary hover:bg-primary/10'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 transition-colors ${
                        currentPage === totalPages 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-body-color hover:text-primary'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-1/4">
              {/* Search */}
              <div className="bg-white dark:bg-gray-dark rounded-lg shadow-three dark:shadow-none p-6 mb-8">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                  Search
                </h3>
                <form onSubmit={handleSearchSubmit} className="flex">
                  <input
                    type="text"
                    placeholder="Search by blog title..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="border-stroke dark:text-body-color-dark dark:shadow-two text-body-color focus:border-primary dark:focus:border-primary flex-1 rounded-l-lg border bg-[#f8f8f8] px-4 py-3 text-sm outline-none transition-all duration-300 dark:border-transparent dark:bg-[#2C303B] dark:focus:shadow-none"
                  />
                  <button type="submit" className="bg-primary text-white px-4 py-3 rounded-r-lg hover:bg-primary/90 transition-colors">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 20 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19.4062 16.8125L13.9375 12.375C14.9375 11.0625 15.5 9.46875 15.5 7.78125C15.5 5.75 14.7188 3.875 13.2812 2.4375C10.3438 -0.5 5.5625 -0.5 2.59375 2.4375C1.1875 3.84375 0.40625 5.75 0.40625 7.75C0.40625 9.78125 1.1875 11.6562 2.625 13.0937C4.09375 14.5625 6.03125 15.3125 7.96875 15.3125C9.875 15.3125 11.75 14.5938 13.2188 13.1875L18.75 17.6562C18.8438 17.75 18.9688 17.7812 19.0938 17.7812C19.25 17.7812 19.4062 17.7188 19.5312 17.5938C19.6875 17.3438 19.6562 17 19.4062 16.8125ZM3.375 12.3438C2.15625 11.125 1.5 9.5 1.5 7.75C1.5 6 2.15625 4.40625 3.40625 3.1875C4.65625 1.9375 6.3125 1.3125 7.96875 1.3125C9.625 1.3125 11.2812 1.9375 12.5312 3.1875C13.75 4.40625 14.4375 6.03125 14.4375 7.75C14.4375 9.46875 13.7188 11.125 12.5 12.3438C10 14.8438 5.90625 14.8438 3.375 12.3438Z"
                        fill="currentColor"
                      />
                    </svg>
                  </button>
                </form>
              </div>

              {/* Categories */}
              <div className="bg-white dark:bg-gray-dark rounded-lg shadow-three dark:shadow-none p-6 mb-8">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                  Categories
                </h3>
                <ul className="space-y-2">
                  {categories.map((category, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handleCategoryChange(category.name)}
                        className={`w-full flex items-center justify-between transition-colors py-2 text-left ${
                          selectedCategory === category.name
                            ? 'text-primary font-medium'
                            : 'text-body-color hover:text-primary'
                        }`}
                      >
                        <span>{category.name}</span>
                        <span className="text-sm">({category.count})</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Latest News */}
              <div className="bg-white dark:bg-gray-dark rounded-lg shadow-three dark:shadow-none p-6 mb-8">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                  Latest News
                </h3>
                <div className="space-y-4">
                  {latestNews.map((news, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded">
                        <Image
                          src={news.image}
                          alt={news.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-black dark:text-white leading-tight mb-1 line-clamp-2">
                          {news.title}
                        </h4>
                        <span className="text-xs text-body-color">
                          {news.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white dark:bg-gray-dark rounded-lg shadow-three dark:shadow-none p-6">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <a
                      key={index}
                      href="#0"
                      className="bg-secondary text-white dark:bg-gray-700 text-body-color dark:text-gray-300 hover:bg-primary hover:text-white transition-all duration-200 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogGridPage;