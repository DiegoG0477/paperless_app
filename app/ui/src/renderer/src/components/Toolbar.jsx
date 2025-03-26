
import React, { useState } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  Grid, 
  List, 
  BadgeCheck
} from 'lucide-react';

const Toolbar = ({ 
  onSearchChange, 
  selectedItems, 
  onSelectAll, 
  viewMode, 
  setViewMode,
  onSort,
  toggleFilters,
  showFilters
}) => {
  const [sortOption, setSortOption] = useState('updated_at');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const handleSortChange = (option) => {
    setSortOption(option);
    setShowSortMenu(false);
    onSort(option);
  };

  return (
    <div className="w-full">
      {/* Path and search bar */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center text-sm text-gray-500 space-x-1">
          <span className="hover:text-gray-700 cursor-pointer">Todos los documentos</span>
          <span>&gt;</span>
          <span className="text-gray-700 font-medium">Documentos recientes</span>
        </div>
        
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar documentos..." 
            className="search-input pl-9"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      {/* Options toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
        <div className="text-sm">
          {selectedItems.length > 0 ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <BadgeCheck className="w-5 h-5 text-crimson" />
                <span>{selectedItems.length} elementos seleccionados</span>
              </div>
              <button className="btn-ghost" onClick={onSelectAll}>
                Seleccionar Todo
              </button>
            </div>
          ) : (
            <div className="flex space-x-6">
              <div className="relative">
                <button 
                  className="btn-ghost flex items-center space-x-1" 
                  onClick={() => setShowSortMenu(!showSortMenu)}
                >
                  <span>Ordenar por</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showSortMenu && (
                  <div className="absolute top-full left-0 mt-1 bg-white shadow-md rounded-md py-1 z-10 w-56 border border-gray-200 animate-fade-in">
                    <button 
                      className={`px-3 py-2 text-left w-full hover:bg-gray-50 ${sortOption === 'updated_at' ? 'text-crimson' : ''}`}
                      onClick={() => handleSortChange('updated_at')}
                    >
                      Fecha de última modificación
                    </button>
                    <button 
                      className={`px-3 py-2 text-left w-full hover:bg-gray-50 ${sortOption === 'created_at' ? 'text-crimson' : ''}`}
                      onClick={() => handleSortChange('created_at')}
                    >
                      Fecha de creación
                    </button>
                    <button 
                      className={`px-3 py-2 text-left w-full hover:bg-gray-50 ${sortOption === 'title' ? 'text-crimson' : ''}`}
                      onClick={() => handleSortChange('title')}
                    >
                      Alfabético (título)
                    </button>
                  </div>
                )}
              </div>
              
              <button 
                className={`btn-ghost flex items-center space-x-1 ${showFilters ? 'btn-ghost-active' : ''}`}
                onClick={toggleFilters}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filtros</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
