import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchBlogs as fetchBlogsAction,
  addBlog as addBlogAction,
  updateBlog as updateBlogAction,
  deleteBlog as deleteBlogAction
} from '@/store/slices/blogsSlice';
import { UseBlogsReturn } from '@/types/content';
import { BlogPost } from '@/types/blog';

export function useBlogs(): UseBlogsReturn {
  const dispatch = useAppDispatch();
  const { blogs, loading, error, initialized } = useAppSelector((state) => state.blogs);

  useEffect(() => {
    // Only fetch if data has never been loaded before
    if (!initialized) {
      dispatch(fetchBlogsAction());
    }
  }, [initialized, dispatch]);

  const addBlog = useCallback(async (blogData: Partial<BlogPost>): Promise<boolean> => {
    const result = await dispatch(addBlogAction(blogData));
    return addBlogAction.fulfilled.match(result);
  }, [dispatch]);

  const updateBlog = useCallback(async (id: number, blogData: Partial<BlogPost>): Promise<boolean> => {
    const result = await dispatch(updateBlogAction({ id, blogData }));
    return updateBlogAction.fulfilled.match(result);
  }, [dispatch]);

  const deleteBlog = useCallback(async (id: number): Promise<boolean> => {
    const result = await dispatch(deleteBlogAction(id));
    return deleteBlogAction.fulfilled.match(result);
  }, [dispatch]);

  const refreshBlogs = useCallback(async () => {
    await dispatch(fetchBlogsAction());
  }, [dispatch]);

  return {
    blogs,
    loading,
    error,
    addBlog,
    updateBlog,
    deleteBlog,
    refreshBlogs
  };
}