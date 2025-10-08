"use client";

import { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import toast from 'react-hot-toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { FilterMatchMode } from 'primereact/api';
import { usePractitionerTypes } from '@/hooks/usePractitionerTypes';
import { PractitionerType } from '@/store/slices/practitionerTypesSlice';

const PractitionerTypes = ({ onRefreshData }: { onRefreshData: () => void }) => {
  const { practitionerTypes, loading, error, addPractitionerType: addTypeHook, updatePractitionerType: updateTypeHook, deletePractitionerType: deleteTypeHook } = usePractitionerTypes();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTypeTitle, setNewTypeTitle] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingType, setEditingType] = useState<PractitionerType | null>(null);
  const [editTypeTitle, setEditTypeTitle] = useState('');
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    title: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
  });
  const dt = useRef<DataTable<PractitionerType[]>>(null);

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
      title: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
    });
    setGlobalFilterValue('');
  };

  const addType = async () => {
    if (!newTypeTitle.trim()) {
      showError('Title is required');
      return;
    }

    const success = await addTypeHook(newTypeTitle);
    if (success) {
      setNewTypeTitle('');
      setShowAddDialog(false);
      showSuccess('Practitioner type added successfully');
    } else {
      showError('Error adding practitioner type');
    }
  };

  const openEditDialog = (type: PractitionerType) => {
    setEditingType(type);
    setEditTypeTitle(type.title);
    setShowEditDialog(true);
  };

  const closeEditDialog = () => {
    setShowEditDialog(false);
    setEditingType(null);
    setEditTypeTitle('');
  };

  const editType = async () => {
    if (!editingType || !editTypeTitle.trim()) {
      showError('Title is required');
      return;
    }

    const success = await updateTypeHook(editingType.id, editTypeTitle);
    if (success) {
      closeEditDialog();
      showSuccess('Practitioner type updated successfully');
    } else {
      showError('Error updating practitioner type');
    }
  };

  const confirmDeleteType = (type: PractitionerType) => {
    confirmDialog({
      message: `Are you sure you want to delete "${type.title}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      acceptClassName: 'p-button-danger',
      accept: () => deleteTypeHandler(type.id),
    });
  };

  const deleteTypeHandler = async (typeId: string) => {
    const success = await deleteTypeHook(typeId);
    if (success) {
      showSuccess('Practitioner type deleted successfully');
    } else {
      showError('Error deleting practitioner type');
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
            <h4 className="text-lg font-semibold text-gray-900 m-0">Manage Practitioner Types</h4>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {practitionerTypes.length} total
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <input
                type="text"
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                placeholder="Search practitioner types..."
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

  const actionBodyTemplate = (rowData: PractitionerType) => {
    return (
      <div className="flex items-center justify-start gap-2">
        <button
          onClick={() => openEditDialog(rowData)}
          className="px-2 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-colors"
          title="Edit practitioner type"
        >
          <i className="pi pi-pencil text-sm"></i>
        </button>
        <button
          onClick={() => confirmDeleteType(rowData)}
          className="px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors"
          title="Delete practitioner type"
        >
          <i className="pi pi-trash text-sm"></i>
        </button>
      </div>
    );
  };

  const titleBodyTemplate = (rowData: PractitionerType) => {
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
          setNewTypeTitle('');
        }}
      />
      <Button
        label="Add"
        icon="pi pi-check"
        onClick={addType}
        disabled={!newTypeTitle.trim()}
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
        onClick={editType}
        disabled={!editTypeTitle.trim()}
        autoFocus
      />
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Practitioner Types Management</h2>
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
          <h2 className="text-3xl font-bold text-gray-900">Practitioner Types Management</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading practitioner types: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Practitioner Types Management</h2>
        <Button
          icon="pi pi-plus"
          label="Add Practitioner Type"
          onClick={() => setShowAddDialog(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
        />
      </div>

      {/* DataTable */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <DataTable
          ref={dt}
          value={practitionerTypes}
          dataKey="id"
          header={renderHeader()}
          filters={filters}
          filterDisplay="row"
          globalFilterFields={['title']}
          emptyMessage="No practitioner types found"
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
        header="Add New Practitioner Type"
        visible={showAddDialog}
        style={{ width: '450px' }}
        footer={addDialogFooter}
        onHide={() => {
          setShowAddDialog(false);
          setNewTypeTitle('');
        }}
        modal
      >
        <div className="p-fluid">
          <div className="field">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Practitioner Type Title
            </label>
            <InputText
              id="title"
              value={newTypeTitle}
              onChange={(e) => setNewTypeTitle(e.target.value)}
              placeholder="e.g., Psychologist, Psychiatrist..."
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && addType()}
            />
          </div>
        </div>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        header="Edit Practitioner Type"
        visible={showEditDialog}
        style={{ width: '450px' }}
        footer={editDialogFooter}
        onHide={closeEditDialog}
        modal
      >
        <div className="p-fluid">
          <div className="field">
            <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Practitioner Type Title
            </label>
            <InputText
              id="editTitle"
              value={editTypeTitle}
              onChange={(e) => setEditTypeTitle(e.target.value)}
              placeholder="e.g., Psychologist, Psychiatrist..."
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && editType()}
            />
          </div>
        </div>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </div>
  );
};

export default PractitionerTypes;
