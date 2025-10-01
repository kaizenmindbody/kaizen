"use client";

import Image from "next/image";
import { useBlogs } from "@/hooks/useBlogs";
import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";

// Skeleton Loading Component for Blog Details Page
const BlogDetailsSkeleton = () => {
  return (
    <section className="font-sans pt-[80px] sm:pt-[150px] pb-[60px] sm:pb-[120px] animate-pulse">
      <div className="container">
        <div className="flex flex-wrap lg:flex-nowrap gap-8">
          {/* Main Content Skeleton */}
          <div className="w-full lg:w-2/3">
            {/* Main Title Skeleton */}
            <div className="mb-8">
              <div className="mb-4 space-y-3">
                <div className="h-8 bg-gray-200 rounded w-4/5"></div>
                <div className="h-8 bg-gray-200 rounded w-3/5"></div>
              </div>
            </div>

            {/* Featured Image Skeleton */}
            <div className="mb-8 overflow-hidden rounded-lg">
              <div className="relative aspect-[16/9] w-full bg-gray-200"></div>
            </div>

            {/* Article Meta Skeleton */}
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </div>
              <div className="bg-gray-200 px-2 py-1 rounded-full w-20 h-6"></div>
            </div>

            {/* Article Content Skeleton */}
            <div className="prose max-w-none">
              <div className="space-y-4 mb-6">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              </div>

              {/* Quote Box Skeleton */}
              <div className="bg-gray-100 border-l-4 border-gray-200 p-6 my-8 rounded-r-lg">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>

              {/* Tags Section Skeleton */}
              <div className="h-6 bg-gray-200 rounded w-16 mb-4"></div>
              <div className="flex flex-wrap gap-2 mb-8">
                {Array.from({ length: 7 }, (_, i) => (
                  <div key={i} className="bg-gray-200 px-3 py-1 rounded-full h-7 w-20"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="w-full lg:w-1/3">
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
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="h-8 bg-gray-200 rounded-full w-16"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const BlogDetailsPage = () => {
  const { blogs: allBlogs, loading, error } = useBlogs();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, _setSelectedCategory] = useState('All');
  const router = useRouter();
  const params = useParams();

  // All hooks must be called before any conditional returns
  const blogId = parseInt(params.id as string);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Find the specific blog
  const currentBlog = useMemo(() => {
    return allBlogs.find(blog => blog.id === blogId);
  }, [allBlogs, blogId]);

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

  // Get latest news (most recent blogs)
  const latestNews = useMemo(() => {
    return [...allBlogs]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 3)
      .map(blog => ({
        id: blog.id,
        title: blog.title,
        image: blog.image,
        date: formatDate(blog.updated_at)
      }));
  }, [allBlogs]);

  // Generate tags from blog data
  const tags = useMemo(() => {
    const uniqueCategories = [...new Set(allBlogs.map(blog => blog.category))];
    return uniqueCategories.slice(0, 7); // Limit to 7 tags
  }, [allBlogs]);

  // Handle loading states (after all hooks are called)
  if (loading) {
    return <BlogDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Error loading blog: {error}</div>
      </div>
    );
  }

  if (!currentBlog) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-body-color">Blog not found</div>
      </div>
    );
  }

  // Search handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/blogs?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCategoryChange = (category: string) => {
    if (category === 'All') {
      router.push('/blogs');
    } else {
      router.push(`/blogs?category=${encodeURIComponent(category)}`);
    }
  };

  return (
    <>
      <section className="font-sans pt-[80px] sm:pt-[150px] pb-[60px] sm:pb-[120px]">
        <div className="container">
          <div className="flex flex-wrap lg:flex-nowrap gap-8">
            {/* Main Content */}
            <div className="w-full lg:w-2/3">
              {/* Main Title */}
              <div className="mb-8">
                <h1 className="mb-4 text-2xl font-bold text-black dark:text-white sm:text-3xl lg:text-4xl">
                  {currentBlog.title}
                </h1>
              </div>
              {/* Featured Image */}
              <div className="mb-8 overflow-hidden rounded-lg">
                <div className="relative aspect-[16/9] w-full bg-gray-200">
                  {currentBlog.image ? (
                    <Image
                      src={currentBlog.image}
                      alt={currentBlog.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-24 h-24 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Article Meta */}
              <div className="mb-8 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {(currentBlog.author || 'A').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-body-color text-sm">{currentBlog.author || 'Anonymous'}</span>
                </div>
                <div className="flex items-center gap-1 text-body-color text-sm">
                  <svg width="14" height="14" viewBox="0 0 15 15" className="fill-current">
                    <path d="M3.89531 8.67529H3.10666C2.96327 8.67529 2.86768 8.77089 2.86768 8.91428V9.67904C2.86768 9.82243 2.96327 9.91802 3.10666 9.91802H3.89531C4.03871 9.91802 4.1343 9.82243 4.1343 9.67904V8.91428C4.1343 8.77089 4.03871 8.67529 3.89531 8.67529Z" />
                    <path d="M13.2637 3.3697H7.64754V2.58105C8.19721 2.43765 8.62738 1.91189 8.62738 1.31442C8.62738 0.597464 8.02992 0 7.28906 0C6.54821 0 5.95074 0.597464 5.95074 1.31442C5.95074 1.91189 6.35702 2.41376 6.93058 2.58105V3.3697H1.31442C0.597464 3.3697 0 3.96716 0 4.68412V13.2637C0 13.9807 0.597464 14.5781 1.31442 14.5781H13.2637C13.9807 14.5781 14.5781 13.9807 14.5781 13.2637V4.68412C14.5781 3.96716 13.9807 3.3697 13.2637 3.3697Z" />
                  </svg>
                  <span>{formatDate(currentBlog.updated_at)}</span>
                </div>
                <div className="flex items-center gap-1 text-body-color text-sm">
                  <svg width="14" height="14" viewBox="0 0 20 12" className="fill-current">
                    <path d="M10.2559 3.8125C9.03711 3.8125 8.06836 4.8125 8.06836 6C8.06836 7.1875 9.06836 8.1875 10.2559 8.1875C11.4434 8.1875 12.4434 7.1875 12.4434 6C12.4434 4.8125 11.4746 3.8125 10.2559 3.8125Z" />
                    <path d="M19.7559 5.625C17.6934 2.375 14.1309 0.4375 10.2559 0.4375C6.38086 0.4375 2.81836 2.375 0.755859 5.625C0.630859 5.84375 0.630859 6.125 0.755859 6.34375C2.81836 9.59375 6.38086 11.5312 10.2559 11.5312C14.1309 11.5312 17.6934 9.59375 19.7559 6.34375C19.9121 6.125 19.9121 5.84375 19.7559 5.625Z" />
                  </svg>
                  <span>1.2K</span>
                </div>
                <div className="flex items-center gap-1 text-body-color text-sm">
                  <svg width="14" height="14" viewBox="0 0 18 13" className="fill-current">
                    <path d="M15.6375 0H1.6875C0.759375 0 0 0.759375 0 1.6875V10.6875C0 11.3062 0.309375 11.8406 0.84375 12.15C1.09687 12.2906 1.40625 12.375 1.6875 12.375C1.96875 12.375 2.25 12.2906 2.53125 12.15L5.00625 10.7156C5.11875 10.6594 5.23125 10.6312 5.34375 10.6312H15.6094C16.5375 10.6312 17.2969 9.87187 17.2969 8.94375V1.6875C17.325 0.759375 16.5656 0 15.6375 0Z" />
                  </svg>
                  <span>24</span>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  {currentBlog.category || 'General'}
                </span>
              </div>

              {/* Article Content */}
              <div className="prose max-w-none">
                <p className="text-body-color mb-6 text-base leading-relaxed">
                  {currentBlog.description}
                </p>

                <p className="text-body-color mb-6 text-base leading-relaxed">
                  This is a detailed view of the blog post. The full content would be displayed here with proper formatting and styling. The blog content can include multiple paragraphs, images, and other rich content elements to provide a comprehensive reading experience for the users.
                </p>

                <div className="bg-blue-50 dark:bg-gray-800 border-l-4 border-primary p-6 my-8 rounded-r-lg">
                  <p className="text-body-color italic text-base font-medium">
                    An extra important note to remember is that consistency is key. Small, sustainable changes in your daily habits will have a more lasting impact than short-term, extreme efforts. Prioritize gradual improvements in your routine and be patient with yourself — lasting health is a marathon, not a sprint.
                  </p>
                </div>

                <h2 className="text-xl font-bold text-black dark:text-white mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Health Tips</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Wellness</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Lifestyle</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Medical</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Nutrition</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Fitness</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Prevention</span>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-1/3">
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
                    <div
                      key={index}
                      className="flex gap-3 cursor-pointer group"
                      onClick={() => router.push(`/blog-details/${news.id}`)}
                    >
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-200">
                        {news.image ? (
                          <Image
                            src={news.image}
                            alt={news.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-black dark:text-white group-hover:text-primary transition-colors leading-tight mb-1 line-clamp-2">
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
                      className="bg-gray-100 dark:bg-gray-700 text-body-color dark:text-gray-300 hover:bg-primary hover:text-white transition-all duration-200 px-3 py-1 rounded-full text-sm"
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

export default BlogDetailsPage;