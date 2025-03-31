import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search as SearchIcon,
  FileText,
  Users,
  Building2,
  MapPin,
  Tag,
  RefreshCw,
  X
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import { Input } from "../components/ui/input";
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem
} from "../components/ui/command";
import { toast } from "sonner";
import { useIpc } from "../../../hooks/useIpc";

// Helper function to build a composite searchable string from a document,
// considering active filters. It concatenates only those fields for which the filter is enabled.
const buildSearchComposite = (doc, filters) => {
  let composite = "";
  // "documentos" fields
  if (filters.documentos) {
    composite += ` ${doc.title || ""} ${doc.description || ""} ${doc.type || ""} ${doc.fileType || ""}`;
  }
  // "personas" fields: assuming each entry in entities.personas is an object with a "name" property.
  if (filters.personas && doc.entities?.personas) {
    composite += " " + doc.entities.personas.map(p => (p.name || p)).join(" ");
  }
  // "organizaciones" fields: assuming each entry in entities.organizaciones is an object with a "name" property.
  if (filters.organizaciones && doc.entities?.organizaciones) {
    composite += " " + doc.entities.organizaciones.map(o => (o.name || o)).join(" ");
  }
  // "ubicaciones" fields: assuming these are strings or objects with a property.
  if (filters.ubicaciones && doc.entities?.ubicaciones) {
    composite += " " + doc.entities.ubicaciones.map(u => (typeof u === "string" ? u : u.value || JSON.stringify(u))).join(" ");
  }
  // "referencias" fields: assuming they are stored in entities.referencias_legales
  if (filters.referencias && doc.entities?.referencias_legales) {
    composite += " " + doc.entities.referencias_legales.map(r => (typeof r === "string" ? r : JSON.stringify(r))).join(" ");
  }
  // "terminos" fields: assuming they are stored in entities.terminos_clave as an array of strings.
  if (filters.terminos && doc.entities?.terminos_clave) {
    composite += " " + doc.entities.terminos_clave.join(" ");
  }
  return composite.toLowerCase();
};

const getIconForType = (type) => {
  switch (type) {
    case "contrato":
    case "demanda":
    case "escritura":
    case "acuerdo":
      return <FileText className="w-4 h-4 mr-2 text-gray-500" />;
    case "persona":
      return <Users className="w-4 h-4 mr-2 text-gray-500" />;
    case "empresa":
    case "organizacion":
      return <Building2 className="w-4 h-4 mr-2 text-gray-500" />;
    case "juzgado":
    case "propiedad":
    case "ubicacion":
      return <MapPin className="w-4 h-4 mr-2 text-gray-500" />;
    default:
      return <Tag className="w-4 h-4 mr-2 text-gray-500" />;
  }
};

