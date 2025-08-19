'use client';

import { useState } from 'react';
import { Plus, X, ExternalLink, Linkedin, Twitter, Youtube, Github, Globe } from 'lucide-react';
import { WebLink, WebLinkType, WEB_LINK_TYPES, validateWebLink } from '../../types/enhanced-profile';

interface WebLinksEditorProps {
  links: WebLink[];
  onChange: (links: WebLink[]) => void;
  maxLinks?: number;
  disabled?: boolean;
  error?: string;
}

export default function WebLinksEditor({
  links,
  onChange,
  maxLinks = 5,
  disabled = false,
  error
}: WebLinksEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newLink, setNewLink] = useState<Partial<WebLink>>({});
  const [validationError, setValidationError] = useState<string>('');

  const getIcon = (type: WebLinkType) => {
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
        return <ExternalLink className="h-4 w-4" />;
    }
  };

  const handleAddLink = () => {
    if (!newLink.type || !newLink.url) {
      setValidationError('Please select a type and enter a URL');
      return;
    }

    const validation = validateWebLink(newLink as WebLink);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid link');
      return;
    }

    const linkToAdd: WebLink = {
      type: newLink.type,
      url: validation.normalizedUrl || newLink.url,
      label: newLink.label
    };

    onChange([...links, linkToAdd]);
    setNewLink({});
    setIsAdding(false);
    setValidationError('');
  };

  const handleRemoveLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    onChange(newLinks);
  };

  const handleUpdateLink = (index: number, field: keyof WebLink, value: string) => {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    onChange(newLinks);
  };

  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Web Links
        </label>
        {!disabled && links.length < maxLinks && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Link
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Existing links */}
      <div className="space-y-2">
        {links.map((link, index) => (
          <div key={index} className="flex items-center space-x-2 p-3 border border-gray-200 rounded-md">
            <div className="flex-shrink-0 text-gray-500">
              {getIcon(link.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {link.type}
                </span>
                {link.label && (
                  <span className="text-sm text-gray-500">({link.label})</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => openLink(link.url)}
                className="text-sm text-blue-600 hover:text-blue-800 truncate block text-left"
                title={link.url}
              >
                {link.url}
              </button>
            </div>

            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemoveLink(index)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add new link form */}
      {isAdding && !disabled && (
        <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link Type
              </label>
              <select
                value={newLink.type || ''}
                onChange={(e) => setNewLink({ ...newLink, type: e.target.value as WebLinkType })}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select type</option>
                {WEB_LINK_TYPES.map((linkType) => (
                  <option key={linkType.type} value={linkType.type}>
                    {linkType.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="url"
                value={newLink.url || ''}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                placeholder={
                  newLink.type 
                    ? WEB_LINK_TYPES.find(lt => lt.type === newLink.type)?.placeholder 
                    : 'Enter URL'
                }
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label (Optional)
              </label>
              <input
                type="text"
                value={newLink.label || ''}
                onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
                placeholder="e.g., My Portfolio"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {validationError && (
              <p className="text-sm text-red-600">{validationError}</p>
            )}

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleAddLink}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Link
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewLink({});
                  setValidationError('');
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help text */}
      <p className="text-sm text-gray-500">
        Add up to {maxLinks} web links to your profile. These will be displayed as clickable links.
      </p>
    </div>
  );
}
