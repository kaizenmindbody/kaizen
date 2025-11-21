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
import { useFaq } from '@/hooks/useFaq';
import { FAQ } from '@/types/faq';

const Faqs = ({ onRefreshData }: { onRefreshData: () => void }) => {
  const { faqs, loading, error, addFaq: addFaqHook, updateFaq: updateFaqHook, deleteFaq: deleteFaqHook } = useFaq();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newFaq, setNewFaq] = useState({
    question: '',
    answer: ''
  });
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [editFaqData, setEditFaqData] = useState({
    question: '',
    answer: ''
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    question: { value: null, matchMode: FilterMatchMode.CONTAINS }
  });
  const dt = useRef<DataTable<FAQ[]>>(null);

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
      question: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });
    setGlobalFilterValue('');
  };

  const addFaq = async () => {
    if (!newFaq.question.trim()) {
      showError('Question is required');
      return;
    }

    if (!newFaq.answer.trim()) {
      showError('Answer is required');
      return;
    }

    const success = await addFaqHook(newFaq);
    if (success) {
      setNewFaq({
        question: '',
        answer: ''
      });
      setShowAddDialog(false);
      showSuccess('FAQ added successfully');
    } else {
      showError('Error adding FAQ');
    }
  };

  const openEditDialog = (faq: FAQ) => {
    setEditingFaq(faq);
    setEditFaqData({
      question: faq.question,
      answer: faq.answer
    });
    setShowEditDialog(true);
  };

  const closeEditDialog = () => {
    setShowEditDialog(false);
    setEditingFaq(null);
    setEditFaqData({
      question: '',
      answer: ''
    });
  };

  const editFaq = async () => {
    if (!editingFaq || !editFaqData.question.trim()) {
      showError('Question is required');
      return;
    }

    if (!editFaqData.answer.trim()) {
      showError('Answer is required');
      return;
    }

    const success = await updateFaqHook(editingFaq.id, editFaqData);
    if (success) {
      closeEditDialog();
      showSuccess('FAQ updated successfully');
    } else {
      showError('Error updating FAQ');
    }
  };

  const confirmDeleteFaq = (faq: FAQ) => {
    confirmDialog({
      message: `Are you sure you want to delete this FAQ?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      defaultFocus: 'reject',
      acceptClassName: 'p-button-danger',
      accept: () => deleteFaqHandler(faq.id),
    });
  };

  const deleteFaqHandler = async (faqId: number) => {
    const success = await deleteFaqHook(faqId);
    if (success) {
      showSuccess('FAQ deleted successfully');
    } else {
      showError('Error deleting FAQ');
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
            <h4 className="text-lg font-semibold text-gray-900 m-0">Manage FAQs</h4>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {faqs.length} total
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <input
                type="text"
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                placeholder="Search FAQs..."
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

  const actionBodyTemplate = (rowData: FAQ) => {
    return (
      <div className="flex items-center justify-start gap-2">
        <button
          onClick={() => openEditDialog(rowData)}
          className="px-2 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-colors"
          title="Edit FAQ"
        >
          <i className="pi pi-pencil text-sm"></i>
        </button>
        <button
          onClick={() => confirmDeleteFaq(rowData)}
          className="px-2 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors"
          title="Delete FAQ"
        >
          <i className="pi pi-trash text-sm"></i>
        </button>
      </div>
    );
  };

  const questionBodyTemplate = (rowData: FAQ) => {
    return (
      <div className="py-3 pl-6">
        <div className="font-medium text-gray-900">{rowData.question}</div>
      </div>
    );
  };

  const answerBodyTemplate = (rowData: FAQ) => {
    return (
      <div className="py-3">
        <div className="text-gray-700 line-clamp-2">{rowData.answer}</div>
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
          setNewFaq({
            question: '',
            answer: ''
          });
        }}
      />
      <Button
        label="Add"
        icon="pi pi-check"
        onClick={addFaq}
        disabled={!newFaq.question.trim() || !newFaq.answer.trim()}
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
        onClick={editFaq}
        disabled={!editFaqData.question.trim() || !editFaqData.answer.trim()}
        autoFocus
      />
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">FAQs Management</h2>
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
          <h2 className="text-3xl font-bold text-gray-900">FAQs Management</h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error loading FAQs: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">FAQs Management</h2>
        <Button
          icon="pi pi-plus"
          label="Add FAQ"
          onClick={() => setShowAddDialog(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700"
        />
      </div>

      {/* DataTable */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <DataTable
          ref={dt}
          value={faqs}
          dataKey="id"
          header={renderHeader()}
          filters={filters}
          filterDisplay="row"
          globalFilterFields={['question', 'answer']}
          emptyMessage="No FAQs found"
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sortMode="single"
          sortField="id"
          sortOrder={1}
          className="p-datatable-sm"
          stripedRows
        >
          <Column
            field="question"
            header="Question"
            sortable
            body={questionBodyTemplate}
            style={{ width: '40%' }}
            headerStyle={{ textAlign: 'center', paddingLeft: '24px' }}
            headerClassName="text-center"
          />
          <Column
            field="answer"
            header="Answer"
            body={answerBodyTemplate}
            style={{ width: '45%' }}
            headerStyle={{ textAlign: 'center' }}
            headerClassName="text-center"
          />
          <Column
            header="Actions"
            body={actionBodyTemplate}
            headerStyle={{ width: '15%', textAlign: 'center' }}
            bodyStyle={{ textAlign: 'center' }}
            headerClassName="text-center"
          />
        </DataTable>
      </div>

      {/* Add Dialog */}
      <Dialog
        header="Add New FAQ"
        visible={showAddDialog}
        style={{ width: '600px' }}
        footer={addDialogFooter}
        onHide={() => {
          setShowAddDialog(false);
          setNewFaq({
            question: '',
            answer: ''
          });
        }}
        modal
      >
        <div className="p-fluid space-y-4">
          <div className="field">
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
              Question <span className="text-red-500">*</span>
            </label>
            <InputText
              id="question"
              value={newFaq.question}
              onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
              placeholder="Enter question..."
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
              Answer <span className="text-red-500">*</span>
            </label>
            <InputTextarea
              id="answer"
              value={newFaq.answer}
              onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
              placeholder="Enter answer..."
              rows={5}
            />
          </div>
        </div>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        header="Edit FAQ"
        visible={showEditDialog}
        style={{ width: '600px' }}
        footer={editDialogFooter}
        onHide={closeEditDialog}
        modal
      >
        <div className="p-fluid space-y-4">
          <div className="field">
            <label htmlFor="editQuestion" className="block text-sm font-medium text-gray-700 mb-2">
              Question <span className="text-red-500">*</span>
            </label>
            <InputText
              id="editQuestion"
              value={editFaqData.question}
              onChange={(e) => setEditFaqData({ ...editFaqData, question: e.target.value })}
              placeholder="Enter question..."
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="editAnswer" className="block text-sm font-medium text-gray-700 mb-2">
              Answer <span className="text-red-500">*</span>
            </label>
            <InputTextarea
              id="editAnswer"
              value={editFaqData.answer}
              onChange={(e) => setEditFaqData({ ...editFaqData, answer: e.target.value })}
              placeholder="Enter answer..."
              rows={5}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Faqs;
