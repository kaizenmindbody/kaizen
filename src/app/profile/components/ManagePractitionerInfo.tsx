"use client";

import { ProfileData } from '@/types/user';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { UserPlus, Users, Send, CheckCircle, XCircle, Clock, Trash2, Mail, Search, Building2, AlertCircle, Upload, FileUp, Edit } from 'lucide-react';
import Select from 'react-select';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

interface ManagePractitionerInfoProps {
  profile: ProfileData | null;
}

interface Practitioner {
  id: string;
  email: string;
  avatar: string | null;
  ptype: string | null;
  degree: string | null;
}

interface PractitionerOption {
  value: string;
  label: string;
  email: string;
  avatar: string | null;
  ptype: string | null;
  degree: string | null;
}

interface Invitation {
  id: string;
  clinic_id: string;
  invitee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  invitee_name: string;
  invitee_email: string;
  invitee_avatar: string | null;
}

interface ClinicMember {
  id: string;
  practitioner_id: string;
  clinic_id: string;
  role: string;
  joined_at: string;
  practitioner_name: string;
  practitioner_email: string;
  practitioner_avatar: string | null;
  practitioner_type: string | null;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  degree?: string;
  website?: string;
  address?: string;
  avatar?: string | null;
}

interface CSVRow {
  email: string;
  firstname?: string;
  lastname?: string;
  ptype?: string; // Practitioner type (e.g., Doctor, Nurse, etc)
  status: 'valid' | 'invalid' | 'exists' | 'pending';
  practitionerId?: string;
  message?: string;
  [key: string]: string | undefined; // Allow dynamic columns from CSV
}

