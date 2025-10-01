"use client";

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

import { useState, useRef, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import toast from 'react-hot-toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { FilterMatchMode } from 'primereact/api';
import { useClinics } from '@/hooks/useClinics';
import { Clinic } from '@/types/clinic';
import { supabase } from '@/lib/supabase';
import { MultiSelect } from 'primereact/multiselect';
import dynamic from 'next/dynamic';
import { useAppSelector } from '@/store/hooks';

const Autocomplete = dynamic(
  () => import('@react-google-maps/api').then(mod => ({ default: mod.Autocomplete })),
  {
    ssr: false,
    loading: () => <input
      type="text"
      placeholder="Loading address autocomplete..."
      className="w-full px-3 py-3 border rounded-lg bg-gray-100 border-gray-300"
      disabled
    />
  }
);

const Clinics = ({ onRefreshData }: { onRefreshData: () => void | Promise<void> }) => {
  const { clinics, loading, error, addClinic: addClinicHook, updateClinic: updateClinicHook, deleteClinic: deleteClinicHook } = useClinics();
  const users = useAppSelector((state) => state.users.users);
  const practitioners = users.filter(user => user.user_type === 'practitioner');

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newClinic, setNewClinic] = useState({
    service: '',
    location: '',
    image: '',
    member: ''
  });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [editClinicData, setEditClinicData] = useState({
    service: '',
    location: '',
    image: '',
    member: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Google Maps Autocomplete states
  const [autocompleteAdd, setAutocompleteAdd] = useState<google.maps.places.Autocomplete | null>(null);
  const [autocompleteEdit, setAutocompleteEdit] = useState<google.maps.places.Autocomplete | null>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [editLocationInput, setEditLocationInput] = useState('');

  // Selected practitioners states
  const [selectedPractitioners, setSelectedPractitioners] = useState<string[]>([]);
  const [editSelectedPractitioners, setEditSelectedPractitioners] = useState<string[]>([]);

  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    service: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    location: { value: null, matchMode: FilterMatchMode.CONTAINS },
    member: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const dt = useRef<DataTable<Clinic[]>>(null);

  // Check if Google Maps is loaded
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        setIsGoogleMapsLoaded(true);
      } else {
        setTimeout(checkGoogleMaps, 100);
      }
    };
    checkGoogleMaps();
  }, []);

  const showSuccess = (message: string) => {
    toast.success(message);
  };

  const showError = (message: string) => {
    toast.error(message);
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
      service: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
      location: { value: null, matchMode: FilterMatchMode.CONTAINS },
      member: { value: null, matchMode: FilterMatchMode.CONTAINS }
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
      const filePath = `clinics/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      showError('Failed to upload image');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const onLoadAutocompleteAdd = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocompleteAdd(autocompleteInstance);
  };

  const onLoadAutocompleteEdit = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocompleteEdit(autocompleteInstance);
  };

  const onPlaceChanged = () => {
    if (autocompleteAdd !== null) {
      const place = autocompleteAdd.getPlace();
      if (place.formatted_address) {
        setLocationInput(place.formatted_address);
        setNewClinic({ ...newClinic, location: place.formatted_address });
      }
    }
  };

  const onEditPlaceChanged = () => {
    if (autocompleteEdit !== null) {
      const place = autocompleteEdit.getPlace();
      if (place.formatted_address) {
        setEditLocationInput(place.formatted_address);
        setEditClinicData({ ...editClinicData, location: place.formatted_address });
      }
    }
  };

  const addClinic = async () => {
    if (!newClinic.service.trim()) {
      showError('Service is required');
      return;
    }

    try {
      // Upload image if exists
      let imageUrl = '';
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          return; // Upload failed
        }
        imageUrl = uploadedUrl;
      }

      const clinicData = {
        ...newClinic,
        location: locationInput,
        image: imageUrl,
        member: JSON.stringify(selectedPractitioners)
      };

      const success = await addClinicHook(clinicData);
      if (success) {
        setNewClinic({
          service: '',
          location: '',
          image: '',
          member: ''
        });
        setLocationInput('');
        setSelectedPractitioners([]);
        setImageFile(null);
        setImagePreview(null);
        setShowAddDialog(false);
        showSuccess('Clinic added successfully');
      } else {
        showError('Error adding clinic');
      }
    } catch (error) {
      showError('Error adding clinic');
    }
  };

  const openEditDialog = (clinic: Clinic) => {
    setEditingClinic(clinic);
    setEditClinicData({
      service: clinic.service,
      location: clinic.location || '',
      image: clinic.image || '',
      member: clinic.member || ''
    });
    setEditLocationInput(clinic.location || '');

    // Parse members from JSON string
    try {
      const members = clinic.member ? JSON.parse(clinic.member) : [];
      setEditSelectedPractitioners(Array.isArray(members) ? members : []);
    } catch (e) {
      // If member is not JSON, treat as empty array
      setEditSelectedPractitioners([]);
    }

    setImageFile(null);
    setImagePreview(null);
    setShowEditDialog(true);
  };

  const closeEditDialog = () => {
    setShowEditDialog(false);
    setEditingClinic(null);
    setEditClinicData({
      service: '',
      location: '',
      image: '',
      member: ''
    });
    setEditLocationInput('');
    setEditSelectedPractitioners([]);
    setImageFile(null);
    setImagePreview(null);
  };

  const editClinic = async () => {
    if (!editingClinic || !editClinicData.service.trim()) {
      showError('Service is required');
      return;
    }

    try {
      // Upload new image if exists
      let imageUrl = editClinicData.image;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (!uploadedUrl) {
          return; // Upload failed
        }
        imageUrl = uploadedUrl;
      }

      const updatedData = {
        ...editClinicData,
        location: editLocationInput,
        image: imageUrl,
        member: JSON.stringify(editSelectedPractitioners)
      };

      const success = await updateClinicHook(editingClinic.id, updatedData);
      if (success) {
        closeEditDialog();
        showSuccess('Clinic updated successfully');
      } else {
        showError('Error updating clinic');
      }
    } catch (error) {
      showError('Error updating clinic');
    }
  };

  const confirmDeleteClinic = (clinic: Clinic) => {
    confirmDialog({
      message: `Are you sure you want to delete "${clinic.service}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      acceptClassName: 'p-button-danger',
      accept: () => deleteClinicHandler(clinic.id),
    });
  };

  const deleteClinicHandler = async (clinicId: number) => {
    const success = await deleteClinicHook(clinicId);
    if (success) {
      showSuccess('Clinic deleted successfully');
    } else {
      showError('Error deleting clinic');
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
            <h4 className="text-lg font-semibold text-gray-900 m-0">Manage Clinics</h4>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {clinics.length} total
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <input
                type="text"
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                placeholder="Search clinics..."
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

  const actionBodyTemplate = (rowData: Clinic) => {
    return (
      <div className="flex items-center justify-start gap-2 py-3">
        <button
          onClick={() => openEditDialog(rowData)}
          className="px-2 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-colors"
          title="Edit clinic"
        >
          <i className="pi pi-pencil text-sm"></i>
        </button>
        <button
          onClick={() => confirmDeleteClinic(rowData)}
          className="px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors"
          title="Delete clinic"
        >
          <i className="pi pi-trash text-sm"></i>
        </button>
      </div>
    );
  };

  const serviceBodyTemplate = (rowData: Clinic) => {
    return (
      <div className="py-3 pl-6">
        <div className="font-medium text-gray-900">{rowData.service}</div>
      </div>
    );
  };

  const locationBodyTemplate = (rowData: Clinic) => {
    return (
      <div className="py-3">
        <div className="text-gray-700">{rowData.location || '-'}</div>
      </div>
    );
  };

  const memberBodyTemplate = (rowData: Clinic) => {
    let practitionerNames: string[] = [];
    try {
      const memberIds = rowData.member ? JSON.parse(rowData.member) : [];
      if (Array.isArray(memberIds) && memberIds.length > 0) {
        practitionerNames = memberIds
          .map(id => {
            const practitioner = practitioners.find(p => p.id === id);
            return practitioner ? (practitioner.full_name || practitioner.email) : null;
          })
          .filter(name => name !== null) as string[];
      }
    } catch (e) {
      // If not JSON, show raw value
      practitionerNames = rowData.member ? [rowData.member] : [];
    }

    return (
      <div className="py-3">
        <div className="text-gray-700">
          {practitionerNames.length > 0 ? practitionerNames.join(', ') : '-'}
        </div>
      </div>
    );
  };
  const imageBodyTemplate = (rowData: Clinic) => {
    return (
      <div className="py-3">
        {rowData.image ? (
          <img
            src={rowData.image}
            alt={rowData.service}
            className="h-10 w-10 object-cover rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/placeholder.png';
            }}
          />
        ) : (
          <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
            No image
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
          setNewClinic({
            service: '',
            location: '',
            image: '',
            member: ''
          });
        }}
      />
      <Button
        label="Add"
        icon="pi pi-check"
        onClick={addClinic}
        disabled={!newClinic.service.trim()}
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
      />
      <Button
        label="Update"
        icon="pi pi-check"
        onClick={editClinic}
        disabled={!editClinicData.service.trim()}
        autoFocus
      />
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Clinics Management</h2>
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
          <h2 className="text-3xl font-bold text-gray-900">Clinics Management</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading clinics: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Clinics Management</h2>
        <Button
          icon="pi pi-plus"
          label="Add Clinic"
          onClick={() => setShowAddDialog(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
        />
      </div>

      {/* DataTable */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <DataTable
          ref={dt}
          value={clinics}
          dataKey="id"
          header={renderHeader()}
          filters={filters}
          filterDisplay="row"
          globalFilterFields={['service', 'location', 'member']}
          emptyMessage="No clinics found"
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sortMode="single"
          sortField="service"
          sortOrder={1}
          className="p-datatable-sm"
          stripedRows
        >
          <Column
            field="service"
            header="Service"
            sortable
            body={serviceBodyTemplate}
            style={{ width: '25%' }}
            headerStyle={{ textAlign: 'center', paddingLeft: '24px' }}
            headerClassName="text-center"
          />
          <Column
            field="location"
            header="Location"
            sortable
            body={locationBodyTemplate}
            style={{ width: '18%' }}
            headerStyle={{ textAlign: 'center' }}
            headerClassName="text-center"
          />
          <Column
            field="image"
            header="Image"
            body={imageBodyTemplate}
            style={{ width: '10%' }}
            headerStyle={{ textAlign: 'center' }}
            headerClassName="text-center"
          />
          <Column
            field="member"
            header="Practitioners"
            sortable
            body={memberBodyTemplate}
            style={{ width: '18%' }}
            headerStyle={{ textAlign: 'center' }}
            headerClassName="text-center"
          />
          <Column
            header="Actions"
            body={actionBodyTemplate}
            headerStyle={{ width: '14%', textAlign: 'center', paddingRight: '24px' }}
            bodyStyle={{ textAlign: 'center' }}
            headerClassName="text-center"
          />
        </DataTable>
      </div>

      {/* Add Dialog */}
      <Dialog
        header="Add New Clinic"
        visible={showAddDialog}
        style={{ width: '500px' }}
        footer={addDialogFooter}
        onHide={() => {
          setShowAddDialog(false);
          setNewClinic({
            service: '',
            location: '',
            image: '',
            member: ''
          });
          setLocationInput('');
          setSelectedPractitioners([]);
          setImageFile(null);
          setImagePreview(null);
        }}
        modal
      >
        <div className="p-fluid">
          <div className="field mb-4">
            <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
              Service <span className="text-red-500">*</span>
            </label>
            <InputText
              id="service"
              value={newClinic.service}
              onChange={(e) => setNewClinic({ ...newClinic, service: e.target.value })}
              placeholder="Enter service name..."
              autoFocus
            />
          </div>
          <div className="field mb-4">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            {isGoogleMapsLoaded ? (
              <Autocomplete
                onLoad={onLoadAutocompleteAdd}
                onPlaceChanged={onPlaceChanged}
              >
                <input
                  type="text"
                  id="location"
                  value={locationInput}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setLocationInput(newValue);
                    setNewClinic({ ...newClinic, location: newValue });
                  }}
                  placeholder="Enter clinic location..."
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                />
              </Autocomplete>
            ) : (
              <input
                type="text"
                id="location"
                value={locationInput}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setLocationInput(newValue);
                  setNewClinic({ ...newClinic, location: newValue });
                }}
                placeholder="Loading Google Maps..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 border-gray-300"
                disabled
              />
            )}
          </div>
          <div className="field mb-4">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Clinic Image
            </label>
            <div className="space-y-2">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {imagePreview && (
                <div className="relative mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <i className="pi pi-times text-xs"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="field mb-4">
            <label htmlFor="member" className="block text-sm font-medium text-gray-700 mb-2">
              Practitioners
            </label>
            <MultiSelect
              id="member"
              value={selectedPractitioners}
              options={practitioners.map(p => ({ label: p.full_name || p.email, value: p.id }))}
              onChange={(e) => setSelectedPractitioners(e.value)}
              placeholder="Select practitioners..."
              display="chip"
              className="w-full"
              filter
            />
          </div>
        </div>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        header="Edit Clinic"
        visible={showEditDialog}
        style={{ width: '500px' }}
        footer={editDialogFooter}
        onHide={closeEditDialog}
        modal
      >
        <div className="p-fluid">
          <div className="field mb-4">
            <label htmlFor="editService" className="block text-sm font-medium text-gray-700 mb-2">
              Service <span className="text-red-500">*</span>
            </label>
            <InputText
              id="editService"
              value={editClinicData.service}
              onChange={(e) => setEditClinicData({ ...editClinicData, service: e.target.value })}
              placeholder="Enter service name..."
              autoFocus
            />
          </div>
          <div className="field mb-4">
            <label htmlFor="editLocation" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            {isGoogleMapsLoaded ? (
              <Autocomplete
                onLoad={onLoadAutocompleteEdit}
                onPlaceChanged={onEditPlaceChanged}
              >
                <input
                  type="text"
                  id="editLocation"
                  value={editLocationInput}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setEditLocationInput(newValue);
                    setEditClinicData({ ...editClinicData, location: newValue });
                  }}
                  placeholder="Enter clinic location..."
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                />
              </Autocomplete>
            ) : (
              <input
                type="text"
                id="editLocation"
                value={editLocationInput}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setEditLocationInput(newValue);
                  setEditClinicData({ ...editClinicData, location: newValue });
                }}
                placeholder="Loading Google Maps..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 border-gray-300"
                disabled
              />
            )}
          </div>
          <div className="field mb-4">
            <label htmlFor="editImage" className="block text-sm font-medium text-gray-700 mb-2">
              Clinic Image
            </label>
            <div className="space-y-2">
              {editClinicData.image && !imagePreview && (
                <div className="relative">
                  <img
                    src={editClinicData.image}
                    alt="Current"
                    className="w-full h-48 object-cover rounded border border-gray-200"
                  />
                  <p className="text-xs text-gray-500 mt-1">Current image</p>
                </div>
              )}
              <input
                type="file"
                id="editImage"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {imagePreview && (
                <div className="relative mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded border border-gray-200"
                  />
                  <p className="text-xs text-gray-500 mt-1">New image preview</p>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <i className="pi pi-times text-xs"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="field mb-4">
            <label htmlFor="editMember" className="block text-sm font-medium text-gray-700 mb-2">
              Practitioners
            </label>
            <MultiSelect
              id="editMember"
              value={editSelectedPractitioners}
              options={practitioners.map(p => ({ label: p.full_name || p.email, value: p.id }))}
              onChange={(e) => setEditSelectedPractitioners(e.value)}
              placeholder="Select practitioners..."
              display="chip"
              className="w-full"
              filter
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Clinics;