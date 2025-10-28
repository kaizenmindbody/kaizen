"use client";

import { ProfileData } from '@/types/user';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { UserPlus, Users, Send, CheckCircle, XCircle, Clock, Trash2, Mail, Search, Building2, AlertCircle } from 'lucide-react';
import Select from 'react-select';

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

const ManagePractitionerInfo: React.FC<ManagePractitionerInfoProps> = ({ profile }) => {
  const [practitioners, setPractitioners] = useState<Practitioner[]>([]);
  const [selectedPractitioner, setSelectedPractitioner] = useState<PractitionerOption | null>(null);
  const [pendingInvitations, setPendingInvitations] = useState<Invitation[]>([]);
  const [clinicMembers, setClinicMembers] = useState<ClinicMember[]>([]);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPractitioners, setLoadingPractitioners] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
          toast.info('No practitioners available to invite');
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

  // Fetch pending invitations and clinic members
  useEffect(() => {
    const fetchData = async () => {
      if (!clinicId) {
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching invitations and members for clinic:', clinicId);

        // Fetch pending invitations
        const { data: invitationsData, error: invitationsError } = await supabase
          .from('ClinicInvitations')
          .select(`
            id,
            clinic_id,
            invitee_id,
            status,
            created_at,
            invitee:Users!ClinicInvitations_invitee_id_fkey(
              email,
              avatar,
              firstname,
              lastname
            )
          `)
          .eq('clinic_id', clinicId)
          .eq('status', 'pending');

        if (invitationsError) {
          console.error('Error fetching invitations:', invitationsError);
        } else {
          const formattedInvitations = (invitationsData || []).map((inv: any) => ({
            id: inv.id,
            clinic_id: inv.clinic_id,
            invitee_id: inv.invitee_id,
            status: inv.status,
            created_at: inv.created_at,
            invitee_name: inv.invitee?.firstname && inv.invitee?.lastname
              ? `${inv.invitee.firstname} ${inv.invitee.lastname}`.trim()
              : inv.invitee?.email || 'Unknown',
            invitee_email: inv.invitee?.email || '',
            invitee_avatar: inv.invitee?.avatar || null,
          }));
          console.log('Pending invitations:', formattedInvitations);
          setPendingInvitations(formattedInvitations);
        }

        // Fetch clinic members
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
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clinicId]);

  const practitionerOptions: PractitionerOption[] = practitioners
    .filter(p => {
      // Filter out practitioners who are already members or have pending invitations
      const isMember = clinicMembers.some(m => m.practitioner_id === p.id);
      const hasPendingInvite = pendingInvitations.some(i => i.invitee_id === p.id);
      return !isMember && !hasPendingInvite;
    })
    .map(p => ({
      value: p.id,
      label: p.email, // Email as the main label
      email: p.email,
      avatar: p.avatar,
      ptype: p.ptype,
      degree: p.degree,
    }));

  const sendInvitation = async () => {
    if (!selectedPractitioner || !clinicId || !profile?.id) {
      toast.error('Please select a practitioner');
      return;
    }

    setSending(true);

    try {
      console.log('Sending invitation to:', selectedPractitioner.email);

      // Create invitation in database
      const { data, error } = await supabase
        .from('ClinicInvitations')
        .insert({
          clinic_id: clinicId,
          inviter_id: profile.id,
          invitee_id: selectedPractitioner.value,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating invitation:', error);
        if (error.code === '23505') {
          toast.error('Invitation already sent to this practitioner');
        } else {
          toast.error(`Failed to send invitation: ${error.message}`);
        }
        return;
      }

      console.log('Invitation created:', data);

      // Send email invitation using Supabase Auth
      try {
        const emailResponse = await fetch('/api/invite-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: selectedPractitioner.email,
            firstName: '', // You can add these fields to the form if needed
            lastName: '',
            message: `You've been invited to join ${profile?.firstname || 'our'} clinic on Kaizen`,
            metadata: {
              clinic_id: clinicId,
              invitation_id: data.id,
            }
          }),
        });

        const emailResult = await emailResponse.json();

        if (!emailResponse.ok) {
          console.error('Error sending email invitation:', emailResult.error);
          toast.error(`Invitation saved but email failed: ${emailResult.error}`);
        } else {
          // Check if user already exists
          if (emailResult.userExists) {
            toast.success(`Invitation saved! ${selectedPractitioner.email} already has an account and can view this invitation from their dashboard.`);
          } else {
            toast.success(`Invitation email sent to ${selectedPractitioner.email}`);
          }
        }
      } catch (emailError: any) {
        console.error('Error sending email invitation:', emailError);
        toast.error('Invitation saved but email failed to send');
      }

      setSelectedPractitioner(null);

      // Refresh invitations list
      const { data: invitationsData } = await supabase
        .from('ClinicInvitations')
        .select(`
          id,
          clinic_id,
          invitee_id,
          status,
          created_at,
          invitee:Users!ClinicInvitations_invitee_id_fkey(
            email,
            avatar,
            firstname,
            lastname
          )
        `)
        .eq('clinic_id', clinicId)
        .eq('status', 'pending');

      if (invitationsData) {
        const formattedInvitations = invitationsData.map((inv: any) => ({
          id: inv.id,
          clinic_id: inv.clinic_id,
          invitee_id: inv.invitee_id,
          status: inv.status,
          created_at: inv.created_at,
          invitee_name: inv.invitee?.firstname && inv.invitee?.lastname
            ? `${inv.invitee.firstname} ${inv.invitee.lastname}`.trim()
            : inv.invitee?.email || 'Unknown',
          invitee_email: inv.invitee?.email || '',
          invitee_avatar: inv.invitee?.avatar || null,
        }));
        setPendingInvitations(formattedInvitations);
      }

    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast.error('Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      console.log('Cancelling invitation:', invitationId);

      const { error } = await supabase
        .from('ClinicInvitations')
        .delete()
        .eq('id', invitationId);

      if (error) {
        console.error('Error cancelling invitation:', error);
        toast.error(`Failed to cancel invitation: ${error.message}`);
        return;
      }

      toast.success('Invitation cancelled');
      setPendingInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast.error('Failed to cancel invitation');
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

  const formatOption = ({ email, avatar, ptype }: PractitionerOption) => (
    <div className="flex items-center gap-3 py-1">
      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
        {avatar ? (
          <Image src={avatar} alt={email} width={32} height={32} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-sm">
            {email.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{email}</p>
        {ptype && <p className="text-xs text-gray-500 truncate">Type: {ptype}</p>}
      </div>
    </div>
  );

  // Custom filter function to search by email
  const filterOption = (option: any, inputValue: string) => {
    const searchTerm = inputValue.toLowerCase();
    const email = option.data.email?.toLowerCase() || '';
    return email.includes(searchTerm);
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

      {/* Send Invitation Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Invite a Practitioner</h3>
            <p className="text-gray-600">
              Search and select a practitioner to send them an invitation to join your clinic
            </p>
            {!loadingPractitioners && (
              <p className="text-sm text-blue-600 mt-2">
                {practitioners.length} practitioner{practitioners.length !== 1 ? 's' : ''} available
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Practitioner <span className="text-red-500">*</span>
            </label>
            <Select
              value={selectedPractitioner}
              onChange={setSelectedPractitioner}
              options={practitionerOptions}
              formatOptionLabel={formatOption}
              filterOption={filterOption}
              placeholder={loadingPractitioners ? "Loading practitioners..." : "Search by email..."}
              isClearable
              isSearchable
              isLoading={loadingPractitioners}
              isDisabled={loadingPractitioners}
              className="text-sm"
              classNamePrefix="react-select"
              noOptionsMessage={() => loadingPractitioners ? "Loading..." : "No practitioners available"}
              loadingMessage={() => "Loading practitioners..."}
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: '48px',
                  borderRadius: '0.5rem',
                  borderColor: '#d1d5db',
                  '&:hover': { borderColor: '#9ca3af' },
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                }),
              }}
            />
            <p className="text-xs text-gray-500 mt-2">
              Type email to search. Practitioners who are already members or have pending invitations are not shown.
            </p>
          </div>

          <button
            onClick={sendInvitation}
            disabled={!selectedPractitioner || sending}
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-primary to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending Invitation...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Invitation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Pending Invitations */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
        <div className="border-b border-gray-200 bg-gradient-to-r from-amber-50 to-yellow-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Pending Invitations</h3>
              <p className="text-sm text-gray-600">Practitioners you&apos;ve invited who haven&apos;t responded yet</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {pendingInvitations.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No pending invitations</p>
              <p className="text-gray-400 text-sm mt-2">Invitations you send will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {invitation.invitee_avatar ? (
                        <Image
                          src={invitation.invitee_avatar}
                          alt={invitation.invitee_name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-lg">
                          {invitation.invitee_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{invitation.invitee_name}</p>
                      <p className="text-sm text-gray-500">{invitation.invitee_email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Invited {new Date(invitation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => cancelInvitation(invitation.id)}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200 hover:border-red-300 transition-colors flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
            <li>Select and invite practitioners to join your clinic</li>
            <li>Invited practitioners will receive a notification to accept or decline</li>
            <li>Once accepted, they become members of your clinic team</li>
            <li>You can remove members at any time</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManagePractitionerInfo;
