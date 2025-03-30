
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Toolbar from '../components/Toolbar';
import DocumentCard from '../components/DocumentCard';
import { RefreshCw, FileText, Folder, Filter, X } from 'lucide-react';

// Mock data for documents
const mockDocuments = [
  {
    id: 1,
    title: 'Contrato de Compraventa - Acme Corp',
    description: 'Contrato para la compra de bienes entre Acme Corp y Productos Industriales SA',
    type: 'contrato',
    fileType: 'pdf',
    versions: 3,
    author: 'Juan Pérez',
    updated_at: '2023-11-05T10:30:00',
    created_at: '2023-10-01T08:15:00',
    entities: {
      personas: [
        { nombre: 'Juan Pérez', rol: 'demandante', tipo: 'física' },
        { nombre: 'María López', rol: 'abogada', tipo: 'física' }
      ],
      organizaciones: [
        { nombre: 'Acme Corp', tipo: 'empresa' }
      ]
    }
  },
  {
    id: 2,
    title: 'Demanda Civil - Caso #45892',
    description: 'Demanda por incumplimiento de contrato contra Industrial Technologies Inc.',
    type: 'demanda',
    fileType: 'docx',
    versions: 2,
    author: 'María López',
    updated_at: '2023-11-01T16:45:00',
    created_at: '2023-10-15T14:20:00',
    entities: {
      personas: [
        { nombre: 'Carlos Rodríguez', rol: 'demandante', tipo: 'física' }
      ],
      organizaciones: [
        { nombre: 'Industrial Technologies Inc.', tipo: 'empresa' }
      ],
      ubicaciones: [
        { tipo: 'juzgado', valor: 'Juzgado 45 Civil' }
      ]
    }
  },
  {
    id: 3,
    title: 'Escritura Notarial - Propiedad Calle Real 123',
    description: 'Escritura de compraventa de inmueble residencial',
    type: 'escritura',
    fileType: 'pdf',
    versions: 1,
    author: 'Roberto Gómez',
    updated_at: '2023-10-28T09:15:00',
    created_at: '2023-10-28T09:15:00',
    entities: {
      personas: [
        { nombre: 'Ana Martínez', rol: 'compradora', tipo: 'física' },
        { nombre: 'José Sánchez', rol: 'vendedor', tipo: 'física' }
      ],
      ubicaciones: [
        { tipo: 'propiedad', valor: 'Calle Real 123' }
      ]
    }
  },
  {
    id: 4,
    title: 'Acuerdo de Confidencialidad - Proyecto Aurora',
    description: 'Acuerdo NDA para protección de información confidencial del Proyecto Aurora',
    type: 'acuerdo',
    fileType: 'pdf',
    versions: 2,
    author: 'Ana Martínez',
    updated_at: '2023-10-20T11:30:00',
    created_at: '2023-09-15T10:00:00',
    entities: {
      personas: [
        { nombre: 'Luis González', rol: 'representante', tipo: 'física' }
      ],
      organizaciones: [
        { nombre: 'Tech Innovations SA', tipo: 'empresa' },
        { nombre: 'Global Solutions Inc.', tipo: 'empresa' }
      ]
    }
  },
  {
    id: 5,
    title: 'Contrato Laboral - Desarrollador Senior',
    description: 'Contrato de trabajo para posición de Desarrollador Senior',
    type: 'contrato',
    fileType: 'docx',
    versions: 1,
    author: 'Carmen Torres',
    updated_at: '2023-10-18T15:20:00',
    created_at: '2023-10-18T15:20:00',
    entities: {
      personas: [
        { nombre: 'Pablo Jiménez', rol: 'empleado', tipo: 'física' }
      ],
      organizaciones: [
        { nombre: 'Software Systems SA', tipo: 'empresa' }
      ]
    }
  },
  {
    id: 6,
    title: 'Demanda Laboral - Expediente #J789',
    description: 'Demanda por despido injustificado contra Retail Services Inc.',
    type: 'demanda',
    fileType: 'pdf',
    versions: 4,
    author: 'María López',
    updated_at: '2023-11-07T10:15:00',
    created_at: '2023-09-10T09:30:00',
    entities: {
      personas: [
        { nombre: 'Sofía Vargas', rol: 'demandante', tipo: 'física' }
      ],
      organizaciones: [
        { nombre: 'Retail Services Inc.', tipo: 'empresa' }
      ],
      ubicaciones: [
        { tipo: 'juzgado', valor: 'Juzgado 3 Laboral' }
      ]
    }
  }
];

