
import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, FileText, Users, Building2, MapPin, Calendar, ArrowRight, Tag, BookOpenCheck, MessageSquareText, Book, Scale, FileSpreadsheet, LayoutList, RefreshCw, Filter, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Command, CommandInput, CommandList, CommandGroup, CommandItem } from '../components/ui/command';

// Mock data for search suggestions
const mockSuggestions = {
  recents: [
    { id: 1, text: 'Contrato de Compraventa', type: 'document' },
    { id: 2, text: 'Juan Pérez', type: 'persona' },
    { id: 3, text: 'Demanda Laboral', type: 'document' }
  ],
  documents: [
    { id: 1, text: 'Contrato de Compraventa - Acme Corp', type: 'contrato' },
    { id: 2, text: 'Demanda Civil - Caso #45892', type: 'demanda' },
    { id: 3, text: 'Escritura Notarial - Propiedad Calle Real 123', type: 'escritura' }
  ],
  personas: [
    { id: 1, text: 'Juan Pérez', role: 'demandante' },
    { id: 2, text: 'María López', role: 'abogada' },
    { id: 3, text: 'Carlos Rodríguez', role: 'demandante' }
  ],
  organizaciones: [
    { id: 1, text: 'Acme Corp', type: 'empresa' },
    { id: 2, text: 'Industrial Technologies Inc.', type: 'empresa' },
    { id: 3, text: 'Tech Innovations SA', type: 'empresa' }
  ],
  ubicaciones: [
    { id: 1, text: 'Juzgado 45 Civil', type: 'juzgado' },
    { id: 2, text: 'Calle Real 123', type: 'propiedad' },
    { id: 3, text: 'Juzgado 3 Laboral', type: 'juzgado' }
  ],
  referencias: [
    { id: 1, text: 'Código Civil Art. 342', jurisprudencia: 'Ciudad de México' },
    { id: 2, text: 'Ley Federal del Trabajo Art. 123', jurisprudencia: 'Federal' },
    { id: 3, text: 'Código Penal Art. 215', jurisprudencia: 'Ciudad de México' }
  ],
  terminos: [
    { id: 1, text: 'indemnización', count: 15 },
    { id: 2, text: 'cláusula penal', count: 8 },
    { id: 3, text: 'incumplimiento contractual', count: 12 }
  ]
};

// Mock search results
const mockSearchResults = [
  {
    id: 1,
    title: 'Contrato de Compraventa - Acme Corp',
    type: 'contrato',
    fileType: 'pdf',
    highlight: "...una <mark>indemnización</mark> de acuerdo a la <mark>cláusula penal</mark> establecida...",
    updated_at: '2023-11-05T10:30:00',
    entities: {
      personas: ['Juan Pérez', 'María López'],
      organizaciones: ['Acme Corp']
    }
  },
  {
    id: 2,
    title: 'Demanda Civil - Caso #45892',
    type: 'demanda',
    fileType: 'docx',
    highlight: "...demanda por <mark>incumplimiento contractual</mark> contra Industrial Technologies...",
    updated_at: '2023-11-01T16:45:00',
    entities: {
      personas: ['Carlos Rodríguez'],
      organizaciones: ['Industrial Technologies Inc.'],
      ubicaciones: ['Juzgado 45 Civil']
    }
  },
  {
    id: 3,
    title: 'Escritura Notarial - Propiedad Calle Real 123',
    type: 'escritura',
    fileType: 'pdf',
    highlight: "...ubicado en <mark>Calle Real 123</mark>, se establece una <mark>cláusula penal</mark> en caso de...",
    updated_at: '2023-10-28T09:15:00',
    entities: {
      personas: ['Ana Martínez', 'José Sánchez'],
      ubicaciones: ['Calle Real 123']
    }
  }
];

