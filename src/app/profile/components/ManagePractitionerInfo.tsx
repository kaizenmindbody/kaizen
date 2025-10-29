"use client";

import { ProfileData } from '@/types/user';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { UserPlus, Users, Send, CheckCircle, XCircle, Clock, Trash2, Mail, Search, Building2, AlertCircle, Upload, FileUp } from 'lucide-react';
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
}

interface CSVRow {
  email: string;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  }, [profile?.id]);

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
            practitioner:Users!ClinicMembers_practitioner_id_fkey(
              email,
              avatar,
              firstname,
              lastname,
              ptype
            )
          `)
          .eq('clinic_id', clinicId);

        if (membersError) {
          console.error('Error fetching members:', membersError);
        } else {
          const formattedMembers = (membersData || []).map((member: any) => ({
            id: member.id,
            practitioner_id: member.practitioner_id,
            clinic_id: member.clinic_id,
            role: member.role,
            joined_at: member.joined_at,
            practitioner_name: member.practitioner?.firstname && member.practitioner?.lastname
              ? `${member.practitioner.firstname} ${member.practitioner.lastname}`.trim()
              : member.practitioner?.email || 'Unknown',
            practitioner_email: member.practitioner?.email || '',
            practitioner_avatar: member.practitioner?.avatar || null,
            practitioner_type: member.practitioner?.ptype || null,
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

        // Create row with all CSV columns
        const row: CSVRow = {
          email,
          status: 'valid', // Mark as valid for saving
          practitionerId: email, // Store email as ID for now
          message: '',
        };

        // Add all CSV columns dynamically
        for (let j = 0; j < rawHeaders.length; j++) {
          if (values[j]) {
            row[rawHeaders[j]] = values[j];
          }
        }

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

  const saveCSVInvitations = async () => {
    if (!clinicId || !profile?.id || csvPreview.length === 0) {
      toast.error('No valid invitations to save');
      return;
    }

    setSavingCSV(true);

    try {
      let successCount = 0;
      let failureCount = 0;

      // Filter only valid rows
      const validRows = csvPreview.filter(row => row.status === 'valid' && row.practitionerId);

      // Process each valid email
      for (const row of validRows) {
        try {
          // Find practitioner by email
          const { data: practitionerData, error: practitionerError } = await supabase
            .from('Users')
            .select('id')
            .eq('email', row.email)
            .single();

          if (!practitionerData || practitionerError) {
            console.warn(`Practitioner not found for email: ${row.email}`);
            failureCount++;
            continue;
          }

          // Create invitation
          const { data: invitationData, error: invitationError } = await supabase
            .from('ClinicInvitations')
            .insert({
              clinic_id: clinicId,
              inviter_id: profile.id,
              invitee_id: practitionerData.id,
              status: 'pending',
            })
            .select()
            .single();

          if (invitationError) {
            console.error(`Error creating invitation for ${row.email}:`, invitationError);
            failureCount++;
            continue;
          }

          // Send email invitation
          try {
            await fetch('/api/invite-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: row.email,
                firstName: '',
                lastName: '',
                message: `You've been invited to join ${profile?.firstname || 'a'} clinic on Kaizen`,
                metadata: {
                  clinic_id: clinicId,
                  invitation_id: invitationData?.id,
                }
              }),
            });

            successCount++;
          } catch (emailError: any) {
            console.error(`Error sending email to ${row.email}:`, emailError);
            successCount++; // Still count as success if invitation was created
          }
        } catch (error) {
          console.error(`Error processing ${row.email}:`, error);
          failureCount++;
        }
      }

      // Show results
      if (successCount > 0) {
        toast.success(`Successfully invited ${successCount} practitioner(s)`);
      }
      if (failureCount > 0) {
        toast.error(`Failed to invite ${failureCount} practitioner(s)`);
      }

      // Reset preview
      setCSVPreview([]);
      setCSVHeaders([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error saving CSV invitations:', error);
      toast.error('Failed to save invitations');
    } finally {
      setSavingCSV(false);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from your clinic?')) {
      return;
    }

    try {
      console.log('Removing member:', memberId);

      const { error } = await supabase
        .from('ClinicMembers')
        .delete()
        .eq('id', memberId);

      if (error) {
        console.error('Error removing member:', error);
        toast.error(`Failed to remove member: ${error.message}`);
        return;
      }

      toast.success('Member removed from clinic');
      setClinicMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
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
                onClick={saveCSVInvitations}
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
                    Save
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
              <p className="text-gray-400 text-sm mt-2">Accepted invitations will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clinicMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 ring-2 ring-green-100">
                      {member.practitioner_avatar ? (
                        <Image
                          src={member.practitioner_avatar}
                          alt={member.practitioner_name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-600 font-semibold text-xl">
                          {member.practitioner_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 flex items-center gap-2">
                        {member.practitioner_name}
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </p>
                      <p className="text-sm text-gray-600">{member.practitioner_email}</p>
                      {member.practitioner_type && (
                        <p className="text-xs text-gray-500 mt-1">{member.practitioner_type}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMember(member.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-900">
          <p className="font-semibold mb-1">How it works:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-800">
            <li>Upload a CSV file with practitioner email addresses</li>
            <li>System will match emails and create invitations automatically</li>
            <li>Invited practitioners will receive a notification to accept or decline</li>
            <li>Once accepted, they become members of your clinic team</li>
            <li>You can remove members at any time</li>
            <li>Practitioners who are already members or have pending invitations will be skipped</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManagePractitionerInfo;
