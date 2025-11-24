"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { showToast } from '@/lib/toast';
import { FileText, Plus, Trash2, Save, Edit2, X, ChevronDown, ChevronUp } from 'lucide-react';

interface Section {
  title: string;
  content: string;
  type: 'text' | 'list' | 'mixed' | 'contact';
}

interface LegalContentData {
  id: number;
  page_type: string;
  content: Section[];
  updated_at: string;
}

interface LegalContentProps {
  onRefreshData: () => void;
}

const LegalContent = ({ onRefreshData }: LegalContentProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'terms-conditions' | 'privacy-policy'>('terms-conditions');
  const [termsContent, setTermsContent] = useState<Section[]>([]);
  const [privacyContent, setPrivacyContent] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchLegalContent();
  }, []);

  const fetchLegalContent = async () => {
    setLoading(true);
    try {
      // Fetch Terms & Conditions
      const termsResponse = await fetch('/api/legal-content?page_type=terms-conditions');
      const termsData = await termsResponse.json();

      if (termsResponse.ok && termsData.data) {
        setTermsContent(termsData.data.content || []);
      }

      // Fetch Privacy Policy
      const privacyResponse = await fetch('/api/legal-content?page_type=privacy-policy');
      const privacyData = await privacyResponse.json();

      if (privacyResponse.ok && privacyData.data) {
        setPrivacyContent(privacyData.data.content || []);
      }
    } catch (error) {
      console.error('Error fetching legal content:', error);
      showToast.error('Failed to fetch legal content');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentContent = () => {
    return activeTab === 'terms-conditions' ? termsContent : privacyContent;
  };

  const setCurrentContent = (content: Section[]) => {
    if (activeTab === 'terms-conditions') {
      setTermsContent(content);
    } else {
      setPrivacyContent(content);
    }
  };

  const handleAddSection = () => {
    const newSection: Section = {
      title: 'New Section',
      content: 'Enter content here...',
      type: 'text'
    };
    const content = getCurrentContent();
    setCurrentContent([...content, newSection]);
    setEditingIndex(content.length);
    setExpandedSections(new Set([...expandedSections, content.length]));
  };

  const handleUpdateSection = (index: number, field: keyof Section, value: string) => {
    const content = getCurrentContent();
    const updatedContent = [...content];
    updatedContent[index] = {
      ...updatedContent[index],
      [field]: value
    };
    setCurrentContent(updatedContent);
  };

  const handleDeleteSection = (index: number) => {
    if (confirm('Are you sure you want to delete this section?')) {
      const content = getCurrentContent();
      const updatedContent = content.filter((_, i) => i !== index);
      setCurrentContent(updatedContent);
      setEditingIndex(null);
    }
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const content = getCurrentContent();
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= content.length) return;

    const updatedContent = [...content];
    [updatedContent[index], updatedContent[newIndex]] = [updatedContent[newIndex], updatedContent[index]];
    setCurrentContent(updatedContent);
  };

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const handleSave = async () => {
    if (!user?.id) {
      showToast.error('You must be logged in to save changes');
      return;
    }

    setSaving(true);
    try {
      const content = getCurrentContent();

      const response = await fetch('/api/legal-content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_type: activeTab,
          content,
          user_id: user.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast.success(`${activeTab === 'terms-conditions' ? 'Terms & Conditions' : 'Privacy Policy'} updated successfully`);
        setEditingIndex(null);
        onRefreshData();
      } else {
        showToast.error(data.error || 'Failed to update content');
      }
    } catch (error) {
      console.error('Error saving legal content:', error);
      showToast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading legal content...</div>
      </div>
    );
  }

  const content = getCurrentContent();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-primary" />
            Legal Content Management
          </h1>
          <p className="text-gray-600 mt-1">Manage Terms & Conditions and Privacy Policy content</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('terms-conditions');
              setEditingIndex(null);
              setExpandedSections(new Set());
            }}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'terms-conditions'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Terms & Conditions
          </button>
          <button
            onClick={() => {
              setActiveTab('privacy-policy');
              setEditingIndex(null);
              setExpandedSections(new Set());
            }}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'privacy-policy'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Privacy Policy
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {content.map((section, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-3 flex-1">
                <button
                  onClick={() => toggleSection(index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {expandedSections.has(index) ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleUpdateSection(index, 'title', e.target.value)}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {/* Move buttons */}
                <button
                  onClick={() => handleMoveSection(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMoveSection(index, 'down')}
                  disabled={index === content.length - 1}
                  className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  ↓
                </button>
                {/* Edit button */}
                {editingIndex === index ? (
                  <button
                    onClick={() => setEditingIndex(null)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                    title="Close editor"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingIndex(index);
                      setExpandedSections(new Set([...expandedSections, index]));
                    }}
                    className="p-2 text-blue-600 hover:text-blue-700"
                    title="Edit section"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                {/* Delete button */}
                <button
                  onClick={() => handleDeleteSection(index)}
                  className="p-2 text-red-600 hover:text-red-700"
                  title="Delete section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Section Content */}
            {expandedSections.has(index) && (
              <div className="p-4 space-y-4">
                {editingIndex === index ? (
                  <>
                    {/* Type selector */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content Type
                      </label>
                      <select
                        value={section.type}
                        onChange={(e) => handleUpdateSection(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="text">Text</option>
                        <option value="list">List</option>
                        <option value="mixed">Mixed (Text + List)</option>
                        <option value="contact">Contact</option>
                      </select>
                    </div>
                    {/* Content editor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content
                        {(section.type === 'list' || section.type === 'mixed') && (
                          <span className="text-xs text-gray-500 ml-2">(Use line breaks for list items)</span>
                        )}
                      </label>
                      <textarea
                        value={section.content}
                        onChange={(e) => handleUpdateSection(index, 'content', e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                      />
                    </div>
                  </>
                ) : (
                  <div className="prose max-w-none">
                    {section.type === 'list' || section.type === 'mixed' ? (
                      <ul className="list-disc ml-6 space-y-1">
                        {section.content.split('\n').filter(line => line.trim()).map((item, i) => (
                          <li key={i} className="text-gray-700">{item}</li>
                        ))}
                      </ul>
                    ) : section.type === 'contact' ? (
                      <div className="bg-primary/5 p-4 rounded-lg">
                        {section.content.split('\n').filter(line => line.trim()).map((line, i) => (
                          <p key={i} className="text-gray-700">{line}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-700 whitespace-pre-wrap">{section.content}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Add Section Button */}
        <button
          onClick={handleAddSection}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition-colors flex items-center justify-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Section
        </button>
      </div>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default LegalContent;
