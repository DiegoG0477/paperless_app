
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Filter, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import Sidebar from '../components/Sidebar';
import LocationCard from '../components/LocationCard';

// Mock data for locations
const mockLocations = [
  {
    id: 1,
    nombre: "Ciudad de México",
    tipo: "ciudad",
    direccion: "México",
    organizaciones: [
      { id: 1, nombre: "Despacho Jurídico Méndez" },
      { id: 2, nombre: "Tribunal Superior de Justicia" }
    ],
    documentos: [
      { id: 1, titulo: "Contrato de Arrendamiento" },
      { id: 3, titulo: "Sentencia Judicial" }
    ]
  },
  {
    id: 2,
    nombre: "Av. Reforma 222",
    tipo: "dirección",
    direccion: "Ciudad de México, México",
    organizaciones: [
      { id: 1, nombre: "Despacho Jurídico Méndez" }
    ],
    documentos: [
      { id: 5, titulo: "Acta Constitutiva" }
    ]
  },
  {
    id: 3,
    nombre: "Guadalajara",
    tipo: "ciudad",
    direccion: "Jalisco, México",
    organizaciones: [
      { id: 3, nombre: "Editorial Libros Modernos" }
    ],
    documentos: [
      { id: 6, titulo: "Manuscrito Original" },
      { id: 7, titulo: "Contrato Editorial" }
    ]
  },
  {
    id: 4,
    nombre: "Calle Juárez 45",
    tipo: "dirección",
    direccion: "Monterrey, Nuevo León, México",
    organizaciones: [
      { id: 4, nombre: "Notaría Pública No. 28" }
    ],
    documentos: [
      { id: 11, titulo: "Escritura Pública" },
      { id: 12, titulo: "Acta Notarial" }
    ]
  },
  {
    id: 5,
    nombre: "Zona Río",
    tipo: "sector",
    direccion: "Tijuana, Baja California, México",
    organizaciones: [
      { id: 5, nombre: "Constructora Horizonte" }
    ],
    documentos: [
      { id: 13, titulo: "Planos Arquitectónicos" },
      { id: 14, titulo: "Permiso de Construcción" }
    ]
  }
];

const Locations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  
  const types = [...new Set(mockLocations.map(location => location.tipo))];
  
  const toggleType = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  const filteredLocations = mockLocations.filter(location => {
    const matchesSearch = searchTerm === '' || 
      location.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (location.direccion && location.direccion.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedTypes.length === 0 || 
      (location.tipo && selectedTypes.includes(location.tipo));
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Helmet>
        <title>Ubicaciones | Sistema de Gestión Documental</title>
      </Helmet>
      
      <Sidebar />
      
      <div className="flex-1 pl-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold flex items-center">
              <MapPin className="mr-2 h-6 w-6 text-red-500" />
              Ubicaciones
            </h1>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Buscar ubicaciones..."
                  className="w-[250px] pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              </Button>
            </div>
          </div>
          
          {showFilters && (
            <div className="bg-white p-4 rounded-md shadow mb-6">
              <h2 className="font-medium mb-2">Filtros</h2>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Tipo</h3>
                <div className="flex flex-wrap gap-1">
                  {types.map((type) => (
                    <button
                      key={type}
                      className={`text-xs px-2 py-1 rounded-full ${
                        selectedTypes.includes(type)
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => toggleType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLocations.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
            
            {filteredLocations.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                No se encontraron ubicaciones con los criterios de búsqueda especificados.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Locations;
