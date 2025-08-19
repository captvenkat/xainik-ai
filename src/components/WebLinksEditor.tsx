'use client';

import { useState } from 'react';
import { Plus, X, ExternalLink, Edit2, Trash2, Linkedin, Twitter, Youtube, Github, Globe } from 'lucide-react';
import { WebLink, WEB_LINK_TYPES, validateWebLink } from '@/types/enhanced-profile';

interface WebLinksEditorProps {
  links: WebLink[];
  onChange: (links: WebLink[]) => void;
  disabled?: boolean;
  error?: string;
}

export default function WebLinksEditor({
  links,
  onChange,
  disabled = false,
  error
}: WebLinksEditorProps) {
  const [editingLink, setEditingLink] = useState<WebLink | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      case 'youtube':
        return <Youtube className="h-4 w-4" />;
      case 'github':
        return <Github className="h-4 w-4" />;
      case 'website':
        return <Globe className="h-4 w-4" />;
      default:
        return <Globe className="h-4 w-4" />;
    }
  };

  const getLinkTypeInfo = (type: string) => {
    return WEB_LINK_TYPES.find(linkType => linkType.value === type);
  };

  const addLink = () => {
    const newLink: WebLink = {
      id: Date.now().toString(),
      type: 'linkedin',
      url: '',
      label: '',
      isActive: true
    };
    setEditingLink(newLink);
    setShowAddForm(true);
  };

  const editLink = (link: WebLink) => {
    setEditingLink({ ...link });
    setShowAddForm(true);
  };

  const deleteLink = (linkId: string) => {
    onChange(links.filter(link => link.id !== linkId));
  };

  const saveLink = () => {
    if (!editingLink) return;

    const validation = validateWebLink(editingLink);
    if (validation) {
      alert(validation);
      return;
    }

    const existingIndex = links.findIndex(link => link.id === editingLink.id);
    
    if (existingIndex >= 0) {
      // Update existing link
      const updatedLinks = [...links];
      updatedLinks[existingIndex] = editingLink;
      onChange(updatedLinks);
    } else {
      // Add new link
      onChange([...links, editingLink]);
    }

    setEditingLink(null);
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingLink(null);
    setShowAddForm(false);
  };

  const updateEditingLink = (field: keyof WebLink, value: string | boolean) => {
    if (!editingLink) return;
    setEditingLink({ ...editingLink, [field]: value });
  };

  const toggleLinkActive = (linkId: string) => {
    const updatedLinks = links.map(link =>
      link.id === linkId ? { ...link, isActive: !link.isActive } : link
    );
    onChange(updatedLinks);
  };

  return (
    <div className="space-y-4">
      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Existing Links */}
      <div className="space-y-3">
        {links.map((link) => (
          <div
            key={link.id}
            className={`flex items-center justify-between p-3 border rounded-lg ${
              link.isActive ? 'bg-white border-gray-300' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className={`flex-shrink-0 ${!link.isActive ? 'opacity-50' : ''}`}>
                {getIcon(link.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className={`font-medium text-sm ${!link.isActive ? 'text-gray-500' : 'text-gray-900'}`}>
                    {link.label || getLinkTypeInfo(link.type)?.label}
                  </span>
                  {!link.isActive && (
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 mt-1">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm truncate ${
                      link.isActive 
                        ? 'text-blue-600 hover:text-blue-800' 
                        : 'text-gray-500'
                    }`}
                    onClick={(e) => {
                      if (!link.isActive) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {link.url}
                  </a>
                  {link.isActive && (
                    <ExternalLink className="h-3 w-3 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => toggleLinkActive(link.id)}
                disabled={disabled}
                className={`px-2 py-1 text-xs rounded ${
                  link.isActive
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {link.isActive ? 'Active' : 'Inactive'}
              </button>
              
              <button
                type="button"
                onClick={() => editLink(link)}
                disabled={disabled}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                onClick={() => deleteLink(link.id)}
                disabled={disabled}
                className="p-1 text-red-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && editingLink && (
        <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                {links.find(link => link.id === editingLink.id) ? 'Edit Link' : 'Add New Link'}
              </h4>
              <button
                type="button"
                onClick={cancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform
                </label>
                <select
                  value={editingLink.type}
                  onChange={(e) => updateEditingLink('type', e.target.value)}
                  disabled={disabled}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                >
                  {WEB_LINK_TYPES.map((linkType) => (
                    <option key={linkType.value} value={linkType.value}>
                      {linkType.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label (Optional)
                </label>
                <input
                  type="text"
                  value={editingLink.label || ''}
                  onChange={(e) => updateEditingLink('label', e.target.value)}
                  disabled={disabled}
                  placeholder="e.g., My Professional Profile"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL *
              </label>
              <input
                type="url"
                value={editingLink.url}
                onChange={(e) => updateEditingLink('url', e.target.value)}
                disabled={disabled}
                placeholder={getLinkTypeInfo(editingLink.type)?.placeholder}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                {getLinkTypeInfo(editingLink.type)?.placeholder}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={saveLink}
                disabled={disabled || !editingLink.url.trim()}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Link
              </button>
              
              <button
                type="button"
                onClick={cancelEdit}
                disabled={disabled}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Link Button */}
      {!showAddForm && (
        <button
          type="button"
          onClick={addLink}
          disabled={disabled}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Web Link
        </button>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Add up to 5 web links to showcase your online presence. All links will be clickable and open in new tabs.
      </p>
    </div>
  );
}
