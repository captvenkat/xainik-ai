'use client';

import { useState, useEffect } from 'react';
import { Save, Filter, X, Download } from 'lucide-react';

interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, any>;
  created_at: string;
}

interface SavedFiltersProps {
  currentFilters: Record<string, any>;
  onApplyFilters: (filters: Record<string, any>) => void;
  onExportCSV: () => void;
}

export default function SavedFilters({ currentFilters, onApplyFilters, onExportCSV }: SavedFiltersProps) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load saved filters on component mount
  useEffect(() => {
    loadSavedFilters();
  }, []);

  const loadSavedFilters = async () => {
    try {
      const response = await fetch('/api/recruiter/saved-filters', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSavedFilters(data);
      }
    } catch (error) {
    }
  };

  const saveCurrentFilters = async () => {
    if (!filterName.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/recruiter/saved-filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: filterName.trim(),
          filters: currentFilters
        })
      });
      
      if (response.ok) {
        setFilterName('');
        setShowSaveModal(false);
        await loadSavedFilters();
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFilter = async (filterId: string) => {
    try {
      const response = await fetch(`/api/recruiter/saved-filters/${filterId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        await loadSavedFilters();
      }
    } catch (error) {
    }
  };

  const applyFilter = (filters: Record<string, any>) => {
    onApplyFilters(filters);
  };

  return (
    <div className="mb-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Search & Filters</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            Save Filters
          </button>
          <button
            onClick={onExportCSV}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>
      </div>

      {/* Saved filters chips */}
      {savedFilters.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Saved Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map((filter) => (
              <div
                key={filter.id}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                <Filter className="w-3 h-3" />
                <button
                  onClick={() => applyFilter(filter.filters)}
                  className="hover:text-blue-600"
                >
                  {filter.name}
                </button>
                <button
                  onClick={() => deleteFilter(filter.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save filter modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Save Current Filters</h3>
            <input
              type="text"
              placeholder="Filter name (e.g., 'Senior Developers')"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={saveCurrentFilters}
                disabled={isLoading || !filterName.trim()}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
