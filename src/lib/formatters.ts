// Phone number formatting utility
export const formatPhoneNumber = (phone: string | undefined): string => {
  if (!phone) return '';

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Handle different phone number lengths
  if (cleaned.length === 10) {
    // US format: (123) 456-7890
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    // US format with country code: +1 (123) 456-7890
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length > 10) {
    // International format: +XX XXX XXX XXXX
    return `+${cleaned}`;
  } else {
    // Return as-is if it doesn't match common patterns
    return phone;
  }
};

// Avatar URL helper utility
export const getAvatarUrl = (avatar: string | { url: string; alt: string } | null | undefined): string => {
  if (!avatar) {
    return "https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/avatars/default.jpg";
  }

  if (typeof avatar === 'string') {
    return avatar;
  }

  if (typeof avatar === 'object' && avatar.url) {
    return avatar.url;
  }

  return "https://vbioebgdmwgrykkphupd.supabase.co/storage/v1/object/public/kaizen/avatars/default.jpg";
};

// Utility function to safely format practitioner type (ptype)
// Handles: strings, arrays, JSON array strings, and comma-separated strings
export const formatPractitionerType = (ptype: any): string => {
  if (!ptype) return 'General Practice';

  // Handle arrays (multiple specialties)
  if (Array.isArray(ptype)) {
    const filtered = ptype.filter(s => s && typeof s === 'string' && s.trim() !== '');
    if (filtered.length === 0) return 'General Practice';
    return filtered.join(' & ');
  }

  // Handle strings
  if (typeof ptype === 'string') {
    const trimmed = ptype.trim();
    if (!trimmed) return 'General Practice';

    // Try to parse as JSON array
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(s => s && typeof s === 'string' && s.trim() !== '');
          if (filtered.length === 0) return 'General Practice';
          return filtered.join(' & ');
        }
      } catch {
        // If JSON parsing fails, continue to treat as regular string
      }
    }

    // Handle comma-separated specialties
    if (trimmed.includes(',')) {
      const specialties = trimmed.split(',').map(s => s.trim()).filter(s => s !== '');
      if (specialties.length === 0) return 'General Practice';
      return specialties.join(' & ');
    }

    // Single specialty string
    return trimmed;
  }

  return 'General Practice';
};

// Format practitioner name with Dr. prefix based on title or degree
export const formatPractitionerName = (
  firstname: string | null | undefined,
  lastname: string | null | undefined,
  title?: string | null | undefined,
  degree?: string | string[] | null | undefined
): string => {
  const fullName = `${firstname || ''} ${lastname || ''}`.trim() || 'Practitioner';
  return formatPractitionerNameFromFullName(fullName, title, degree);
};

// Format practitioner name from full name string
export const formatPractitionerNameFromFullName = (
  fullName: string,
  title?: string | null | undefined,
  degree?: string | string[] | null | undefined
): string => {
  if (!fullName || fullName.trim() === '') {
    return 'Practitioner';
  }

  const nameTrimmed = fullName.trim();

  // If title exists in database, use it as-is (database is source of truth)
  if (title && title.trim()) {
    return `${title.trim()} ${nameTrimmed}`;
  }

  // If no title in database, check degree to determine if we should add "Dr."
  if (degree) {
    const degreeStr = Array.isArray(degree) ? degree.join(' ') : String(degree);
    const degreeUpper = degreeStr.toUpperCase();
    const doctorDegrees = ['MD', 'DO', 'DDS', 'DMD', 'DC', 'ND', 'OD', 'DPM', 'PHARMD', 'DPT'];
    const hasDoctorDegree = doctorDegrees.some(d => degreeUpper.includes(d));

    if (hasDoctorDegree) {
      return `Dr. ${nameTrimmed}`;
    }
  }

  // No title and no doctor degree, return name as-is
  return nameTrimmed;
};