const ManagePractitionerInfo: React.FC<ManagePractitionerInfoProps> = ({ profile }) => {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [clinicMembers, setClinicMembers] = useState<ClinicMember[]>([]);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPractitioners, setLoadingPractitioners] = useState(true);
  const [uploadingCSV, setUploadingCSV] = useState(false);
  const [csvPreview, setCSVPreview] = useState<CSVRow[]>([]);
  const [csvHeaders, setCSVHeaders] = useState<string[]>([]);
  const [savingCSV, setSavingCSV] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<ClinicMember | null>(null);
  const [editFormData, setEditFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    degree: '',
    website: '',
    avatar: '',
  });
  const [editAddressFields, setEditAddressFields] = useState({
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
  });
  const [editingAvatar, setEditingAvatar] = useState<File | null>(null);
  const [editingAvatarPreview, setEditingAvatarPreview] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editAvatarInputRef = useRef<HTMLInputElement>(null);

  // Fetch clinic ID
  useEffect(() => {
    const fetchClinicId = async () => {
      if (!profile?.id) return;

      const { data, error } = await supabase
        .from('Clinics')
        .select('id')
        .eq('practitioner_id', profile.id)
        .single();

      if (data && !error) {
        setClinicId(data.id);
      }
    };

    fetchClinicId();
  }, [profile?.id]);

  // Fetch all practitioners immediately on mount
  useEffect(() => {
    const fetchPractitioners = async () => {
      setLoadingPractitioners(true);
      try {
        console.log('Fetching all practitioners...');

        const { data, error } = await supabase
          .from('Users')
          .select('id, email, avatar, ptype, degree')
          .eq('type', 'Practitioner')
          .neq('id', profile?.id || ''); // Exclude current user

        if (error) {
          console.error('Error fetching practitioners:', error);
          toast.error(`Failed to load practitioners: ${error.message}`);
          setPractitioners([]);
          return;
        }

        console.log('Fetched practitioners:', data);
        console.log('Total practitioners found:', data?.length || 0);

        if (!data || data.length === 0) {
          console.warn('No practitioners found in database');
        }

        setPractitioners(data || []);
      } catch (error: any) {
        console.error('Unexpected error fetching practitioners:', error);
        toast.error('Failed to load practitioners list');
        setPractitioners([]);
      } finally {
        setLoadingPractitioners(false);
      }
    };

    // Fetch immediately when component mounts
    fetchPractitioners();
  }, [profile]);

  // Fetch clinic members
  useEffect(() => {
    const fetchMembers = async () => {
      if (!clinicId) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching members for clinic:', clinicId);

        const { data: membersData, error: membersError } = await supabase
          .from('ClinicMembers')
          .select(`
            id,
            practitioner_id,
            clinic_id,
            role,
            joined_at,
            email,
            firstname,
            lastname,
            phone,
            degree,
            website,
            address,
            avatar
          `)
          .eq('clinic_id', profile?.id);

        if (membersError) {
          console.error('Error fetching members:', membersError);
        } else {
          const formattedMembers = (membersData || []).map((member: any) => ({
            id: member.id,
            practitioner_id: member.practitioner_id,
            clinic_id: member.clinic_id,
            role: member.role,
            joined_at: member.joined_at,
            practitioner_name: member.firstname && member.lastname
              ? `${member.firstname} ${member.lastname}`.trim()
              : member.email || 'Unknown',
            practitioner_email: member.email || '',
            practitioner_avatar: member.avatar || null,
            practitioner_type: member.degree || null, // Using degree instead of ptype
            firstname: member.firstname || '',
            lastname: member.lastname || '',
            email: member.email || '',
            phone: member.phone || '',
            degree: member.degree || '',
            website: member.website || '',
            address: member.address || '',
            avatar: member.avatar || null,
          }));
          console.log('Clinic members:', formattedMembers);
          setClinicMembers(formattedMembers);
        }
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [clinicId]);


  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      toast.error('Please select a CSV file');
      return;
    }

    setUploadingCSV(true);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        toast.error('CSV file must contain headers and at least one row');
        setUploadingCSV(false);
        return;
      }

      // Helper function to parse CSV with quoted fields
      const parseCSVLine = (line: string) => {
        const result = [];
        let current = '';
        let insideQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          const nextChar = line[i + 1];

          if (char === '"') {
            if (insideQuotes && nextChar === '"') {
              current += '"';
              i++;
            } else {
              insideQuotes = !insideQuotes;
            }
          } else if (char === ',' && !insideQuotes) {
            result.push(current.trim().replace(/^"|"$/g, ''));
            current = '';
          } else {
            current += char;
          }
        }

        result.push(current.trim().replace(/^"|"$/g, ''));
        return result;
      };

      // Parse CSV headers (keep original case)
      const rawHeaders = parseCSVLine(lines[0]);
      const headers = rawHeaders.map(h => h.toLowerCase());
      const emailIndex = headers.findIndex(h => h.includes('email'));

      if (emailIndex === -1) {
        toast.error('CSV must contain an "email" column');
        setUploadingCSV(false);
        return;
      }

      // Store headers for table display
      setCSVHeaders(rawHeaders);

      // Parse rows and validate
      const csvRows: CSVRow[] = [];
      const emailSet = new Set<string>();

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const email = values[emailIndex];

        if (!email || !email.includes('@')) {
          continue; // Skip invalid emails
        }

        if (emailSet.has(email)) {
          continue; // Skip duplicates
        }

        emailSet.add(email);

        // Create row with all CSV columns - normalize header names to lowercase
        const row: CSVRow = {
          email,
          status: 'valid', // Mark as valid for saving
          practitionerId: email, // Store email as ID for now
          message: '',
        };

        // Map CSV columns to standard field names
        const addressParts: string[] = [];

        // Add all CSV columns dynamically with normalized (lowercase) keys
        for (let j = 0; j < rawHeaders.length; j++) {
          if (values[j]) {
            const normalizedKey = rawHeaders[j].toLowerCase().trim().replace(/\s+/g, ' ');
            const value = values[j];

            // Handle first name variations: "first name", "firstname", "fname"
            if (normalizedKey.includes('first') && normalizedKey.includes('name')) {
              row['firstname'] = value;
            }
            // Handle last name variations: "last name", "lastname", "lname"
            else if (normalizedKey.includes('last') && normalizedKey.includes('name')) {
              row['lastname'] = value;
            }
            // Handle address parts - combine them later
            else if (normalizedKey.includes('address')) {
              if (normalizedKey.includes('address 1') || normalizedKey.includes('address1')) {
                addressParts.push(value);
              } else if (normalizedKey.includes('address 2') || normalizedKey.includes('address2')) {
                addressParts.push(value);
              } else if (normalizedKey === 'address') {
                row['address'] = value;
              }
            }
            else if (normalizedKey.includes('city')) {
              addressParts.push(value);
            }
            else if (normalizedKey.includes('state')) {
              addressParts.push(value);
            }
            else if (normalizedKey.includes('zip')) {
              addressParts.push(value);
            }
            // Standard fields
            else if (normalizedKey === 'phone') {
              row['phone'] = value;
            }
            else if (normalizedKey === 'degree' || normalizedKey === 'degrees') {
              row['degree'] = value;
            }
            else if (normalizedKey === 'website') {
              row['website'] = value;
            }
            else if (normalizedKey === 'avatar') {
              row['avatar'] = value;
            }

            // Store with original key for display in table
            row[rawHeaders[j]] = value;
          }
        }

        // Combine address parts if they exist
        if (addressParts.length > 0) {
          row['address'] = addressParts.filter(Boolean).join(', ');
        }

        // Log the extracted fields for debugging
        console.log(`Parsed row for ${row.email}:`, {
          firstname: row.firstname,
          lastname: row.lastname,
          phone: row.phone,
          degree: row.degree,
          website: row.website,
          address: row.address,
          avatar: row.avatar,
        });

        csvRows.push(row);
      }

      if (csvRows.length === 0) {
        toast.error('No valid email addresses found in CSV');
        setUploadingCSV(false);
        return;
      }

      setCSVPreview(csvRows);
      toast.success(`Found ${csvRows.length} practitioners to invite`);
    } catch (error: any) {
      console.error('Error processing CSV:', error);
      toast.error('Failed to process CSV file');
    } finally {
      setUploadingCSV(false);
    }
  };

  const saveCSVPractitioners = async () => {
    if (!clinicId || !profile?.id || csvPreview.length === 0) {
      toast.error('No valid practitioners to save');
      return;
    }

    setSavingCSV(true);

    try {
      // Step 1: Verify that the logged-in user is the Clinic Admin (clinic owner)
      const { data: clinicData, error: clinicError } = await supabase
        .from('Clinics')
        .select('practitioner_id')
        .eq('id', clinicId)
        .single();

      if (clinicError || !clinicData) {
        toast.error('Failed to verify clinic. Please refresh and try again.');
        setSavingCSV(false);
        return;
      }

      // Verify that the current user is the clinic owner
      if (clinicData.practitioner_id !== profile.id) {
        toast.error('You are not authorized to add members to this clinic. Only the clinic owner can add members.');
        setSavingCSV(false);
        return;
      }

      let successCount = 0;
      let failureCount = 0;
      const errors: string[] = [];

      // Filter only valid rows
      const validRows = csvPreview.filter(row => row.status === 'valid' && row.email);

      // Process each valid row - save directly to ClinicMembers table
      for (const row of validRows) {
        try {
          // Save practitioner data directly to ClinicMembers table
          // clinic_id = profile.id (the clinic owner's practitioner_id)
          // practitioner_id = auto-generated UUID
          const { error: memberError } = await supabase
            .from('ClinicMembers')
            .insert({
              clinic_id: profile.id, // UUID of clinic owner
              email: row.email,
              firstname: row.firstname || null,
              lastname: row.lastname || null,
              phone: row.phone || null,
              degree: row.degree || null,
              website: row.website || null,
              address: row.address || null,
              avatar: row.avatar || null,
              role: 'member', // Default role is 'member'
              // practitioner_id is auto-generated with gen_random_uuid()
            });

          if (memberError) {
            // If duplicate (already added), skip and count as success
            if (memberError.code === '23505') {
              console.warn(`${row.email} is already a member of this clinic`);
              successCount++; // Still count as success
            } else {
              console.error(`Error adding ${row.email} to clinic members:`, memberError);
              errors.push(`Failed to add ${row.email}`);
              failureCount++;
            }
            continue;
          }

          successCount++;
          console.log(`Successfully added ${row.email} to clinic members`);
        } catch (error) {
          console.error(`Error processing ${row.email}:`, error);
          errors.push(`Unexpected error processing ${row.email}`);
          failureCount++;
        }
      }

      // Show results
      if (successCount > 0) {
        toast.success(`Successfully added ${successCount} practitioner(s) to your clinic`);
        // Refresh clinic members list
        const { data: updatedMembers } = await supabase
          .from('ClinicMembers')
          .select(`
            id,
            practitioner_id,
            clinic_id,
            role,
            joined_at,
            email,
            firstname,
            lastname,
            phone,
            degree,
            website,
            address,
            avatar
          `)
          .eq('clinic_id', profile?.id);

        if (updatedMembers) {
          const formattedMembers = updatedMembers.map((member: any) => ({
            id: member.id,
            practitioner_id: member.practitioner_id,
            clinic_id: member.clinic_id,
            role: member.role,
            joined_at: member.joined_at,
            practitioner_name: member.firstname && member.lastname
              ? `${member.firstname} ${member.lastname}`.trim()
              : member.email || 'Unknown',
            practitioner_email: member.email || '',
            practitioner_avatar: member.avatar || null,
            practitioner_type: member.degree || null,
            firstname: member.firstname || '',
            lastname: member.lastname || '',
            email: member.email || '',
            phone: member.phone || '',
            degree: member.degree || '',
            website: member.website || '',
            address: member.address || '',
            avatar: member.avatar || null,
          }));
          setClinicMembers(formattedMembers);
        }
      }

      if (failureCount > 0) {
        const errorMessage = errors.length > 0 ? `\n${errors.slice(0, 3).join('\n')}${errors.length > 3 ? '\n...' : ''}` : '';
        toast.error(`Failed to add ${failureCount} practitioner(s)${errorMessage}`);
      }

      // Reset preview
      setCSVPreview([]);
      setCSVHeaders([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error saving CSV practitioners:', error);
      toast.error('Failed to save practitioners');
    } finally {
      setSavingCSV(false);
    }
  };

  const handleRemoveClick = (memberId: string, memberName: string) => {
    setMemberToRemove({ id: memberId, name: memberName });
    setShowRemoveConfirm(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      console.log('Removing member:', memberToRemove.id);

      const { error } = await supabase
        .from('ClinicMembers')
        .delete()
        .eq('id', memberToRemove.id);

      if (error) {
        console.error('Error removing member:', error);
        toast.error(`Failed to remove member: ${error.message}`);
        setShowRemoveConfirm(false);
        setMemberToRemove(null);
        return;
      }

      toast.success(`${memberToRemove.name} has been removed from the clinic`);
      setClinicMembers(prev => prev.filter(m => m.id !== memberToRemove.id));
      setShowRemoveConfirm(false);
      setMemberToRemove(null);
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
      setShowRemoveConfirm(false);
      setMemberToRemove(null);
    }
  };

  const parseAddressString = (addressString: string) => {
    if (!addressString) {
      return {
        address1: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
      };
    }

    // Split by comma and trim
    const parts = addressString.split(',').map(p => p.trim());

    return {
      address1: parts[0] || '',
      address2: parts[1] || '',
      city: parts[2] || '',
      state: parts[3] || '',
      zip: parts[4] || '',
    };
  };

  const combineAddressFields = () => {
    return [
      editAddressFields.address1?.trim(),
      editAddressFields.address2?.trim(),
      editAddressFields.city?.trim(),
      editAddressFields.state?.trim(),
      editAddressFields.zip?.trim(),
    ]
      .filter(Boolean)
      .join(', ');
  };

  const handleEditClick = (member: ClinicMember) => {
    setEditingMember(member);
    setEditFormData({
      firstname: member.firstname || '',
      lastname: member.lastname || '',
      email: member.email || '',
      phone: member.phone || '',
      degree: member.degree || '',
      website: member.website || '',
      avatar: member.avatar || '',
    });
    setEditAddressFields(parseAddressString(member.address || ''));
    setEditingAvatarPreview(member.avatar || '');
    setEditingAvatar(null);
    setShowEditModal(true);
  };

  const handleEditAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setEditingAvatar(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setEditingAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const saveEditedMember = async () => {
    if (!editingMember) return;

    setSavingEdit(true);

    try {
      let avatarUrl = editFormData.avatar;

      // If a new avatar file was selected, upload it
      if (editingAvatar) {
        const fileExt = editingAvatar.name.split('.').pop();
        const fileName = `clinic-members/${editingMember.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('kaizen/usermedia')
          .upload(fileName, editingAvatar, { upsert: true });

        if (uploadError) {
          toast.error('Failed to upload avatar');
          setSavingEdit(false);
          return;
        }

        const { data: publicData } = supabase.storage
          .from('kaizen/usermedia')
          .getPublicUrl(fileName);

        avatarUrl = publicData?.publicUrl || '';
      }

      // Combine address fields
      const combinedAddress = combineAddressFields();

      // Update member in ClinicMembers table
      const { error } = await supabase
        .from('ClinicMembers')
        .update({
          firstname: editFormData.firstname || null,
          lastname: editFormData.lastname || null,
          email: editFormData.email,
          phone: editFormData.phone || null,
          degree: editFormData.degree || null,
          website: editFormData.website || null,
          address: combinedAddress || null,
          avatar: avatarUrl || null,
        })
        .eq('id', editingMember.id);

      if (error) {
        console.error('Error updating member:', error);
        toast.error(`Failed to update member: ${error.message}`);
        setSavingEdit(false);
        return;
      }

      toast.success('Member details updated successfully');

      // Update local state
      setClinicMembers(prev =>
        prev.map(m =>
          m.id === editingMember.id
            ? {
                ...m,
                firstname: editFormData.firstname,
                lastname: editFormData.lastname,
                email: editFormData.email,
                phone: editFormData.phone,
                degree: editFormData.degree,
                website: editFormData.website,
                address: combinedAddress,
                avatar: avatarUrl || null,
                practitioner_avatar: avatarUrl || null,
                practitioner_email: editFormData.email,
                practitioner_type: editFormData.degree || null,
                practitioner_name:
                  editFormData.firstname && editFormData.lastname
                    ? `${editFormData.firstname} ${editFormData.lastname}`
                    : editFormData.email,
              }
            : m
        )
      );

      setShowEditModal(false);
      setEditingMember(null);
      setSavingEdit(false);
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error('Failed to save member details');
      setSavingEdit(false);
    }
  };

  if (!clinicId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Practitioner Invitations</h2>
          <p className="text-gray-600">Invite practitioners to join your clinic team</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <Building2 className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Clinic Profile Found</h3>
          <p className="text-gray-600">
            You need to create a clinic profile before you can invite practitioners. Go to &quot;Update Clinic Profile&quot; to create one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Manage Practitioner Invitations</h2>
        <p className="text-lg text-gray-600">Invite practitioners to join your clinic and manage your team</p>
      </div>

      {/* CSV Upload Section */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <FileUp className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Team Members via CSV</h3>
            <p className="text-gray-600">
              Upload a CSV file containing practitioner emails to invite multiple members at once
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              CSV File <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                disabled={uploadingCSV}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="flex items-center justify-center gap-3 p-8 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-400 hover:bg-purple-100/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-center">
                  {uploadingCSV ? (
                    <>
                      <svg className="animate-spin h-8 w-8 text-purple-600 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-purple-700 font-semibold">Processing CSV...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-purple-700 font-semibold">Click to upload CSV</p>
                      <p className="text-sm text-gray-600 mt-1">or drag and drop</p>
                    </>
                  )}
                </div>
              </label>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              <span className="font-semibold">CSV Format Required:</span> First row must contain headers. Include an &quot;email&quot; column with practitioner email addresses.
            </p>
            <div className="mt-3 p-3 bg-purple-100 rounded-lg">
              <p className="text-xs text-purple-900 font-semibold mb-2">Example CSV format:</p>
              <code className="text-xs text-purple-800 block font-mono whitespace-pre-wrap">
email,name,type{'\n'}doctor1@example.com,John Doe,MD{'\n'}doctor2@example.com,Jane Smith,DDS
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Preview Table */}
      {csvPreview.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <FileUp className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">CSV Preview</h3>
                  <p className="text-sm text-gray-600">{csvPreview.length} practitioner(s) ready to invite</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setCSVPreview([]);
                  setCSVHeaders([]);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="p-6">
            <DataTable
              value={csvPreview}
              scrollable
              className="p-datatable-sm"
              style={{ width: '100%' }}
            >
              {csvHeaders.map((header) => (
                <Column
                  key={header}
                  field={header}
                  header={header}
                  body={(rowData) => rowData[header] || '-'}
                />
              ))}
            </DataTable>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={saveCSVPractitioners}
                disabled={savingCSV || csvPreview.filter(r => r.status === 'valid').length === 0}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
              >
                {savingCSV ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Add Members
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setCSVPreview([]);
                  setCSVHeaders([]);
                }}
                className="px-4 py-2 text-gray-700 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clinic Members */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Clinic Members</h3>
              <p className="text-sm text-gray-600">Practitioners who are part of your clinic team</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {clinicMembers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No team members yet</p>
              <p className="text-gray-400 text-sm mt-2">Practitioners you add will appear here</p>
            </div>
          ) : (
            <DataTable
              value={clinicMembers}
              scrollable
              className="p-datatable-sm"
              style={{ width: '100%' }}
              dataKey="id"
            >
              <Column
                header="Avatar"
                body={(rowData: ClinicMember) => (
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {rowData.practitioner_avatar ? (
                      <Image
                        src={rowData.practitioner_avatar}
                        alt={rowData.practitioner_name}
                        width={40}
                        height={40}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-600 font-semibold text-sm">
                        {rowData.practitioner_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
                style={{ width: '50px' }}
              />
              <Column
                field="practitioner_name"
                header="Name"
                style={{ width: '150px' }}
              />
              <Column
                field="practitioner_email"
                header="Email"
                style={{ width: '200px' }}
              />
              <Column
                field="practitioner_type"
                header="Type"
                style={{ width: '120px' }}
                body={(rowData: ClinicMember) => rowData.practitioner_type || '-'}
              />
              <Column
                field="role"
                header="Role"
                style={{ width: '100px' }}
                body={(rowData: ClinicMember) => (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                    {rowData.role}
                  </span>
                )}
              />
              <Column
                header="Joined"
                body={(rowData: ClinicMember) => (
                  <span className="text-sm text-gray-600">
                    {new Date(rowData.joined_at).toLocaleDateString()}
                  </span>
                )}
                style={{ width: '120px' }}
              />
              <Column
                header="Actions"
                body={(rowData: ClinicMember) => (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(rowData)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1"
                      title="Edit member"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveClick(rowData.id, rowData.practitioner_name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center gap-1"
                      title="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                style={{ width: '150px' }}
              />
            </DataTable>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-900">
          <p className="font-semibold mb-1">How it works:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-800">
            <li>Upload a CSV file with practitioner information (email is required)</li>
            <li>For existing practitioners: they will be added as members of your clinic</li>
            <li>For new practitioners: they will be created in the system and added as members</li>
            <li>All practitioners will immediately become members of your clinic team</li>
            <li>You can remove members at any time</li>
            <li>Only the clinic owner (admin) can add members to the clinic</li>
            <li>Practitioners who are already members will be skipped</li>
          </ul>
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      {showRemoveConfirm && memberToRemove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-5 border-b border-red-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Remove Member?</h2>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-gray-700 mb-2">
                Are you sure you want to remove{' '}
                <span className="font-semibold text-gray-900">{memberToRemove.name}</span> from your clinic?
              </p>
              <p className="text-sm text-gray-600">
                This action cannot be undone. They will no longer have access to your clinic.
              </p>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-gray-200">
              <button
                onClick={() => {
                  setShowRemoveConfirm(false);
                  setMemberToRemove(null);
                }}
                className="px-4 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveMember}
                className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && editingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-5 border-b border-blue-100">
              <h2 className="text-2xl font-bold text-gray-900">Edit Member Details</h2>
              <p className="text-sm text-gray-600 mt-1">Update {editingMember.practitioner_name}&apos;s information</p>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Avatar Section */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">Avatar</label>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {editingAvatarPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={editingAvatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-semibold text-2xl">
                        {editFormData.firstname?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={editAvatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleEditAvatarChange}
                      className="hidden"
                      id="edit-avatar-upload"
                    />
                    <label
                      htmlFor="edit-avatar-upload"
                      className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                    >
                      Change Avatar
                    </label>
                    {editingAvatar && (
                      <p className="text-xs text-gray-600 mt-2">{editingAvatar.name}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={editFormData.firstname}
                    onChange={(e) => setEditFormData({...editFormData, firstname: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={editFormData.lastname}
                    onChange={(e) => setEditFormData({...editFormData, lastname: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Last name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Email address"
                />
              </div>

              {/* Phone & Degree */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Degree</label>
                  <input
                    type="text"
                    value={editFormData.degree}
                    onChange={(e) => setEditFormData({...editFormData, degree: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Degree or certification"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                <input
                  type="url"
                  value={editFormData.website}
                  onChange={(e) => setEditFormData({...editFormData, website: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
              </div>

              {/* Address Information */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-800">Address Information</h3>

                {/* Address Line 1 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address Line 1 <span className="text-gray-500 text-xs">(Street Address)</span>
                  </label>
                  <input
                    type="text"
                    value={editAddressFields.address1}
                    onChange={(e) => setEditAddressFields({...editAddressFields, address1: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Street address"
                  />
                </div>

                {/* Address Line 2 */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address Line 2 <span className="text-gray-500 text-xs">(Apt, Suite, Unit, etc. - Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={editAddressFields.address2}
                    onChange={(e) => setEditAddressFields({...editAddressFields, address2: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                  />
                </div>

                {/* City, State, ZIP */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={editAddressFields.city}
                      onChange={(e) => setEditAddressFields({...editAddressFields, city: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={editAddressFields.state}
                      onChange={(e) => setEditAddressFields({...editAddressFields, state: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={editAddressFields.zip}
                      onChange={(e) => setEditAddressFields({...editAddressFields, zip: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="ZIP"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingMember(null);
                }}
                disabled={savingEdit}
                className="px-4 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEditedMember}
                disabled={savingEdit}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {savingEdit ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePractitionerInfo;
