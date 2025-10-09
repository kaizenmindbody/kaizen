"use client";

import { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import toast from 'react-hot-toast';
import { confirmDialog } from 'primereact/confirmdialog';
import { FilterMatchMode } from 'primereact/api';
import { useDegrees } from '@/hooks/useDegrees';
import { Degree } from '@/types/user';

const Degrees = ({ onRefreshData }: { onRefreshData: () => void }) => {
  const { degrees, loading, error, addDegree: addDegreeHook, updateDegree: updateDegreeHook, deleteDegree: deleteDegreeHook } = useDegrees();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newDegreeTitle, setNewDegreeTitle] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingDegree, setEditingDegree] = useState<Degree | null>(null);
  const [editDegreeTitle, setEditDegreeTitle] = useState('');
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    title: { value: null, matchMode: FilterMatchMode.STARTS_WITH }
  });
  const dt = useRef<DataTable<Degree[]>>(null);

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

  const addDegree = async () => {
    if (!newDegreeTitle.trim()) {
      showError('Title is required');
      return;
    }

    const success = await addDegreeHook(newDegreeTitle);
    if (success) {
      setNewDegreeTitle('');
      setShowAddDialog(false);
      showSuccess('Degree added successfully');
    } else {
      showError('Error adding degree');
    }
  };

  const openEditDialog = (degree: Degree) => {
    setEditingDegree(degree);
    setEditDegreeTitle(degree.title);
    setShowEditDialog(true);
  };

  const closeEditDialog = () => {
    setShowEditDialog(false);
    setEditingDegree(null);
    setEditDegreeTitle('');
  };

  const editDegree = async () => {
    if (!editingDegree || !editDegreeTitle.trim()) {
      showError('Title is required');
      return;
    }

    const success = await updateDegreeHook(editingDegree.id, editDegreeTitle);
    if (success) {
      closeEditDialog();
      showSuccess('Degree updated successfully');
    } else {
      showError('Error updating degree');
    }
  };

  const confirmDeleteDegree = (degree: Degree) => {
    confirmDialog({
      message: `Are you sure you want to delete "${degree.title}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      acceptClassName: 'p-button-danger',
      accept: () => deleteDegreeHandler(degree.id),
    });
  };

  const deleteDegreeHandler = async (degreeId: string) => {
    const success = await deleteDegreeHook(degreeId);
    if (success) {
      showSuccess('Degree deleted successfully');
    } else {
      showError('Error deleting degree');
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
            <h4 className="text-lg font-semibold text-gray-900 m-0">Manage Degrees</h4>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {degrees.length} total
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <input
                type="text"
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                placeholder="Search degrees..."
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


  const actionBodyTemplate = (rowData: Degree) => {
    return (
      <div className="flex items-center justify-start gap-2">
        <button
          onClick={() => openEditDialog(rowData)}
          className="px-2 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-colors"
          title="Edit degree"
        >
          <i className="pi pi-pencil text-sm"></i>
        </button>
        <button
          onClick={() => confirmDeleteDegree(rowData)}
          className="px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors"
          title="Delete degree"
        >
          <i className="pi pi-trash text-sm"></i>
        </button>
      </div>
    );
  };

  const titleBodyTemplate = (rowData: Degree) => {
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
          setNewDegreeTitle('');
        }}
      />
      <Button
        label="Add"
        icon="pi pi-check"
        onClick={addDegree}
        disabled={!newDegreeTitle.trim()}
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
        onClick={editDegree}
        disabled={!editDegreeTitle.trim()}
        autoFocus
      />
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Degrees Management</h2>
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
          <h2 className="text-3xl font-bold text-gray-900">Degrees Management</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading degrees: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Degrees Management</h2>
        <Button
          icon="pi pi-plus"
          label="Add Degree"
          onClick={() => setShowAddDialog(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
        />
      </div>

      {/* DataTable */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <DataTable
          ref={dt}
          value={degrees}
          dataKey="id"
          header={renderHeader()}
          filters={filters}
          filterDisplay="row"
          globalFilterFields={['title']}
          emptyMessage="No degrees found"
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
        header="Add New Degree"
        visible={showAddDialog}
        style={{ width: '450px' }}
        footer={addDialogFooter}
        onHide={() => {
          setShowAddDialog(false);
          setNewDegreeTitle('');
        }}
        modal
      >
        <div className="p-fluid">
          <div className="field">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Degree Title
            </label>
            <InputText
              id="title"
              value={newDegreeTitle}
              onChange={(e) => setNewDegreeTitle(e.target.value)}
              placeholder="Enter degree title..."
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && addDegree()}
            />
          </div>
        </div>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        header="Edit Degree"
        visible={showEditDialog}
        style={{ width: '450px' }}
        footer={editDialogFooter}
        onHide={closeEditDialog}
        modal
      >
        <div className="p-fluid">
          <div className="field">
            <label htmlFor="editTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Degree Title
            </label>
            <InputText
              id="editTitle"
              value={editDegreeTitle}
              onChange={(e) => setEditDegreeTitle(e.target.value)}
              placeholder="Enter degree title..."
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && editDegree()}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Degrees;