const getIconForType = (type) => {
  switch (type) {
    case 'document':
    case 'contrato':
    case 'demanda':
    case 'escritura':
    case 'acuerdo':
      return <FileText className="w-4 h-4 mr-2 text-gray-500" />;
    case 'persona':
      return <Users className="w-4 h-4 mr-2 text-gray-500" />;
    case 'empresa':
    case 'organizacion':
      return <Building2 className="w-4 h-4 mr-2 text-gray-500" />;
    case 'juzgado':
    case 'propiedad':
    case 'ubicacion':
      return <MapPin className="w-4 h-4 mr-2 text-gray-500" />;
    default:
      return <Tag className="w-4 h-4 mr-2 text-gray-500" />;
  }
};

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    documentos: true,
    personas: true,
    organizaciones: true,
    ubicaciones: true,
    referencias: true,
    terminos: true
  });
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [advancedQuery, setAdvancedQuery] = useState({
    texto: '',
    entidad: '',
    tipo_documento: '',
    fecha_desde: '',
    fecha_hasta: '',
    referencia_legal: ''
  });

  useEffect(() => {
    // Focus the search input when the component mounts
    const searchInput = document.getElementById('main-search');
    if (searchInput) {
      searchInput.focus();
    }
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!query.trim() && !Object.values(advancedQuery).some(val => val.trim())) {
      return;
    }
    
    setIsSearching(true);
    
    // Simulate search delay
    setTimeout(() => {
      setSearchResults(mockSearchResults);
      setIsSearching(false);
    }, 600);
  };

  const handleCommandSelect = (item) => {
    setQuery(item.text);
    setCommandOpen(false);
    
    // Auto search after selection
    setIsSearching(true);
    setTimeout(() => {
      setSearchResults(mockSearchResults);
      setIsSearching(false);
    }, 600);
  };

  const toggleFilter = (filterName) => {
    setSearchFilters({
      ...searchFilters,
      [filterName]: !searchFilters[filterName]
    });
  };

  const toggleAdvancedSearch = () => {
    setAdvancedSearch(!advancedSearch);
  };

  const handleAdvancedQueryChange = (field, value) => {
    setAdvancedQuery({
      ...advancedQuery,
      [field]: value
    });
  };

  const clearSearch = () => {
    setQuery('');
    setAdvancedQuery({
      texto: '',
      entidad: '',
      tipo_documento: '',
      fecha_desde: '',
      fecha_hasta: '',
      referencia_legal: ''
    });
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 ml-16">
        <main className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">Buscador Avanzado</h1>
            <div className="flex space-x-2">
              <button 
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${advancedSearch ? 'bg-gray-100 text-gray-800 border-gray-300' : 'bg-white text-gray-600 border-gray-200'}`}
                onClick={toggleAdvancedSearch}
              >
                {advancedSearch ? 'Búsqueda Simple' : 'Búsqueda Avanzada'}
              </button>
              
              <button 
                className="btn-primary flex items-center space-x-2" 
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <SearchIcon className="w-4 h-4" />
                )}
                <span>Buscar</span>
              </button>
            </div>
          </div>
          
          {/* Main content */}
          <div className="bg-white shadow-sm rounded-lg mx-4 mb-8 overflow-hidden animate-fade-in">
            {/* Search form */}
            <form onSubmit={handleSearch} className="p-6 border-b border-gray-200">
              {!advancedSearch ? (
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="main-search"
                    type="text"
                    placeholder="Buscar documentos, personas, organizaciones, términos legales..."
                    className="pl-10 py-6 text-base focus:ring-crimson focus:border-crimson"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setCommandOpen(true)}
                    onBlur={() => setTimeout(() => setCommandOpen(false), 200)}
                  />
                  {query && (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setQuery('')}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  
                  {/* Command menu (autocomplete) */}
                  {commandOpen && (
                    <Command className="absolute z-10 top-full left-0 right-0 mt-1 border border-gray-200 shadow-md rounded-md overflow-hidden">
                      <CommandList>
                        {!query && (
                          <CommandGroup heading="Búsquedas recientes">
                            {mockSuggestions.recents.map((item) => (
                              <CommandItem
                                key={`recent-${item.id}`}
                                onSelect={() => handleCommandSelect(item)}
                                className="flex items-center py-2 cursor-pointer"
                              >
                                {getIconForType(item.type)}
                                <span>{item.text}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                        
                        <CommandGroup heading="Documentos">
                          {mockSuggestions.documents
                            .filter(doc => !query || doc.text.toLowerCase().includes(query.toLowerCase()))
                            .map((item) => (
                              <CommandItem
                                key={`doc-${item.id}`}
                                onSelect={() => handleCommandSelect(item)}
                                className="flex items-center py-2 cursor-pointer"
                              >
                                {getIconForType(item.type)}
                                <span>{item.text}</span>
                                <span className="ml-2 text-xs text-gray-500 capitalize">({item.type})</span>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                        
                        <CommandGroup heading="Personas">
                          {mockSuggestions.personas
                            .filter(person => !query || person.text.toLowerCase().includes(query.toLowerCase()))
                            .map((item) => (
                              <CommandItem
                                key={`person-${item.id}`}
                                onSelect={() => handleCommandSelect(item)}
                                className="flex items-center py-2 cursor-pointer"
                              >
                                <Users className="w-4 h-4 mr-2 text-gray-500" />
                                <span>{item.text}</span>
                                <span className="ml-2 text-xs text-gray-500 capitalize">({item.role})</span>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                        
                        <CommandGroup heading="Organizaciones">
                          {mockSuggestions.organizaciones
                            .filter(org => !query || org.text.toLowerCase().includes(query.toLowerCase()))
                            .map((item) => (
                              <CommandItem
                                key={`org-${item.id}`}
                                onSelect={() => handleCommandSelect(item)}
                                className="flex items-center py-2 cursor-pointer"
                              >
                                <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                                <span>{item.text}</span>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                        
                        <CommandGroup heading="Términos Legales">
                          {mockSuggestions.terminos
                            .filter(term => !query || term.text.toLowerCase().includes(query.toLowerCase()))
                            .map((item) => (
                              <CommandItem
                                key={`term-${item.id}`}
                                onSelect={() => handleCommandSelect(item)}
                                className="flex items-center py-2 cursor-pointer"
                              >
                                <Tag className="w-4 h-4 mr-2 text-gray-500" />
                                <span>{item.text}</span>
                                <span className="ml-2 text-xs text-gray-500">({item.count} documentos)</span>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium mb-3">Búsqueda Avanzada</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="texto" className="block text-sm font-medium text-gray-700 mb-1">Texto o palabras clave</label>
                      <Input
                        id="texto"
                        type="text"
                        placeholder="Texto a buscar en documentos"
                        value={advancedQuery.texto}
                        onChange={(e) => handleAdvancedQueryChange('texto', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="entidad" className="block text-sm font-medium text-gray-700 mb-1">Entidad (persona u organización)</label>
                      <Input
                        id="entidad"
                        type="text"
                        placeholder="Nombre de persona o empresa"
                        value={advancedQuery.entidad}
                        onChange={(e) => handleAdvancedQueryChange('entidad', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="tipo_documento" className="block text-sm font-medium text-gray-700 mb-1">Tipo de documento</label>
                      <select
                        id="tipo_documento"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-base focus:ring-crimson focus:border-crimson md:text-sm"
                        value={advancedQuery.tipo_documento}
                        onChange={(e) => handleAdvancedQueryChange('tipo_documento', e.target.value)}
                      >
                        <option value="">Todos los tipos</option>
                        <option value="contrato">Contrato</option>
                        <option value="demanda">Demanda</option>
                        <option value="acuerdo">Acuerdo</option>
                        <option value="escritura">Escritura</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="referencia_legal" className="block text-sm font-medium text-gray-700 mb-1">Referencia legal</label>
                      <Input
                        id="referencia_legal"
                        type="text"
                        placeholder="Ej. Código Civil Art. 123"
                        value={advancedQuery.referencia_legal}
                        onChange={(e) => handleAdvancedQueryChange('referencia_legal', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="fecha_desde" className="block text-sm font-medium text-gray-700 mb-1">Fecha desde</label>
                      <Input
                        id="fecha_desde"
                        type="date"
                        value={advancedQuery.fecha_desde}
                        onChange={(e) => handleAdvancedQueryChange('fecha_desde', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="fecha_hasta" className="block text-sm font-medium text-gray-700 mb-1">Fecha hasta</label>
                      <Input
                        id="fecha_hasta"
                        type="date"
                        value={advancedQuery.fecha_hasta}
                        onChange={(e) => handleAdvancedQueryChange('fecha_hasta', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      type="button" 
                      className="text-sm text-gray-500 hover:text-crimson"
                      onClick={clearSearch}
                    >
                      Limpiar formulario
                    </button>
                  </div>
                </div>
              )}
              
              {/* Filter tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  type="button"
                  className={`text-xs px-3 py-1 rounded-full border ${searchFilters.documentos ? 'bg-crimson/10 text-crimson border-crimson/20' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                  onClick={() => toggleFilter('documentos')}
                >
                  <FileText className="w-3 h-3 inline-block mr-1" />
                  Documentos
                </button>
                
                <button
                  type="button"
                  className={`text-xs px-3 py-1 rounded-full border ${searchFilters.personas ? 'bg-crimson/10 text-crimson border-crimson/20' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                  onClick={() => toggleFilter('personas')}
                >
                  <Users className="w-3 h-3 inline-block mr-1" />
                  Personas
                </button>
                
                <button
                  type="button"
                  className={`text-xs px-3 py-1 rounded-full border ${searchFilters.organizaciones ? 'bg-crimson/10 text-crimson border-crimson/20' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                  onClick={() => toggleFilter('organizaciones')}
                >
                  <Building2 className="w-3 h-3 inline-block mr-1" />
                  Organizaciones
                </button>
                
                <button
                  type="button"
                  className={`text-xs px-3 py-1 rounded-full border ${searchFilters.ubicaciones ? 'bg-crimson/10 text-crimson border-crimson/20' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                  onClick={() => toggleFilter('ubicaciones')}
                >
                  <MapPin className="w-3 h-3 inline-block mr-1" />
                  Ubicaciones
                </button>
                
                <button
                  type="button"
                  className={`text-xs px-3 py-1 rounded-full border ${searchFilters.referencias ? 'bg-crimson/10 text-crimson border-crimson/20' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                  onClick={() => toggleFilter('referencias')}
                >
                  <Scale className="w-3 h-3 inline-block mr-1" />
                  Referencias Legales
                </button>
                
                <button
                  type="button"
                  className={`text-xs px-3 py-1 rounded-full border ${searchFilters.terminos ? 'bg-crimson/10 text-crimson border-crimson/20' : 'bg-gray-100 text-gray-600 border-gray-200'}`}
                  onClick={() => toggleFilter('terminos')}
                >
                  <Tag className="w-3 h-3 inline-block mr-1" />
                  Términos Legales
                </button>
              </div>
            </form>
            
            {/* Search capabilities info - only show when no search results */}
            {!searchResults.length && !isSearching && (
              <div className="p-6">
                <div className="glass-panel p-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                    <SearchIcon className="w-5 h-5 mr-2 text-crimson" />
                    Capacidades del buscador
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Nuestro buscador avanzado permite encontrar documentos y entidades en su repositorio utilizando diversos criterios y filtros.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-md border border-gray-100 flex items-start">
                      <BookOpenCheck className="w-8 h-8 text-crimson mr-3 mt-1" />
                      <div>
                        <h4 className="font-medium">Búsqueda en Contenido</h4>
                        <p className="text-sm text-gray-600">Busca palabras o frases específicas dentro del texto de los documentos.</p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-md border border-gray-100 flex items-start">
                      <MessageSquareText className="w-8 h-8 text-crimson mr-3 mt-1" />
                      <div>
                        <h4 className="font-medium">Búsqueda Semántica</h4>
                        <p className="text-sm text-gray-600">Encuentra documentos relacionados con un tema, incluso si no contienen las palabras exactas.</p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-md border border-gray-100 flex items-start">
                      <Book className="w-8 h-8 text-crimson mr-3 mt-1" />
                      <div>
                        <h4 className="font-medium">Referencias Legales</h4>
                        <p className="text-sm text-gray-600">Busca por artículos específicos de leyes o códigos mencionados en los documentos.</p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-md border border-gray-100 flex items-start">
                      <Tag className="w-8 h-8 text-crimson mr-3 mt-1" />
                      <div>
                        <h4 className="font-medium">Entidades y Metadatos</h4>
                        <p className="text-sm text-gray-600">Encuentra documentos por personas, organizaciones, ubicaciones o términos legales.</p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-md border border-gray-100 flex items-start">
                      <FileSpreadsheet className="w-8 h-8 text-crimson mr-3 mt-1" />
                      <div>
                        <h4 className="font-medium">Filtros Combinados</h4>
                        <p className="text-sm text-gray-600">Combina múltiples criterios para búsquedas precisas y refinadas.</p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 rounded-md border border-gray-100 flex items-start">
                      <LayoutList className="w-8 h-8 text-crimson mr-3 mt-1" />
                      <div>
                        <h4 className="font-medium">Historial Indexado</h4>
                        <p className="text-sm text-gray-600">Busca a través de versiones históricas de los documentos para seguir su evolución.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center py-6 text-gray-500">
                  <p>Comienza una búsqueda usando el formulario superior</p>
                </div>
              </div>
            )}
            
            {/* Loading state */}
            {isSearching && (
              <div className="flex flex-col items-center justify-center py-16">
                <RefreshCw className="w-12 h-12 text-crimson/40 animate-spin mb-4" />
                <p className="text-gray-600">Buscando documentos...</p>
              </div>
            )}
            
            {/* Search results */}
            {searchResults.length > 0 && !isSearching && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Resultados de la búsqueda</h3>
                
                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <div key={result.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800 mb-1 flex items-center">
                            {getIconForType(result.type)}
                            {result.title}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500 mb-3 space-x-3">
                            <span className="capitalize">{result.type}</span>
                            <span>•</span>
                            <span>{result.fileType.toUpperCase()}</span>
                            <span>•</span>
                            <span>{new Date(result.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <button className="text-sm text-crimson hover:text-crimson-600 flex items-center">
                          Ver documento
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                      </div>
                      
                      {/* Text highlight */}
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-3" dangerouslySetInnerHTML={{ __html: result.highlight }} />
                      
                      {/* Entities */}
                      <div className="flex flex-wrap gap-2">
                        {result.entities.personas && result.entities.personas.map((persona, idx) => (
                          <span key={`persona-${idx}`} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {persona}
                          </span>
                        ))}
                        
                        {result.entities.organizaciones && result.entities.organizaciones.map((org, idx) => (
                          <span key={`org-${idx}`} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full flex items-center">
                            <Building2 className="w-3 h-3 mr-1" />
                            {org}
                          </span>
                        ))}
                        
                        {result.entities.ubicaciones && result.entities.ubicaciones.map((ubicacion, idx) => (
                          <span key={`ubicacion-${idx}`} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {ubicacion}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SearchPage;