const SearchPage = () => {
  const navigate = useNavigate();
  const { sendCommand, onEvent } = useIpc();
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [advancedQuery, setAdvancedQuery] = useState({
    texto: "",
    entidad: "",
    tipo_documento: "",
    fecha_desde: "",
    fecha_hasta: "",
    referencia_legal: ""
  });
  const [searchFilters, setSearchFilters] = useState({
    documentos: true,
    personas: true,
    organizaciones: true,
    ubicaciones: true,
    referencias: true,
    terminos: true
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  // Indicates whether a search has been performed by the user.
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch documents from the backend.
  const fetchDocuments = () => {
    setLoading(true);
    sendCommand("getDocuments");
    console.log("Intentando obtener documentos desde el backend...");
  };

  useEffect(() => {
    console.log("Setting up document listeners");
    const unsubscribeSuccess = onEvent("getDocumentsSuccess", (data) => {
      // Do not show a toast here so that the beautiful summary remains.
      if (Array.isArray(data)) {
        setDocuments(data);
        setFilteredDocuments(data);
        setError(null);
      } else if (data && typeof data === "object") {
        setDocuments([data]);
        setFilteredDocuments([data]);
        setError(null);
      } else {
        console.error("Formato de datos inválido:", data);
        setError("Formato de datos inválido");
        toast.error("Error en el formato de los documentos");
      }
      setLoading(false);
    });

    const unsubscribeFailure = onEvent("getDocumentsFailure", (data) => {
      console.log(data.error || "Error al cargar los documentos");
      setError(data.error || "Error al cargar los documentos");
      toast.error(data.error || "Error al cargar los documentos");
      setLoading(false);
    });

    const unsubscribeSyncSuccess = onEvent("syncSuccess", () => {
      fetchDocuments();
    });

    const unsubscribeSyncFailure = onEvent("syncFailure", (data) => {
      toast.error(data.error || "Error al sincronizar documentos");
    });

    fetchDocuments();

    return () => {
      console.log("Cleaning up document listeners");
      unsubscribeSuccess();
      unsubscribeFailure();
      unsubscribeSyncSuccess();
      unsubscribeSyncFailure();
    };
  }, [sendCommand, onEvent]);

  // Executes the search using active filters.
  const performSearch = () => {
    const lowerQuery = searchQuery.trim().toLowerCase();
    const results = documents.filter(doc => {
      const composite = buildSearchComposite(doc, searchFilters);
      return composite.includes(lowerQuery);
    });
    setFilteredDocuments(results);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (
      !searchQuery.trim() &&
      !Object.values(advancedQuery).some(val => val.trim())
    )
      return;
    setHasSearched(true);
    setIsSearching(true);
    setTimeout(() => {
      performSearch();
      setIsSearching(false);
    }, 600);
  };

  const handleCommandSelect = (item) => {
    setSearchQuery(item.text);
    setCommandOpen(false);
    setHasSearched(true);
    setIsSearching(true);
    setTimeout(() => {
      performSearch();
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
    setSearchQuery("");
    setAdvancedQuery({
      texto: "",
      entidad: "",
      tipo_documento: "",
      fecha_desde: "",
      fecha_hasta: "",
      referencia_legal: ""
    });
    setFilteredDocuments(documents);
    setHasSearched(false);
  };

  useEffect(() => {
    const input = document.getElementById("main-search");
    if (input) input.focus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 ml-16">
        <main className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              Buscador Avanzado
            </h1>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  advancedSearch
                    ? "bg-gray-100 text-gray-800 border-gray-300"
                    : "bg-white text-gray-600 border-gray-200"
                }`}
                onClick={toggleAdvancedSearch}
              >
                {advancedSearch ? "Búsqueda Simple" : "Búsqueda Avanzada"}
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
          {/* Search Form */}
          <div className="bg-white shadow-sm rounded-lg mx-4 mb-8 overflow-hidden animate-fade-in">
            <form onSubmit={handleSearch} className="p-6 border-b border-gray-200">
              {!advancedSearch ? (
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="main-search"
                    type="text"
                    placeholder="Buscar documentos, entidades, autores, etc..."
                    className="pl-10 py-6 text-base focus:ring-crimson focus:border-crimson"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setCommandOpen(true)}
                    onBlur={() => setTimeout(() => setCommandOpen(false), 200)}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  {commandOpen && (
                    <Command className="absolute z-10 top-full left-0 right-0 mt-1 border border-gray-200 shadow-md rounded-md overflow-hidden">
                      <CommandList>
                        {!searchQuery && (
                          <CommandGroup heading="Búsquedas recientes">
                            {[
                              { id: 1, text: "Carta-Poder-para-Tramites-De-Vivienda", type: "document" },
                              { id: 2, text: "Christian Jiménez", type: "persona" }
                            ].map((item) => (
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
                          {documents
                            .filter(doc =>
                              !searchQuery ||
                              doc.title.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map(doc => (
                              <CommandItem
                                key={`doc-${doc.id}`}
                                onSelect={() =>
                                  handleCommandSelect({ id: doc.id, text: doc.title, type: doc.type })
                                }
                                className="flex items-center py-2 cursor-pointer"
                              >
                                {getIconForType(doc.type)}
                                <span>{doc.title}</span>
                                <span className="ml-2 text-xs text-gray-500 capitalize">
                                  ({doc.type})
                                </span>
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
                      <label htmlFor="texto" className="block text-sm font-medium text-gray-700 mb-1">
                        Búsqueda en texto
                      </label>
                      <Input
                        id="texto"
                        type="text"
                        placeholder="Texto a buscar en documentos"
                        value={advancedQuery.texto}
                        onChange={(e) => handleAdvancedQueryChange("texto", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="entidad" className="block text-sm font-medium text-gray-700 mb-1">
                        Entidad (persona u organización)
                      </label>
                      <Input
                        id="entidad"
                        type="text"
                        placeholder="Nombre de persona o empresa"
                        value={advancedQuery.entidad}
                        onChange={(e) => handleAdvancedQueryChange("entidad", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="tipo_documento" className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de documento
                      </label>
                      <select
                        id="tipo_documento"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-base focus:ring-crimson focus:border-crimson md:text-sm"
                        value={advancedQuery.tipo_documento}
                        onChange={(e) => handleAdvancedQueryChange("tipo_documento", e.target.value)}
                      >
                        <option value="">Todos los tipos</option>
                        <option value="contrato">Contrato</option>
                        <option value="demanda">Demanda</option>
                        <option value="acuerdo">Acuerdo</option>
                        <option value="escritura">Escritura</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="referencia_legal" className="block text-sm font-medium text-gray-700 mb-1">
                        Referencia legal
                      </label>
                      <Input
                        id="referencia_legal"
                        type="text"
                        placeholder="Ej. Código Civil Art. 123"
                        value={advancedQuery.referencia_legal}
                        onChange={(e) => handleAdvancedQueryChange("referencia_legal", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="fecha_desde" className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha desde
                      </label>
                      <Input
                        id="fecha_desde"
                        type="date"
                        value={advancedQuery.fecha_desde}
                        onChange={(e) => handleAdvancedQueryChange("fecha_desde", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="fecha_hasta" className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha hasta
                      </label>
                      <Input
                        id="fecha_hasta"
                        type="date"
                        value={advancedQuery.fecha_hasta}
                        onChange={(e) => handleAdvancedQueryChange("fecha_hasta", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <button type="button" className="text-sm text-gray-500 hover:text-crimson" onClick={clearSearch}>
                      Limpiar formulario
                    </button>
                  </div>
                </div>
              )}

              {/* Filter tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  type="button"
                  className={`text-xs px-3 py-1 rounded-full border ${
                    searchFilters.documentos
                      ? "bg-crimson/10 text-crimson border-crimson/20"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                  onClick={() => toggleFilter("documentos")}
                >
                  <FileText className="w-3 h-3 inline-block mr-1" />
                  Documentos
                </button>
                <button
                  type="button"
                  className={`text-xs px-3 py-1 rounded-full border ${
                    searchFilters.personas
                      ? "bg-crimson/10 text-crimson border-crimson/20"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                  onClick={() => toggleFilter("personas")}
                >
                  <Users className="w-3 h-3 inline-block mr-1" />
                  Personas
                </button>
                <button
                  type="button"
                  className={`text-xs px-3 py-1 rounded-full border ${
                    searchFilters.organizaciones
                      ? "bg-crimson/10 text-crimson border-crimson/20"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                  onClick={() => toggleFilter("organizaciones")}
                >
                  <Building2 className="w-3 h-3 inline-block mr-1" />
                  Organizaciones
                </button>
                <button
                  type="button"
                  className={`text-xs px-3 py-1 rounded-full border ${
                    searchFilters.ubicaciones
                      ? "bg-crimson/10 text-crimson border-crimson/20"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                  onClick={() => toggleFilter("ubicaciones")}
                >
                  <MapPin className="w-3 h-3 inline-block mr-1" />
                  Ubicaciones
                </button>
                <button
                  type="button"
                  className={`text-xs px-3 py-1 rounded-full border ${
                    searchFilters.referencias
                      ? "bg-crimson/10 text-crimson border-crimson/20"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                  onClick={() => toggleFilter("referencias")}
                >
                  <Tag className="w-3 h-3 inline-block mr-1" />
                  Referencias Legales
                </button>
                <button
                  type="button"
                  className={`text-xs px-3 py-1 rounded-full border ${
                    searchFilters.terminos
                      ? "bg-crimson/10 text-crimson border-crimson/20"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                  onClick={() => toggleFilter("terminos")}
                >
                  <Tag className="w-3 h-3 inline-block mr-1" />
                  Términos Legales
                </button>
              </div>
            </form>

            {/* If no search has been performed, show the capabilities summary */}
            {!hasSearched && (
              <div className="p-6">
                <div className="glass-panel p-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                    <SearchIcon className="w-5 h-5 mr-2 text-crimson" />
                    Capacidades del buscador
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Nuestro buscador avanzado permite encontrar documentos y entidades en tu repositorio utilizando diversos criterios y filtros.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-md border border-gray-100 flex items-start">
                      <FileText className="w-8 h-8 text-crimson mr-3 mt-1" />
                      <div>
                        <h4 className="font-medium">Búsqueda en Contenido</h4>
                        <p className="text-sm text-gray-600">
                          Busca palabras o frases específicas dentro del texto de los documentos.
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-md border border-gray-100 flex items-start">
                      <Tag className="w-8 h-8 text-crimson mr-3 mt-1" />
                      <div>
                        <h4 className="font-medium">Filtrado avanzado</h4>
                        <p className="text-sm text-gray-600">
                          Utiliza filtros y búsqueda avanzada para encontrar resultados precisos.
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-md border border-gray-100 flex items-start">
                      <Building2 className="w-8 h-8 text-crimson mr-3 mt-1" />
                      <div>
                        <h4 className="font-medium">Entidades</h4>
                        <p className="text-sm text-gray-600">
                          Busca documentos relacionados a personas, organizaciones y ubicaciones.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center py-6 text-gray-500">
                  <p>Comienza una búsqueda usando el formulario superior</p>
                </div>
              </div>
            )}

            {/* If search has been executed and results exist, display them as a list */}
            {hasSearched && filteredDocuments.length > 0 && !isSearching && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  Resultados de la búsqueda
                </h3>
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => navigate(`/document/${doc.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-800 mb-1 flex items-center">
                            {getIconForType(doc.type)}
                            {doc.title}
                          </h4>
                          <div className="flex items-center text-xs text-gray-500 mb-3 space-x-3">
                            <span className="capitalize">{doc.type}</span>
                            <span>•</span>
                            <span>{doc.fileType.toUpperCase()}</span>
                            <span>•</span>
                            <span>{new Date(doc.updated_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      {doc.description && (
                        <p className="text-sm text-gray-600">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading state during search */}
            {isSearching && (
              <div className="flex flex-col items-center justify-center py-16">
                <RefreshCw className="w-12 h-12 text-crimson/40 animate-spin mb-4" />
                <p className="text-gray-600">Buscando documentos...</p>
              </div>
            )}

            {/* If search executed and no results found */}
            {hasSearched && !isSearching && filteredDocuments.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                <p>No se encontró ningún documento que coincida con la búsqueda</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SearchPage;

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