// Mock entities data
const mockEntities = {
  personas: [
    { id: 1, nombre: 'Juan Pérez', tipo: 'física', documentCount: 4 },
    { id: 2, nombre: 'María López', tipo: 'física', documentCount: 7 },
    { id: 3, nombre: 'Carlos Rodríguez', tipo: 'física', documentCount: 2 },
    { id: 4, nombre: 'Ana Martínez', tipo: 'física', documentCount: 3 }
  ],
  organizaciones: [
    { id: 1, nombre: 'Acme Corp', tipo: 'empresa', documentCount: 5 },
    { id: 2, nombre: 'Industrial Technologies Inc.', tipo: 'empresa', documentCount: 2 },
    { id: 3, nombre: 'Tech Innovations SA', tipo: 'empresa', documentCount: 3 }
  ],
  ubicaciones: [
    { id: 1, valor: 'Juzgado 45 Civil', tipo: 'juzgado', documentCount: 4 },
    { id: 2, valor: 'Juzgado 3 Laboral', tipo: 'juzgado', documentCount: 2 },
    { id: 3, valor: 'Calle Real 123', tipo: 'propiedad', documentCount: 1 }
  ]
};

const Index = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [activeFilter, setActiveFilter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setDocuments(mockDocuments);
      setFilteredDocuments(mockDocuments);
    }, 500);
  }, []);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredDocuments(documents);
      return;
    }
    
    const lowercaseQuery = query.toLowerCase();
    const filtered = documents.filter(doc => 
      doc.title.toLowerCase().includes(lowercaseQuery) || 
      (doc.description && doc.description.toLowerCase().includes(lowercaseQuery)) ||
      doc.type.toLowerCase().includes(lowercaseQuery) ||
      (doc.entities && doc.entities.personas && doc.entities.personas.some(
        p => p.nombre.toLowerCase().includes(lowercaseQuery)
      )) ||
      (doc.entities && doc.entities.organizaciones && doc.entities.organizaciones.some(
        o => o.nombre.toLowerCase().includes(lowercaseQuery)
      ))
    );
    
    setFilteredDocuments(filtered);
  };

  const handleSort = (sortOption) => {
    const sorted = [...filteredDocuments];
    
    switch (sortOption) {
      case 'updated_at':
        sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        break;
      case 'created_at':
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }
    
    setFilteredDocuments(sorted);
  };

  const toggleItemSelection = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredDocuments.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredDocuments.map(doc => doc.id));
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const applyEntityFilter = (entityType, entityId) => {
    setActiveFilter({ type: entityType, id: entityId });
    
    // In a real app, you would filter based on relationships to entities
    // This is just a simulation
    if (entityType === 'persona') {
      const persona = mockEntities.personas.find(p => p.id === entityId);
      handleSearchChange(persona.nombre);
    } else if (entityType === 'organizacion') {
      const org = mockEntities.organizaciones.find(o => o.id === entityId);
      handleSearchChange(org.nombre);
    } else if (entityType === 'ubicacion') {
      const location = mockEntities.ubicaciones.find(l => l.id === entityId);
      handleSearchChange(location.valor);
    }
  };

  const clearFilter = () => {
    setActiveFilter(null);
    setSearchQuery('');
    setFilteredDocuments(documents);
  };

  const simulateSyncDocuments = () => {
    // Simulating a sync operation
    console.log("Sincronizando documentos...");
    // Here you would add logic to fetch new documents from the server
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 ml-16">
        <main className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">Documentos Recientes</h1>
            <button className="btn-primary flex items-center space-x-2" onClick={simulateSyncDocuments}>
              <RefreshCw className="w-4 h-4" />
              <span>Sincronizar Documentos</span>
            </button>
          </div>
          
          {/* Main content */}
          <div className="bg-white shadow-sm rounded-lg mx-4 mb-8 overflow-hidden transition-all duration-300 animate-fade-in">
            <Toolbar 
              onSearchChange={handleSearchChange}
              selectedItems={selectedItems}
              onSelectAll={handleSelectAll}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onSort={handleSort}
              toggleFilters={toggleFilters}
              showFilters={showFilters}
            />
            
            <div className="flex">
              {/* Filters sidebar */}
              {showFilters && (
                <div className="w-64 border-r border-gray-200 p-4 animate-slide-in">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium flex items-center">
                      <Filter className="w-4 h-4 mr-1" />
                      Filtros
                    </h3>
                    <button 
                      className="text-gray-400 hover:text-gray-600"
                      onClick={toggleFilters}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Tipo de Documento</h4>
                      <div className="space-y-1">
                        {['contrato', 'demanda', 'acuerdo', 'escritura'].map(type => (
                          <div key={type} className="flex items-center">
                            <input 
                              type="checkbox" 
                              id={`type-${type}`} 
                              className="w-3.5 h-3.5 rounded border-gray-300 text-crimson" 
                            />
                            <label htmlFor={`type-${type}`} className="ml-2 text-sm capitalize">
                              {type}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Personas</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-1">
                        {mockEntities.personas.map(persona => (
                          <div key={persona.id} className="flex items-center">
                            <input 
                              type="checkbox" 
                              id={`persona-${persona.id}`} 
                              className="w-3.5 h-3.5 rounded border-gray-300 text-crimson" 
                              onChange={() => applyEntityFilter('persona', persona.id)}
                            />
                            <label htmlFor={`persona-${persona.id}`} className="ml-2 text-sm flex-1 truncate">
                              {persona.nombre}
                            </label>
                            <span className="text-xs text-gray-500">{persona.documentCount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Organizaciones</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-1">
                        {mockEntities.organizaciones.map(org => (
                          <div key={org.id} className="flex items-center">
                            <input 
                              type="checkbox" 
                              id={`org-${org.id}`} 
                              className="w-3.5 h-3.5 rounded border-gray-300 text-crimson" 
                              onChange={() => applyEntityFilter('organizacion', org.id)}
                            />
                            <label htmlFor={`org-${org.id}`} className="ml-2 text-sm flex-1 truncate">
                              {org.nombre}
                            </label>
                            <span className="text-xs text-gray-500">{org.documentCount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Ubicaciones</h4>
                      <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-1">
                        {mockEntities.ubicaciones.map(location => (
                          <div key={location.id} className="flex items-center">
                            <input 
                              type="checkbox" 
                              id={`location-${location.id}`} 
                              className="w-3.5 h-3.5 rounded border-gray-300 text-crimson" 
                              onChange={() => applyEntityFilter('ubicacion', location.id)}
                            />
                            <label htmlFor={`location-${location.id}`} className="ml-2 text-sm flex-1 truncate">
                              {location.valor}
                            </label>
                            <span className="text-xs text-gray-500">{location.documentCount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <button 
                      className="w-full py-1.5 bg-gray-100 text-sm rounded-md hover:bg-gray-200 transition-colors"
                      onClick={clearFilter}
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              )}
              
              {/* Documents */}
              <div className={`flex-1 p-4 ${showFilters ? 'pl-0' : ''}`}>
                {/* Active filters */}
                {activeFilter && (
                  <div className="flex items-center mb-4 px-1">
                    <span className="text-sm text-gray-500 mr-2">Filtro activo:</span>
                    <div className="bg-crimson/10 text-crimson px-2 py-0.5 rounded-full text-xs flex items-center">
                      {searchQuery}
                      <button className="ml-1" onClick={clearFilter}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Filter toggle button (removed as we now use the one in toolbar) */}
                
                {filteredDocuments.length > 0 ? (
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4' : 'space-y-1'}>
                    {filteredDocuments.map(document => (
                      <DocumentCard 
                        key={document.id}
                        document={document}
                        isSelected={selectedItems.includes(document.id)}
                        onSelect={toggleItemSelection}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    {searchQuery ? (
                      <div className="flex flex-col items-center">
                        <FileText className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-1">No se encontraron documentos</h3>
                        <p className="text-gray-500 mb-4">No hay resultados para "{searchQuery}"</p>
                        <button 
                          className="btn-ghost"
                          onClick={clearFilter}
                        >
                          Limpiar búsqueda
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Folder className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-1">No hay documentos</h3>
                        <p className="text-gray-500 mb-4">Sincronice para obtener los documentos disponibles</p>
                        <button className="btn-primary flex items-center space-x-2" onClick={simulateSyncDocuments}>
                          <RefreshCw className="w-4 h-4" />
                          <span>Sincronizar Documentos</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
