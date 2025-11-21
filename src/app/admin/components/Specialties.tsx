"use client";

import { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { showToast } from '@/lib/toast';
import { confirmDialog } from 'primereact/confirmdialog';
import { FilterMatchMode } from 'primereact/api';
import { useSpecialty } from '@/hooks/useSpecialty';
import { Specialty } from '@/types/user';

const Specialties = ({ onRefreshData }: { onRefreshData: () => void }) => {
  const { specialties, loading, error, addSpecialty: addSpecialtyHook, updateSpecialty: updateSpecialtyHook, deleteSpecialty: deleteSpecialtyHook } = useSpecialty();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSpecialtyTitle, setNewSpecialtyTitle] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [editSpecialtyTitle, setEditSpecialtyTitle] = useState('');
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    title: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
  });
  const dt = useRef<DataTable<Specialty[]>>(null);

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
      title: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
    });
    setGlobalFilterValue('');
  };

  const addSpecialty = async () => {
    if (!newSpecialtyTitle.trim()) {
      showError('Title is required');
      return;
    }

    const success = await addSpecialtyHook(newSpecialtyTitle);
    if (success) {
      setNewSpecialtyTitle('');
      setShowAddDialog(false);
      showSuccess('Specialty added successfully');
    } else {
      showError('Error adding specialty');
    }
  };

  const openEditDialog = (specialty: Specialty) => {
    setEditingSpecialty(specialty);
    setEditSpecialtyTitle(specialty.title);
    setShowEditDialog(true);
  };

  const closeEditDialog = () => {
    setShowEditDialog(false);
    setEditingSpecialty(null);
    setEditSpecialtyTitle('');
  };

  const editSpecialty = async () => {
    if (!editingSpecialty || !editSpecialtyTitle.trim()) {
      showError('Title is required');
      return;
    }

    const success = await updateSpecialtyHook(editingSpecialty.id, editSpecialtyTitle);
    if (success) {
      closeEditDialog();
      showSuccess('Specialty updated successfully');
    } else {
      showError('Error updating specialty');
    }
  };


  const confirmDeleteSpecialty = (specialty: Specialty) => {
    confirmDialog({
      message: `Are you sure you want to delete "${specialty.title}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      acceptClassName: 'p-button-danger',
      accept: () => deleteSpecialtyHandler(specialty.id),
    });
  };

  const deleteSpecialtyHandler = async (specialtyId: string) => {
    const success = await deleteSpecialtyHook(specialtyId);
    if (success) {
      showSuccess('Specialty deleted successfully');
    } else {
      showError('Error deleting specialty');
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
            <h4 className="text-lg font-semibold text-gray-900 m-0">Manage Specialties</h4>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {specialties.length} total
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <input
                type="text"
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                placeholder="Search specialties..."
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


  const actionBodyTemplate = (rowData: Specialty) => {
    return (
      <div className="flex items-center justify-start gap-2">
        <button
          onClick={() => openEditDialog(rowData)}
          className="px-2 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-colors"
          title="Edit specialty"
        >
          <i className="pi pi-pencil text-sm"></i>
        </button>
        <button
          onClick={() => confirmDeleteSpecialty(rowData)}
          className="px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors"
          title="Delete specialty"
        >
          <i className="pi pi-trash text-sm"></i>
        </button>
      </div>
    );
  };

  const titleBodyTemplate = (rowData: Specialty) => {
    return (
      <div className="py-3 pl-6">
        <div className="font-medium text-gray-900">{rowData.title}</div>
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
          setNewSpecialtyTitle('');
        }}
      />
      <Button
        label="Add"
        icon="pi pi-check"
        onClick={addSpecialty}
        disabled={!newSpecialtyTitle.trim()}
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
        onClick={editSpecialty}
        disabled={!editSpecialtyTitle.trim()}
        autoFocus
      />
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Specialties Management</h2>
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
          <h2 className="text-3xl font-bold text-gray-900">Specialties Management</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading specialties: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Specialties Management</h2>
        <Button
          icon="pi pi-plus"
          label="Add Specialty"
          onClick={() => setShowAddDialog(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
        />
      </div>

      {/* DataTable */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <DataTable
          ref={dt}
          value={specialties}
          dataKey="id"
          header={renderHeader()}
          filters={filters}
          filterDisplay="row"
          globalFilterFields={['title']}
          emptyMessage="No specialties found"
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
            header="Title"
            sortable
            body={titleBodyTemplate}
            style={{ width: '70%' }}
            headerStyle={{ textAlign: 'center', paddingLeft: '24px' }}
            headerClassName="text-center"
          />
          <Column
            header="Actions"
            body={actionBodyTemplate}
            headerStyle={{ width: '30%', textAlign: 'center' }}
            bodyStyle={{ textAlign: 'center' }}
            headerClassName="text-center"
          />
        </DataTable>
      </div>

      {/* Add Dialog */}
      <Dialog
        header="Add New Specialty"
        visible={showAddDialog}
        style={{ width: '450px' }}
        footer={addDialogFooter}
        onHide={() => {
          setShowAddDialog(false);
          setNewSpecialtyTitle('');
        }}
        modal
      >
        <div className="p-fluid">
          <div className="field">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Specialty Title
            </label>
            <InputText
              id="title"
              value={newSpecialtyTitle}
              onChange={(e) => setNewSpecialtyTitle(e.target.value)}
              placeholder="Enter specialty title..."
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
            />
          </div>
        </div>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        header="Edit Specialty"
        visible={showEditDialog}
        style={{ width: '450px' }}
        footer={editDialogFooter}
        onHide={closeEditDialog}
        modal
      >
        <div className="p-fluid">
          <div className="field">
            <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Specialty Title
            </label>
            <InputText
              id="editTitle"
              value={editSpecialtyTitle}
              onChange={(e) => setEditSpecialtyTitle(e.target.value)}
              placeholder="Enter specialty title..."
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && editSpecialty()}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Specialties;