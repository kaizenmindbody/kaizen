"use client";

import { ProfileData } from '@/types/user';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDescriptions } from '@/hooks/useDescriptions';

interface ManageDescriptionsProps {
  profile: ProfileData | null;
}

// Common languages for TCM practitioners with Cantonese and Mandarin separate
const COMMON_LANGUAGES = [
  'English',
  'Mandarin',
  'Cantonese',
  'Spanish',
  'Korean',
  'Japanese',
  'Vietnamese',
  'Tagalog',
  'Hindi',
  'Thai',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Russian',
  'Arabic',
  'Punjabi',
  'Urdu',
  'Persian',
  'Polish',
].sort();

const ManageDescriptions: React.FC<ManageDescriptionsProps> = ({ profile }) => {
  const { descriptions, loading, updateDescriptions, isUpdating, refreshDescriptions } = useDescriptions(profile?.id);

  const [background, setBackground] = useState('');
  const [education, setEducation] = useState('');
  const [treatment, setTreatment] = useState('');
  const [firstVisit, setFirstVisit] = useState('');
  const [insurance, setInsurance] = useState('');
  const [cancellation, setCancellation] = useState('');
  const [language, setLanguage] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Load data from descriptions when available
  useEffect(() => {
    if (descriptions) {
      setBackground(descriptions.background || '');
      setEducation(descriptions.education || '');
      setTreatment(descriptions.treatment || '');
      setFirstVisit(descriptions.firstVisit || '');
      setInsurance(descriptions.insurance || '');
      setCancellation(descriptions.cancellation || '');
      setLanguage(descriptions.language || []);
    }
  }, [descriptions]);

  // Track changes
  useEffect(() => {
    if (descriptions || (!descriptions && (background || education || treatment || firstVisit || insurance || cancellation || language.length > 0))) {
      const changed =
        background !== (descriptions?.background || '') ||
        education !== (descriptions?.education || '') ||
        treatment !== (descriptions?.treatment || '') ||
        firstVisit !== (descriptions?.firstVisit || '') ||
        insurance !== (descriptions?.insurance || '') ||
        cancellation !== (descriptions?.cancellation || '') ||
        JSON.stringify(language) !== JSON.stringify(descriptions?.language || []);
      setHasChanges(changed);
    }
  }, [descriptions, background, education, treatment, firstVisit, insurance, cancellation, language]);

  const handleLanguageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = e.target.value;
    if (selectedLang && !language.includes(selectedLang)) {
      setLanguage([...language, selectedLang]);
      // Reset the select to show placeholder
      e.target.value = '';
    }
  };

  const handleRemoveLanguage = (languageToRemove: string) => {
    setLanguage(language.filter(lang => lang !== languageToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profile?.id) {
      toast.error('Profile not found');
      return;
    }

    const result = await updateDescriptions({
      background,
      education,
      treatment,
      firstVisit,
      insurance,
      cancellation,
      language
    });

    if (result.success) {
      toast.success('Descriptions saved successfully!');
      await refreshDescriptions();
      setHasChanges(false);
    } else {
      toast.error(result.error || 'Failed to save descriptions. Please try again.');
    }
  };

  const handleCancel = () => {
    if (descriptions) {
      setBackground(descriptions.background || '');
      setEducation(descriptions.education || '');
      setTreatment(descriptions.treatment || '');
      setFirstVisit(descriptions.firstVisit || '');
      setInsurance(descriptions.insurance || '');
      setCancellation(descriptions.cancellation || '');
      setLanguage(descriptions.language || []);
    } else {
      setBackground('');
      setEducation('');
      setTreatment('');
      setFirstVisit('');
      setInsurance('');
      setCancellation('');
      setLanguage([]);
    }
    setHasChanges(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Your Descriptions</h2>
          <p className="text-gray-600">Share your professional background and practice information with patients.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Manage Your Descriptions</h2>
        <p className="text-gray-600">Share your professional background and practice information with patients.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Professional Background */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Background
            </label>
            <p className="text-sm text-gray-500 mb-2">
              Tell us a little more about yourself and what inspired you to become a TCM practitioner
            </p>
            <textarea
              rows={6}
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Share your journey and what inspired you to become a TCM practitioner..."
            />
          </div>

          {/* Education and Credentials */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Education and Credentials
            </label>
            <p className="text-sm text-gray-500 mb-2">
              List all your educational accolades here! Format as a list, one credential per line.
            </p>
            <div className="mb-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs font-medium text-gray-600 mb-1">Examples:</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                • Master of Science in Traditional Chinese Medicine, Five Branches University<br/>
                • Licensed Acupuncturist (L.Ac.), California Acupuncture Board<br/>
                • National Certification Commission for Acupuncture and Oriental Medicine (NCCAOM)<br/>
                • Diplomate in Oriental Medicine (Dipl. O.M.)<br/>
                • Advanced Training in Cosmetic Acupuncture, Facial Enhancement Institute
              </p>
            </div>
            <textarea
              rows={6}
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="• Degree name, Institution&#10;• Certification name, Certifying body&#10;• Training program, Organization"
            />
          </div>

          {/* Treatment Approach */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Treatment Approach
            </label>
            <p className="text-sm text-gray-500 mb-2">
              What should new patients know before they schedule an appointment with you?
            </p>
            <textarea
              rows={5}
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Describe your treatment philosophy and approach..."
            />
          </div>

          {/* First Visit Expectations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What Should Patients Expect on Their First Visit?
            </label>
            <textarea
              rows={5}
              value={firstVisit}
              onChange={(e) => setFirstVisit(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Describe what happens during a first visit..."
            />
          </div>

          {/* Insurance Policy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Do You Accept Insurance or Provide Receipts for Insurance Submission?
              <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-2">
              (Feel free to copy and paste from your website, if applicable)
            </p>
            <textarea
              rows={4}
              value={insurance}
              onChange={(e) => setInsurance(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Describe your insurance policy..."
              required
            />
          </div>

          {/* Cancellation Policy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What is your cancellation policy?
              <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-gray-500 mb-2">
              (Feel free to copy and paste from your website, if applicable)
            </p>
            <textarea
              rows={4}
              value={cancellation}
              onChange={(e) => setCancellation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Describe your cancellation policy..."
              required
            />
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Do you speak other languages? If so, let us know below
            </label>
            <p className="text-sm text-gray-500 mb-2">
              (Choose as many as apply)
            </p>

            <select
              onChange={handleLanguageSelect}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-3"
              defaultValue=""
            >
              <option value="" disabled>Select a language to add...</option>
              {COMMON_LANGUAGES.filter(lang => !language.includes(lang)).map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>

            {/* Selected Languages Display */}
            <div className="min-h-[48px] flex items-start p-3 border border-gray-200 rounded-lg bg-gray-50">
              {language.length > 0 ? (
                <div className="flex flex-wrap gap-2 w-full">
                  {language.map((lang, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20"
                    >
                      {lang}
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(lang)}
                        className="ml-2 text-primary hover:text-primary/80 text-lg leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm italic">
                  No languages selected
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Writing Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be authentic and personable in your descriptions</li>
              <li>• Highlight what makes your practice unique</li>
              <li>• Use clear, patient-friendly language</li>
              <li>• Be specific about your policies to set clear expectations</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isUpdating || !hasChanges}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating || !hasChanges}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageDescriptions;
