"use client";

import { Trash2, Users, Activity, Mail, Calendar, UserCheck, Search, Download, X, AlertTriangle, User as UserIcon, Phone, MapPin, Clock, Globe, Star, Shield, BookOpen, Award, DollarSign, Languages, Heart, Eye, Building2, GraduationCap, Stethoscope } from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useState, useRef } from 'react';
import { User, UsersProps } from '@/types/user';
import { useUsers } from '@/hooks/useUsers';

const UsersComponent = ({ users, specialties, onRefreshData }: UsersProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    full_name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    email: { value: null, matchMode: FilterMatchMode.CONTAINS },
    user_type: { value: null, matchMode: FilterMatchMode.EQUALS }
  });
  const dt = useRef<DataTable<User[]>>(null);

  const { deleteUser: deleteUserFromDB, isDeleting } = useUsers();

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
      full_name: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
      email: { value: null, matchMode: FilterMatchMode.CONTAINS },
      user_type: { value: null, matchMode: FilterMatchMode.EQUALS }
    });
    setGlobalFilterValue('');
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const openProfileModal = (user: User) => {
    setSelectedUser(user);
    setShowProfileModal(true);
  };

  const closeProfileModal = () => {
    setShowProfileModal(false);
    setSelectedUser(null);
  };

  const deleteUser = async () => {
    if (!userToDelete) return;

    const result = await deleteUserFromDB(userToDelete.id);

    if (result.success) {
      showSuccess('User deleted successfully');
      closeDeleteModal();
      onRefreshData(); // Refresh the admin page data
    } else {
      showError(result.error || 'Error deleting user');
    }
  };

  const exportCSV = () => {
    dt.current?.exportCSV();
  };

  // Filter out admin users
  const nonAdminUsers = users.filter(user => user.email !== 'admin@admin.com');

  // Calculate stats (excluding admin)
  const practitioners = nonAdminUsers.filter(u => u.user_type === 'practitioner').length;
  const recentUsers = nonAdminUsers.filter(u => {
    const userDate = new Date(u.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return userDate > weekAgo;
  }).length;

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'practitioner':
        return 'from-green-500 to-green-600 bg-green-50 text-green-600';
      case 'patient':
        return 'from-blue-500 to-blue-600 bg-blue-50 text-blue-600';
      default:
        return 'from-gray-500 to-gray-600 bg-gray-50 text-gray-600';
    }
  };

  const getInitials = (name: string, email: string) => {
    if (name && name.trim()) {
      const nameParts = name.trim().split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    }
    return email.charAt(0).toUpperCase();
  };

  // Helper function to parse JSON strings from database
  const parseJsonField = (field: any): any[] => {
    if (!field) return [];

    try {
      // If it's already an array, return it
      if (Array.isArray(field)) {
        return field.filter(item => item && item.toString().trim() !== '');
      }

      // If it's a string, try to parse it as JSON
      if (typeof field === 'string') {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => item && item.toString().trim() !== '');
        }
        // If parsed result is not an array, return it as single item
        return parsed ? [parsed] : [];
      }

      // If it's an object, return empty array (we'll handle specialty_rate separately)
      return [];
    } catch {
      // If JSON parsing fails, treat as regular string
      return field && field.toString().trim() !== '' ? [field.toString()] : [];
    }
  };

  // Helper function to parse specialty rate object
  const parseSpecialtyRate = (field: any): { [key: string]: number } => {
    if (!field) return {};

    try {
      if (typeof field === 'object' && !Array.isArray(field)) {
        return field;
      }

      if (typeof field === 'string') {
        const parsed = JSON.parse(field);
        return typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
      }

      return {};
    } catch {
      return {};
    }
  };

  // Helper function to get specialty name from ID
  const getSpecialtyName = (specialtyId: string): string => {
    const specialty = specialties.find(s => s.id === specialtyId);
    return specialty ? specialty.title : specialtyId;
  };

  // Helper function to get specialty names from parsed specialty data
  const getSpecialtyNames = (parsedSpecialties: string[]): string[] => {
    return parsedSpecialties.map(specialtyId => {
      // If it's already a name (not a UUID), return as is
      if (!specialtyId.match(/^[0-9a-fA-F-]{36}$/)) {
        return specialtyId;
      }
      // If it's an ID, look up the name
      return getSpecialtyName(specialtyId);
    });
  };

  const renderHeader = () => {
    return (
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h4 className="text-lg font-semibold text-gray-900 m-0">Manage Users</h4>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {nonAdminUsers.length} total
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <input
                type="text"
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                placeholder="Search users..."
                className="px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm w-64"
              />
              {globalFilterValue && (
                <button
                  onClick={clearFilter}
                  className="px-2 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {!globalFilterValue && (
                <div className="px-2 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
              )}
            </div>
            <button
              onClick={exportCSV}
              className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <Download className="w-4 h-4 mr-2 inline" />
              Export CSV
            </button>
          </div>
        </div>
      </div>
    );
  };

  const userBodyTemplate = (rowData: User) => {
    return (
      <div className="py-3 pl-6">
        <button
          onClick={() => openProfileModal(rowData)}
          className="flex items-center w-full text-left hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors duration-200 group"
        >
          <div className="flex-shrink-0 h-12 w-12">
            {rowData.avatar ? (
              <Image
                src={rowData.avatar}
                alt={rowData.full_name || rowData.email}
                className="h-12 w-12 rounded-full object-cover shadow-sm group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector('.fallback-avatar')) {
                    const fallbackDiv = document.createElement('div');
                    fallbackDiv.className = `fallback-avatar h-12 w-12 rounded-full bg-gradient-to-br ${getUserTypeColor(rowData.user_type)} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`;
                    fallbackDiv.innerHTML = `<span class="text-sm font-bold text-white">${getInitials(rowData.full_name, rowData.email)}</span>`;
                    parent.appendChild(fallbackDiv);
                  }
                }}
                width={300}
                height={300}
              />
            ) : (
              <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${getUserTypeColor(rowData.user_type)} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-sm font-bold text-white">
                  {getInitials(rowData.full_name, rowData.email)}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">{rowData.full_name || 'No name'}</div>
            <div className="text-xs text-gray-500 font-mono">ID: {rowData.id.slice(0, 8)}...</div>
          </div>
        </button>
      </div>
    );
  };

  const typeBodyTemplate = (rowData: User) => {
    return (
      <div className="py-3 text-center">
        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
          rowData.user_type === 'practitioner'
            ? 'bg-green-100 text-green-800 border border-green-200'
            : rowData.user_type === 'patient'
            ? 'bg-blue-100 text-blue-800 border border-blue-200'
            : 'bg-gray-100 text-gray-800 border border-gray-200'
        }`}>
          {rowData.user_type === 'practitioner' && <UserCheck className="w-3 h-3 mr-1" />}
          {rowData.user_type === 'patient' && <Activity className="w-3 h-3 mr-1" />}
          {rowData.user_type || 'Unknown'}
        </span>
      </div>
    );
  };

  const emailBodyTemplate = (rowData: User) => {
    return (
      <div className="py-3 text-center">
        <div className="flex items-center text-sm text-gray-900">
          <Mail className="w-4 h-4 text-gray-400 mr-2" />
          {rowData.email}
        </div>
      </div>
    );
  };

  const createdBodyTemplate = (rowData: User) => {
    return (
      <div className="py-3 text-center">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
          {new Date(rowData.created_at).toLocaleDateString()}
        </div>
      </div>
    );
  };

  const actionBodyTemplate = (rowData: User) => {
    return (
      <div className="flex items-center justify-start gap-2">
        <button
          onClick={() => openDeleteModal(rowData)}
          className="group flex items-center justify-center w-8 h-8 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-lg text-gray-600">Manage and monitor all platform users</p>
        </div>
        <div className="flex items-center space-x-2 bg-white rounded-lg px-4 py-2 shadow-sm border">
          <Activity className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">Total: {nonAdminUsers.length} users</span>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-50 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">
                  {nonAdminUsers.length}
                </div>
                <p className="text-sm font-medium text-gray-500">Total Users</p>
              </div>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-50 group-hover:scale-110 transition-transform duration-300">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">
                  {practitioners}
                </div>
                <p className="text-sm font-medium text-gray-500">Practitioners</p>
              </div>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${nonAdminUsers.length > 0 ? (practitioners / nonAdminUsers.length) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-purple-50 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">
                  {recentUsers}
                </div>
                <p className="text-sm font-medium text-gray-500">This Week</p>
              </div>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${nonAdminUsers.length > 0 ? (recentUsers / nonAdminUsers.length) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <DataTable
          ref={dt}
          value={nonAdminUsers}
          dataKey="id"
          header={renderHeader()}
          filters={filters}
          filterDisplay="row"
          globalFilterFields={['full_name', 'email', 'user_type']}
          emptyMessage="No users found"
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          sortMode="single"
          sortField="full_name"
          sortOrder={1}
          className="p-datatable-sm"
          stripedRows
        >
          <Column
            field="full_name"
            header="User"
            sortable
            body={userBodyTemplate}
            style={{ width: '30%' }}
            headerStyle={{ textAlign: 'center', paddingLeft: '24px' }}
            headerClassName="text-center"
          />
          <Column
            field="user_type"
            header="Type"
            sortable
            body={typeBodyTemplate}
            style={{ width: '15%' }}
            headerStyle={{ textAlign: 'center' }}
            headerClassName="text-center"
          />
          <Column
            field="email"
            header="Email"
            sortable
            body={emailBodyTemplate}
            style={{ width: '30%' }}
            headerStyle={{ textAlign: 'center' }}
            headerClassName="text-center"
          />
          <Column
            field="created_at"
            header="Created"
            sortable
            body={createdBodyTemplate}
            style={{ width: '15%' }}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Background overlay */}
          <div
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            onClick={closeDeleteModal}
          ></div>

          {/* Modal panel */}
          <div className="relative w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete User
                  </h3>
                </div>
                <button
                  onClick={closeDeleteModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>

                {/* User Info */}
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10">
                      {userToDelete.avatar ? (
                        <Image
                          src={userToDelete.avatar}
                          alt={userToDelete.full_name || userToDelete.email}
                          width={300}
                          height={300}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${getUserTypeColor(userToDelete.user_type)} flex items-center justify-center`}>
                          <span className="text-sm font-bold text-white">
                            {getInitials(userToDelete.full_name, userToDelete.email)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {userToDelete.full_name || 'No name'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {userToDelete.email}
                      </p>
                      <p className="text-xs text-gray-400">
                        {userToDelete.user_type || 'Unknown'} • ID: {userToDelete.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteUser}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete User</span>
                    </>
                  )}
                </button>
              </div>
            </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showProfileModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Background overlay */}
          <div
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            onClick={closeProfileModal}
          ></div>

          {/* Modal panel */}
          <div className="relative w-full max-w-5xl p-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <UserIcon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  User Profile
                </h3>
              </div>
              <button
                onClick={closeProfileModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Profile Content */}
            <div className="space-y-6">
              {/* User Header */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 h-20 w-20">
                    {selectedUser.avatar ? (
                      <Image
                        src={selectedUser.avatar}
                        alt={selectedUser.full_name || selectedUser.email}
                        width={300}
                        height={300}
                        className="h-20 w-20 rounded-full object-cover shadow-lg"
                      />
                    ) : (
                      <div className={`h-20 w-20 rounded-full bg-gradient-to-br ${getUserTypeColor(selectedUser.user_type)} flex items-center justify-center shadow-lg`}>
                        <span className="text-xl font-bold text-white">
                          {getInitials(selectedUser.full_name, selectedUser.email)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-2xl font-bold text-gray-900 mb-1">
                      {selectedUser.full_name || 'No name provided'}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">{selectedUser.email}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                        selectedUser.user_type === 'practitioner'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : selectedUser.user_type === 'patient'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {selectedUser.user_type === 'practitioner' && <UserCheck className="w-3 h-3 mr-1" />}
                        {selectedUser.user_type === 'patient' && <Activity className="w-3 h-3 mr-1" />}
                        {selectedUser.user_type || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Basic Information
                  </h5>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
                      <p className="text-sm text-gray-900 mt-1">{selectedUser.full_name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email Address</label>
                      <p className="text-sm text-gray-900 mt-1 flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        {selectedUser.email}
                      </p>
                    </div>
                    {selectedUser.phone && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                        <p className="text-sm text-gray-900 mt-1 flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          {selectedUser.phone}
                        </p>
                      </div>
                    )}
                    {selectedUser.date_of_birth && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Birth</label>
                        <p className="text-sm text-gray-900 mt-1 flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          {new Date(selectedUser.date_of_birth).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {selectedUser.gender && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</label>
                        <p className="text-sm text-gray-900 mt-1 capitalize">{selectedUser.gender}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact & Location */}
                {(selectedUser.address  || selectedUser.website) && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Contact & Location
                    </h5>
                    <div className="space-y-3">
                      {selectedUser.address && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedUser.address}</p>
                        </div>
                      )}
                      {selectedUser.website && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Website</label>
                          <p className="text-sm text-gray-900 mt-1 flex items-center">
                            <Globe className="w-4 h-4 text-gray-400 mr-2" />
                            <a href={selectedUser.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {selectedUser.website}
                            </a>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Professional Information (for practitioners) */}
                {selectedUser.user_type === 'practitioner' && (
                  (selectedUser.specialty && parseJsonField(selectedUser.specialty).length > 0) ||
                  selectedUser.specialty_id ||
                  selectedUser.clinic ||
                  selectedUser.license_number ||
                  selectedUser.years_of_experience ||
                  selectedUser.education ||
                  (selectedUser.degree && parseJsonField(selectedUser.degree).length > 0) ||
                  selectedUser.certifications
                ) && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Professional Information
                    </h5>
                    <div className="space-y-3">
                      {(selectedUser.specialty || selectedUser.specialty_id) && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Specialty</label>
                          <p className="text-sm text-gray-900 mt-1 flex items-center">
                            <Stethoscope className="w-4 h-4 text-gray-400 mr-2" />
                            {(() => {
                              if (selectedUser.specialty) {
                                const parsedSpecialties = parseJsonField(selectedUser.specialty);
                                if (parsedSpecialties.length > 0) {
                                  const specialtyNames = getSpecialtyNames(parsedSpecialties);
                                  return specialtyNames.join(', ');
                                }
                              }
                              if (selectedUser.specialty_id) {
                                return getSpecialtyName(selectedUser.specialty_id);
                              }
                              return 'Not specified';
                            })()}
                          </p>
                        </div>
                      )}
                      {selectedUser.clinic && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Clinic</label>
                          <p className="text-sm text-gray-900 mt-1 flex items-center">
                            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                            {selectedUser.clinic}
                          </p>
                        </div>
                      )}
                      {selectedUser.license_number && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">License Number</label>
                          <p className="text-sm text-gray-900 mt-1 font-mono">{selectedUser.license_number}</p>
                        </div>
                      )}
                      {selectedUser.years_of_experience && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Experience</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedUser.years_of_experience} years</p>
                        </div>
                      )}
                      {selectedUser.degree && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Degree</label>
                          <p className="text-sm text-gray-900 mt-1 flex items-center">
                            <GraduationCap className="w-4 h-4 text-gray-400 mr-2" />
                            {(() => {
                              const parsedDegrees = parseJsonField(selectedUser.degree);
                              return parsedDegrees.length > 0 ? parsedDegrees.join(', ') : 'Not specified';
                            })()}
                          </p>
                        </div>
                      )}
                      {selectedUser.education && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Education</label>
                          <p className="text-sm text-gray-900 mt-1 flex items-center">
                            <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                            {selectedUser.education}
                          </p>
                        </div>
                      )}
                      {selectedUser.certifications && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Certifications</label>
                          <p className="text-sm text-gray-900 mt-1 flex items-center">
                            <Award className="w-4 h-4 text-gray-400 mr-2" />
                            {selectedUser.certifications}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Practice Information (for practitioners) */}
                {selectedUser.user_type === 'practitioner' && (
                  selectedUser.consultation_fee ||
                  (selectedUser.specialty_rate && Object.keys(parseSpecialtyRate(selectedUser.specialty_rate)).length > 0) ||
                  (selectedUser.languages && parseJsonField(selectedUser.languages).length > 0) ||
                  (selectedUser.insurance_accepted && parseJsonField(selectedUser.insurance_accepted).length > 0)
                ) && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <Heart className="w-4 h-4 mr-2" />
                      Practice Information
                    </h5>
                    <div className="space-y-3">
                      {selectedUser.consultation_fee && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Consultation Fee</label>
                          <p className="text-sm text-gray-900 mt-1 flex items-center">
                            <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                            ${selectedUser.consultation_fee}
                          </p>
                        </div>
                      )}
                      {selectedUser.specialty_rate && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Specialty Rates</label>
                          <div className="mt-1 space-y-2">
                            {(() => {
                              const parsedRates = parseSpecialtyRate(selectedUser.specialty_rate);
                              const entries = Object.entries(parsedRates);

                              if (entries.length === 0) {
                                return <p className="text-sm text-gray-500">Not specified</p>;
                              }

                              return entries.map(([specialty, rate]) => (
                                <div key={specialty} className="flex items-center justify-between bg-white rounded-lg p-3 border">
                                  <span className="text-sm text-gray-700 flex items-center">
                                    <Stethoscope className="w-4 h-4 text-gray-400 mr-2" />
                                    {getSpecialtyNames([specialty])[0]}
                                  </span>
                                  <span className="text-sm font-medium text-green-600 flex items-center">
                                    <DollarSign className="w-4 h-4 mr-1" />
                                    {rate}
                                  </span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}
                      {selectedUser.languages && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Languages</label>
                          <p className="text-sm text-gray-900 mt-1 flex items-center">
                            <Languages className="w-4 h-4 text-gray-400 mr-2" />
                            {(() => {
                              const parsedLanguages = parseJsonField(selectedUser.languages);
                              return parsedLanguages.length > 0 ? parsedLanguages.join(', ') : 'Not specified';
                            })()}
                          </p>
                        </div>
                      )}
                      {selectedUser.insurance_accepted && (() => {
                        const parsedInsurance = parseJsonField(selectedUser.insurance_accepted);
                        return parsedInsurance.length > 0;
                      })() && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Insurance Accepted</label>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {(() => {
                              const parsedInsurance = parseJsonField(selectedUser.insurance_accepted);
                              return parsedInsurance.map((insurance, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                  {insurance}
                                </span>
                              ));
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Ratings & Reviews (for practitioners) */}
                {selectedUser.user_type === 'practitioner' && (selectedUser.rating || selectedUser.total_reviews) && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                      <Star className="w-4 h-4 mr-2" />
                      Ratings & Reviews
                    </h5>
                    <div className="space-y-3">
                      {selectedUser.rating && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Average Rating</label>
                          <p className="text-sm text-gray-900 mt-1 flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-2 fill-current" />
                            {selectedUser.rating}/5.0
                          </p>
                        </div>
                      )}
                      {selectedUser.total_reviews && (
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Reviews</label>
                          <p className="text-sm text-gray-900 mt-1">{selectedUser.total_reviews} reviews</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Account Information */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    Account Information
                  </h5>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">User Type</label>
                      <p className="text-sm text-gray-900 mt-1 capitalize">{selectedUser.user_type || 'Unknown'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Created Date</label>
                      <p className="text-sm text-gray-900 mt-1 flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {selectedUser.updated_at && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Updated</label>
                        <p className="text-sm text-gray-900 mt-1 flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          {new Date(selectedUser.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                    {selectedUser.last_login && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Last Login</label>
                        <p className="text-sm text-gray-900 mt-1 flex items-center">
                          <Eye className="w-4 h-4 text-gray-400 mr-2" />
                          {new Date(selectedUser.last_login).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                    {typeof selectedUser.verified !== 'undefined' && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Verification Status</label>
                        <p className={`text-sm mt-1 flex items-center ${selectedUser.verified ? 'text-green-600' : 'text-red-600'}`}>
                          <Shield className="w-4 h-4 mr-2" />
                          {selectedUser.verified ? 'Verified' : 'Not Verified'}
                        </p>
                      </div>
                    )}
                    {selectedUser.status && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</label>
                        <p className="text-sm text-gray-900 mt-1 capitalize">{selectedUser.status}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              {selectedUser.bio && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-3">About</h5>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedUser.bio}</p>
                </div>
              )}


              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={closeProfileModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeProfileModal();
                    openDeleteModal(selectedUser);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete User</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UsersComponent;