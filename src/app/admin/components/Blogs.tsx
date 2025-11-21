"use client";

import { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { showToast } from '@/lib/toast';
import { confirmDialog } from 'primereact/confirmdialog';
import { FilterMatchMode } from 'primereact/api';
import { useBlogs } from '@/hooks/useBlogs';
import { BlogPost } from '@/types/blog';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const Blogs = ({ onRefreshData }: { onRefreshData: () => void }) => {
  const { blogs, loading, error, addBlog: addBlogHook, updateBlog: updateBlogHook, deleteBlog: deleteBlogHook } = useBlogs();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newBlog, setNewBlog] = useState({
    title: '',
    description: '',
    image: '',
    author: '',
    category: ''
  });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [editBlogData, setEditBlogData] = useState({
    title: '',
    description: '',
    image: '',
    author: '',
    category: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    title: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const dt = useRef<DataTable<BlogPost[]>>(null);

  const showSuccess = (message: string) => {
    showToast.success(message);
  };

  const showError = (message: string) => {
    showToast.error(message);
  };

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const clearFilter = () => {
    initFilters();
  };

  const initFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      title: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    setGlobalFilterValue('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      setUploadingImage(true);

      // Generate unique filename
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `blogs/${fileName}`;

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('kaizen')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('kaizen')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      showError('Failed to upload image');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const addBlog = async () => {
    if (!newBlog.title.trim()) {
      showError('Title is required');
      return;
    }

    if (!newBlog.description.trim()) {
      showError('Description is required');
      return;
    }

    try {
      // Upload image if exists
      let imageUrl = newBlog.image;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          return; // Upload failed
        }
        imageUrl = uploadedUrl;
      }

      const success = await addBlogHook({ ...newBlog, image: imageUrl });
      if (success) {
        setNewBlog({
          title: '',
          description: '',
          image: '',
          author: '',
          category: ''
        });
        setImageFile(null);
        setImagePreview(null);
        setShowAddDialog(false);
        showSuccess('Blog added successfully');
      } else {
        showError('Error adding blog');
      }
    } catch (error) {
      showError('Error adding blog');
    }
  };

  const openEditDialog = (blog: BlogPost) => {
    setEditingBlog(blog);
    setEditBlogData({
      title: blog.title,
      description: blog.description,
      image: blog.image,
      author: blog.author,
      category: blog.category
    });
    setImageFile(null);
    setImagePreview(blog.image || null);
    setShowEditDialog(true);
  };

  const closeEditDialog = () => {
    setShowEditDialog(false);
    setEditingBlog(null);
    setEditBlogData({
      title: '',
      description: '',
      image: '',
      author: '',
      category: ''
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const editBlog = async () => {
    if (!editingBlog || !editBlogData.title.trim()) {
      showError('Title is required');
      return;
    }

    if (!editBlogData.description.trim()) {
      showError('Description is required');
      return;
    }

    try {
      // Upload new image if exists
      let imageUrl = editBlogData.image;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          return; // Upload failed
        }
        imageUrl = uploadedUrl;
      }

      const success = await updateBlogHook(editingBlog.id, { ...editBlogData, image: imageUrl });
      if (success) {
        closeEditDialog();
        showSuccess('Blog updated successfully');
      } else {
        showError('Error updating blog');
      }
    } catch (error) {
      showError('Error updating blog');
    }
  };

  const confirmDeleteBlog = (blog: BlogPost) => {
    confirmDialog({
      message: `Are you sure you want to delete "${blog.title}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      acceptClassName: 'p-button-danger',
      accept: () => deleteBlogHandler(blog.id),
    });
  };

  const deleteBlogHandler = async (blogId: number) => {
    const success = await deleteBlogHook(blogId);
    if (success) {
      showSuccess('Blog deleted successfully');
    } else {
      showError('Error deleting blog');
    }
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
  };

  const renderHeader = () => {
    return (
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h4 className="text-lg font-semibold text-gray-900 m-0">Manage Blogs</h4>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {blogs.length} total
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <input
                type="text"
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                placeholder="Search blogs..."
                className="px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-64"
              />
              {globalFilterValue && (
                <button
                  onClick={clearFilter}
                  className="px-2 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                >
                  <i className="pi pi-times text-xs"></i>
                </button>
              )}
              {!globalFilterValue && (
                <div className="px-2 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-400">
                  <i className="pi pi-search text-xs"></i>
                </div>
              )}
            </div>
            <button
              onClick={exportCSV}
              className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <i className="pi pi-download mr-2"></i>
              Export CSV
            </button>
          </div>
        </div>
      </div>
    );
  };

  const actionBodyTemplate = (rowData: BlogPost) => {
    return (
      <div className="flex items-center justify-start gap-2">
        <button
          onClick={() => openEditDialog(rowData)}
          className="px-2 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-colors"
          title="Edit Blog"
        >
          <i className="pi pi-pencil text-sm"></i>
        </button>
        <button
          onClick={() => confirmDeleteBlog(rowData)}
          className="px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors"
          title="Delete Blog"
        >
          <i className="pi pi-trash text-sm"></i>
        </button>
      </div>
    );
  };

  const titleBodyTemplate = (rowData: BlogPost) => {
    return (
      <div className="py-3 pl-6">
        <div className="font-medium text-gray-900">{rowData.title}</div>
      </div>
    );
  };

  const descriptionBodyTemplate = (rowData: BlogPost) => {
    return (
      <div className="py-3">
        <div className="text-gray-700 line-clamp-2">{rowData.description}</div>
      </div>
    );
  };

  const categoryBodyTemplate = (rowData: BlogPost) => {
    return (
      <div className="py-3">
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
          {rowData.category || 'General'}
        </span>
      </div>
    );
  };

  const authorBodyTemplate = (rowData: BlogPost) => {
    return (
      <div className="py-3">
        <div className="text-gray-700">{rowData.author || 'Anonymous'}</div>
      </div>
    );
  };

  const imageBodyTemplate = (rowData: BlogPost) => {
    return (
      <div className="py-3 flex justify-center">
        {rowData.image ? (
          <Image
            src={rowData.image}
            alt={rowData.title}
            width={64}
            height={64}
            className="w-16 h-16 object-cover rounded-md"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
            <i className="pi pi-image text-gray-400"></i>
          </div>
        )}
      </div>
    );
  };

  const addDialogFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        outlined
        onClick={() => {
          setShowAddDialog(false);
          setNewBlog({
            title: '',
            description: '',
            image: '',
            author: '',
            category: ''
          });
          setImageFile(null);
          setImagePreview(null);
        }}
        disabled={uploadingImage}
      />
      <Button
        label={uploadingImage ? "Uploading..." : "Add"}
        icon={uploadingImage ? "pi pi-spin pi-spinner" : "pi pi-check"}
        onClick={addBlog}
        disabled={!newBlog.title.trim() || !newBlog.description.trim() || uploadingImage}
        autoFocus
      />
    </div>
  );

  const editDialogFooter = (
    <div>
      <Button
        label="Cancel"
        icon="pi pi-times"
        outlined
        onClick={closeEditDialog}
        disabled={uploadingImage}
      />
      <Button
        label={uploadingImage ? "Uploading..." : "Update"}
        icon={uploadingImage ? "pi pi-spin pi-spinner" : "pi pi-check"}
        onClick={editBlog}
        disabled={!editBlogData.title.trim() || !editBlogData.description.trim() || uploadingImage}
        autoFocus
      />
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Blogs Management</h2>
          <div className="text-sm text-gray-600">Loading...</div>
        </div>
        <div className="bg-white shadow-sm rounded-lg p-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Blogs Management</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading blogs: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Blogs Management</h2>
        <Button
          icon="pi pi-plus"
          label="Add Blog"
          onClick={() => setShowAddDialog(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
        />
      </div>

      {/* DataTable */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <DataTable
          ref={dt}
          value={blogs}
          dataKey="id"
          header={renderHeader()}
          filters={filters}
          filterDisplay="row"
          globalFilterFields={['title', 'description', 'author', 'category']}
          emptyMessage="No blogs found"
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sortMode="single"
          sortField="updated_at"
          sortOrder={-1}
          className="p-datatable-sm"
          stripedRows
        >
          <Column
            header="Image"
            body={imageBodyTemplate}
            style={{ width: '8%' }}
            headerStyle={{ textAlign: 'center' }}
            headerClassName="text-center"
          />
          <Column
            field="title"
            header="Title"
            sortable
            body={titleBodyTemplate}
            style={{ width: '20%' }}
            headerStyle={{ textAlign: 'center', paddingLeft: '24px' }}
            headerClassName="text-center"
          />
          <Column
            field="description"
            header="Description"
            body={descriptionBodyTemplate}
            style={{ width: '30%' }}
            headerStyle={{ textAlign: 'center' }}
            headerClassName="text-center"
          />
          <Column
            field="author"
            header="Author"
            sortable
            body={authorBodyTemplate}
            style={{ width: '12%' }}
            headerStyle={{ textAlign: 'center' }}
            headerClassName="text-center"
          />
          <Column
            field="category"
            header="Category"
            sortable
            body={categoryBodyTemplate}
            style={{ width: '10%' }}
            headerStyle={{ textAlign: 'center' }}
            headerClassName="text-center"
          />
          <Column
            header="Actions"
            body={actionBodyTemplate}
            headerStyle={{ width: '10%', textAlign: 'center' }}
            bodyStyle={{ textAlign: 'center' }}
            headerClassName="text-center"
          />
        </DataTable>
      </div>

      {/* Add Dialog */}
      <Dialog
        header="Add New Blog"
        visible={showAddDialog}
        style={{ width: '700px' }}
        footer={addDialogFooter}
        onHide={() => {
          setShowAddDialog(false);
          setNewBlog({
            title: '',
            description: '',
            image: '',
            author: '',
            category: ''
          });
          setImageFile(null);
          setImagePreview(null);
        }}
        modal
      >
        <div className="p-fluid space-y-4">
          <div className="field">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <InputText
              id="title"
              value={newBlog.title}
              onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
              placeholder="Enter blog title..."
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <InputTextarea
              id="description"
              value={newBlog.description}
              onChange={(e) => setNewBlog({ ...newBlog, description: e.target.value })}
              placeholder="Enter blog description..."
              rows={5}
            />
          </div>
          <div className="field">
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <InputText
              id="author"
              value={newBlog.author}
              onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })}
              placeholder="Enter author name..."
            />
          </div>
          <div className="field">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <InputText
              id="category"
              value={newBlog.category}
              onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
              placeholder="Enter category..."
            />
          </div>
          <div className="field">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Blog Image
            </label>
            <div className="space-y-3">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
              />
              {imagePreview && (
                <div className="relative w-full h-48 border border-gray-300 rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              )}
              <p className="text-xs text-gray-500">Upload an image (max 5MB) or leave empty</p>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        header="Edit Blog"
        visible={showEditDialog}
        style={{ width: '700px' }}
        footer={editDialogFooter}
        onHide={closeEditDialog}
        modal
      >
        <div className="p-fluid space-y-4">
          <div className="field">
            <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <InputText
              id="editTitle"
              value={editBlogData.title}
              onChange={(e) => setEditBlogData({ ...editBlogData, title: e.target.value })}
              placeholder="Enter blog title..."
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <InputTextarea
              id="editDescription"
              value={editBlogData.description}
              onChange={(e) => setEditBlogData({ ...editBlogData, description: e.target.value })}
              placeholder="Enter blog description..."
              rows={5}
            />
          </div>
          <div className="field">
            <label htmlFor="editAuthor" className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <InputText
              id="editAuthor"
              value={editBlogData.author}
              onChange={(e) => setEditBlogData({ ...editBlogData, author: e.target.value })}
              placeholder="Enter author name..."
            />
          </div>
          <div className="field">
            <label htmlFor="editCategory" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <InputText
              id="editCategory"
              value={editBlogData.category}
              onChange={(e) => setEditBlogData({ ...editBlogData, category: e.target.value })}
              placeholder="Enter category..."
            />
          </div>
          <div className="field">
            <label htmlFor="editImage" className="block text-sm font-medium text-gray-700 mb-2">
              Blog Image
            </label>
            <div className="space-y-3">
              <input
                type="file"
                id="editImage"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
              />
              {imagePreview && (
                <div className="relative w-full h-48 border border-gray-300 rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              )}
              <p className="text-xs text-gray-500">Upload a new image (max 5MB) or keep existing</p>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Blogs;
