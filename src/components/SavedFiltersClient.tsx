'use client';

import { useState, useEffect } from 'react';
import { Save, Filter, X } from 'lucide-react';

interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, any>;
  created_at: string;
}

interface SavedFiltersClientProps {
  initialFilters: SavedFilter[];
}

export default function SavedFiltersClient({ initialFilters }: SavedFiltersClientProps) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(initialFilters);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const saveCurrentFilters = async () => {
    if (!filterName.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/recruiter/saved-filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: filterName.trim(),
          filters: {} // This would be the current browse filters
        })
      });
      
      if (response.ok) {
        const newFilter = await response.json();
        setSavedFilters(prev => [newFilter, ...prev]);
        setFilterName('');
        setShowSaveModal(false);
      }
    } catch (error) {
      console.error('Failed to save filters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFilter = async (filterId: string) => {
    try {
      const response = await fetch(`/api/recruiter/saved-filters/${filterId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSavedFilters(prev => prev.filter(f => f.id !== filterId));
      }
    } catch (error) {
      console.error('Failed to delete filter:', error);
    }
  };

  const applyFilter = (filters: Record<string, any>) => {
    // This would apply filters to the browse/search
    // For now, we'll redirect to browse with query params
    const queryString = new URLSearchParams(filters as Record<string, string>).toString();
    window.location.href = `/browse?${queryString}`;
  };

  return (
    <div className="border rounded p-4 bg-white mb-8">
      <div className="flex items-center gap-2 mb-4">
        <button 
          className="btn btn-primary px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowSaveModal(true)}
        >
          Save current filters
        </button>
        <a 
          className="btn px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" 
          href={`/api/admin/export/pitches.csv${typeof window !== 'undefined' ? window.location.search : ''}`} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Download report (CSV)
        </a>
      </div>
      
      {/* Render saved filters as chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        {savedFilters.length > 0 ? (
          savedFilters.map(filter => (
            <div key={filter.id} className="flex items-center gap-1 px-2 py-1 rounded border text-xs bg-gray-50">
              <Filter className="w-3 h-3 text-gray-500" />
              <button
                onClick={() => applyFilter(filter.filters)}
                className="hover:text-blue-600 text-gray-700"
              >
                {filter.name}
              </button>
              <button
                onClick={() => deleteFilter(filter.id)}
                className="text-gray-400 hover:text-red-600 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))
        ) : (
          <span className="px-2 py-1 rounded border text-xs text-gray-500">No saved filters yet</span>
        )}
      </div>

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
