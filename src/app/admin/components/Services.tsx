"use client";

import { useState, useRef, useMemo } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { showToast } from '@/lib/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { FilterMatchMode } from 'primereact/api';
import { useService, Service } from '@/hooks/useService';

const Services = ({ onRefreshData }: { onRefreshData: () => void }) => {
  const { services, loading, error, addService: addServiceHook, updateService: updateServiceHook, deleteService: deleteServiceHook } = useService();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newServiceType, setNewServiceType] = useState<'real' | 'virtual'>('real');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editServiceTitle, setEditServiceTitle] = useState('');
  const [editServiceType, setEditServiceType] = useState<'real' | 'virtual'>('real');

  const [globalFilterValueReal, setGlobalFilterValueReal] = useState('');
  const [globalFilterValueVirtual, setGlobalFilterValueVirtual] = useState('');
  const [filtersReal, setFiltersReal] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    title: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
  });
  const [filtersVirtual, setFiltersVirtual] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    title: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
  });

  const dtReal = useRef<DataTable<Service[]>>(null);
  const dtVirtual = useRef<DataTable<Service[]>>(null);

  // Filter services by type using useMemo
  const realServices = useMemo(() => {
    return services.filter(service => service.type === 'real');
  }, [services]);

  const virtualServices = useMemo(() => {
    return services.filter(service => service.type === 'virtual');
  }, [services]);

  const serviceTypeOptions = [
    { label: 'Real Visit', value: 'real' },
    { label: 'Virtual Visit', value: 'virtual' }
  ];

  const showSuccess = (message: string) => {
    showToast.success(message);
  };

  const showError = (message: string) => {
    showToast.error(message);
  };

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'real' | 'virtual') => {
    const value = e.target.value;
    if (type === 'real') {
      let _filters = { ...filtersReal };
      _filters['global'].value = value;
      setFiltersReal(_filters);
      setGlobalFilterValueReal(value);
    } else {
      let _filters = { ...filtersVirtual };
      _filters['global'].value = value;
      setFiltersVirtual(_filters);
      setGlobalFilterValueVirtual(value);
    }
  };

  const clearFilter = (type: 'real' | 'virtual') => {
    initFilters(type);
  };

  const initFilters = (type: 'real' | 'virtual') => {
    if (type === 'real') {
      setFiltersReal({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        title: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
      });
      setGlobalFilterValueReal('');
    } else {
      setFiltersVirtual({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        title: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
      });
      setGlobalFilterValueVirtual('');
    }
  };

  const addService = async () => {
    if (!newServiceTitle.trim()) {
      showError('Title is required');
      return;
    }

    const success = await addServiceHook(newServiceTitle, newServiceType);
    if (success) {
      setNewServiceTitle('');
      setNewServiceType('real');
      setShowAddDialog(false);
      showSuccess('Service added successfully');
    } else {
      showError('Error adding service');
    }
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setEditServiceTitle(service.title);
    setEditServiceType(service.type);
    setShowEditDialog(true);
  };

  const closeEditDialog = () => {
    setShowEditDialog(false);
    setEditingService(null);
    setEditServiceTitle('');
    setEditServiceType('real');
  };

  const editService = async () => {
    if (!editingService || !editServiceTitle.trim()) {
      showError('Title is required');
      return;
    }

    const success = await updateServiceHook(editingService.id, editServiceTitle, editServiceType);
    if (success) {
      closeEditDialog();
      showSuccess('Service updated successfully');
    } else {
      showError('Error updating service');
    }
  };

  const confirmDeleteService = (service: Service) => {
    confirmDialog({
      message: `Are you sure you want to delete "${service.title}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      acceptClassName: 'p-button-danger',
      accept: () => deleteServiceHandler(service.id),
    });
  };

  const deleteServiceHandler = async (serviceId: string) => {
    const success = await deleteServiceHook(serviceId);
    if (success) {
      showSuccess('Service deleted successfully');
    } else {
      showError('Error deleting service');
    }
  };

  const exportCSV = (type: 'real' | 'virtual') => {
    if (type === 'real') {
      dtReal.current?.exportCSV();
    } else {
      dtVirtual.current?.exportCSV();
    }
  };

  const renderHeader = (type: 'real' | 'virtual') => {
    const title = type === 'real' ? 'Real Visit Services' : 'Virtual Visit Services';
    const count = type === 'real' ? realServices.length : virtualServices.length;
    const globalFilterValue = type === 'real' ? globalFilterValueReal : globalFilterValueVirtual;

    return (
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h4 className="text-lg font-semibold text-gray-900 m-0">{title}</h4>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {count} total
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <input
                type="text"
                value={globalFilterValue}
                onChange={(e) => onGlobalFilterChange(e, type)}
                placeholder="Search services..."
                className="px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-64"
              />
              {globalFilterValue && (
                <button
                  onClick={() => clearFilter(type)}
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
              onClick={() => exportCSV(type)}
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

  const actionBodyTemplate = (rowData: Service) => {
    return (
      <div className="flex items-center justify-start gap-2" >
        <button
          onClick={() => openEditDialog(rowData)}
          className="px-2 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-colors"
          title="Edit service"
        >
          <i className="pi pi-pencil text-sm"></i>
        </button>
        <button
          onClick={() => confirmDeleteService(rowData)}
          className="px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors"
          title="Delete service"
        >
          <i className="pi pi-trash text-sm"></i>
        </button>
      </div>
    );
  };

  const titleBodyTemplate = (rowData: Service) => {
    return (
      <div className="py-3" style={{ paddingLeft: '1.5rem' }}>
        <div className="font-medium text-gray-900">{rowData.title}</div>
      </div>
    );
  };

  const typeBodyTemplate = (rowData: Service) => {
    const serviceType = rowData.type || 'real';
    return (
      <div className="flex justify-left">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          serviceType === 'real'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {serviceType === 'real' ? 'Real Visit' : 'Virtual Visit'}
        </span>
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
          setNewServiceTitle('');
          setNewServiceType('real');
        }}
      />
      <Button
        label="Add"
        icon="pi pi-check"
        onClick={addService}
        disabled={!newServiceTitle.trim()}
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
        onClick={editService}
        disabled={!editServiceTitle.trim()}
        autoFocus
      />
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Services Management</h2>
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
          <h2 className="text-3xl font-bold text-gray-900">Services Management</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading services: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Services Management</h2>
        <Button
          icon="pi pi-plus"
          label="Add Service"
          onClick={() => setShowAddDialog(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
        />
      </div>

      {/* Two tables in grid layout */}
      <div className="grid grid-cols-1  gap-6">
        {/* Real Visit Services DataTable */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <DataTable
            ref={dtReal}
            value={realServices}
            dataKey="id"
            header={renderHeader('real')}
            filters={filtersReal}
            filterDisplay="row"
            globalFilterFields={['title']}
            emptyMessage="No real visit services found"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sortMode="single"
            sortField="title"
            sortOrder={1}
            className="p-datatable-sm"
            stripedRows
          >
            <Column
              field="title"
              header="Service Title"
              sortable
              body={titleBodyTemplate}
              style={{ width: '50%' }}
              headerStyle={{ textAlign: 'left', paddingLeft: '1.5rem' }}
              headerClassName="text-left"
            />
            <Column
              field="type"
              header="Type"
              sortable
              body={typeBodyTemplate}
              style={{ width: '25%' }}
              headerStyle={{ textAlign: 'center' }}
              bodyStyle={{ textAlign: 'center' }}
              headerClassName="text-center"
            />
            <Column
              header="Actions"
              body={actionBodyTemplate}
              headerStyle={{ width: '25%', textAlign: 'center' }}
              bodyStyle={{ textAlign: 'center' }}
              headerClassName="text-center"
            />
          </DataTable>
        </div>

        {/* Virtual Visit Services DataTable */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <DataTable
            ref={dtVirtual}
            value={virtualServices}
            dataKey="id"
            header={renderHeader('virtual')}
            filters={filtersVirtual}
            filterDisplay="row"
            globalFilterFields={['title']}
            emptyMessage="No virtual visit services found"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sortMode="single"
            sortField="title"
            sortOrder={1}
            className="p-datatable-sm"
            stripedRows
          >
            <Column
              field="title"
              header="Service Title"
              sortable
              body={titleBodyTemplate}
              style={{ width: '50%' }}
              headerStyle={{ textAlign: 'left', paddingLeft: '1.5rem' }}
              headerClassName="text-left"
            />
            <Column
              field="type"
              header="Type"
              sortable
              body={typeBodyTemplate}
              style={{ width: '25%' }}
              headerStyle={{ textAlign: 'center' }}
              bodyStyle={{ textAlign: 'center' }}
              headerClassName="text-center"
            />
            <Column
              header="Actions"
              body={actionBodyTemplate}
              headerStyle={{ width: '25%', textAlign: 'center' }}
              bodyStyle={{ textAlign: 'center' }}
              headerClassName="text-center"
            />
          </DataTable>
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog
        header="Add New Service"
        visible={showAddDialog}
        style={{ width: '450px' }}
        footer={addDialogFooter}
        onHide={() => {
          setShowAddDialog(false);
          setNewServiceTitle('');
          setNewServiceType('real');
        }}
        modal
      >
        <div className="p-fluid">
          <div className="field mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Service Title
            </label>
            <InputText
              id="title"
              value={newServiceTitle}
              onChange={(e) => setNewServiceTitle(e.target.value)}
              placeholder="Enter service title..."
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && addService()}
            />
          </div>
          <div className="field">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Service Type
            </label>
            <Dropdown
              id="type"
              value={newServiceType}
              options={serviceTypeOptions}
              onChange={(e) => setNewServiceType(e.value)}
              placeholder="Select service type"
            />
          </div>
        </div>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        header="Edit Service"
        visible={showEditDialog}
        style={{ width: '450px' }}
        footer={editDialogFooter}
        onHide={closeEditDialog}
        modal
      >
        <div className="p-fluid">
          <div className="field mb-4">
            <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Service Title
            </label>
            <InputText
              id="editTitle"
              value={editServiceTitle}
              onChange={(e) => setEditServiceTitle(e.target.value)}
              placeholder="Enter service title..."
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && editService()}
            />
          </div>
          <div className="field">
            <label htmlFor="editType" className="block text-sm font-medium text-gray-700 mb-2">
              Service Type
            </label>
            <Dropdown
              id="editType"
              value={editServiceType}
              options={serviceTypeOptions}
              onChange={(e) => setEditServiceType(e.value)}
              placeholder="Select service type"
            />
          </div>
        </div>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default Services;
