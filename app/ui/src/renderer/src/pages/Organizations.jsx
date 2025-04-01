
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Filter, Building2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import Sidebar from '../components/Sidebar';
import OrganizationCard from '../components/OrganizationCard';

// Mock data for organizations
const mockOrganizations = [
  {
    id: 1,
    nombre: "Despacho Jurídico Méndez",
    tipo: "empresa",
    sector: "Legal",
    personas: [
      { id: 1, nombre: "Juan Pérez", rol: "Abogado" },
      { id: 6, nombre: "Sofía Martínez", rol: "Notario" }
    ],
    documentos: [
      { id: 1, titulo: "Contrato de Arrendamiento" },
      { id: 2, titulo: "Poder Notarial" },
      { id: 5, titulo: "Acta Constitutiva" }
    ]
  },
  {
    id: 2,
    nombre: "Tribunal Superior de Justicia",
    tipo: "gubernamental",
    sector: "Judicial",
    personas: [
      { id: 2, nombre: "Ana García", rol: "Juez" }
    ],
    documentos: [
      { id: 3, titulo: "Sentencia Judicial" },
      { id: 4, titulo: "Dictamen Pericial" }
    ]
  },
  {
    id: 3,
    nombre: "Editorial Libros Modernos",
    tipo: "empresa",
    sector: "Editorial",
    personas: [
      { id: 3, nombre: "Carlos Rodríguez", rol: "Autor" }
    ],
    documentos: [
      { id: 6, titulo: "Manuscrito Original" },
      { id: 7, titulo: "Contrato Editorial" }
    ]
  },
  {
    id: 4,
    nombre: "Notaría Pública No. 28",
    tipo: "gubernamental",
    sector: "Notarial",
    personas: [
      { id: 6, nombre: "Sofía Martínez", rol: "Notario" }
    ],
    documentos: [
      { id: 11, titulo: "Escritura Pública" },
      { id: 12, titulo: "Acta Notarial" }
    ]
  },
  {
    id: 5,
    nombre: "Constructora Horizonte",
    tipo: "empresa",
    sector: "Construcción",
    personas: [],
    documentos: [
      { id: 13, titulo: "Planos Arquitectónicos" },
      { id: 14, titulo: "Permiso de Construcción" }
    ]
  }
];

const Organizations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]);
  
  const types = [...new Set(mockOrganizations.map(org => org.tipo))];
  const sectors = [...new Set(mockOrganizations.map(org => org.sector))];
  
  const toggleType = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  const toggleSector = (sector) => {
    setSelectedSectors(prev => 
      prev.includes(sector) 
        ? prev.filter(s => s !== sector) 
        : [...prev, sector]
    );
  };
  
  const filteredOrganizations = mockOrganizations.filter(org => {
    const matchesSearch = searchTerm === '' || 
      org.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.sector && org.sector.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedTypes.length === 0 || 
      (org.tipo && selectedTypes.includes(org.tipo));
      
    const matchesSector = selectedSectors.length === 0 || 
      (org.sector && selectedSectors.includes(org.sector));
    
    return matchesSearch && matchesType && matchesSector;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Helmet>
        <title>Organizaciones | Sistema de Gestión Documental</title>
      </Helmet>
      
      <Sidebar />
      
      <div className="flex-1 pl-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold flex items-center">
              <Building2 className="mr-2 h-6 w-6 text-green-500" />
              Organizaciones
            </h1>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Buscar organizaciones..."
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
              <div className="flex flex-col md:flex-row gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Tipo</h3>
                  <div className="flex flex-wrap gap-1">
                    {types.map((type) => (
                      <button
                        key={type}
                        className={`text-xs px-2 py-1 rounded-full ${
                          selectedTypes.includes(type)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => toggleType(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                
                <Separator className="md:h-auto md:w-px h-px w-full bg-gray-200" />
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Sector</h3>
                  <div className="flex flex-wrap gap-1">
                    {sectors.map((sector) => (
                      <button
                        key={sector}
                        className={`text-xs px-2 py-1 rounded-full ${
                          selectedSectors.includes(sector)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => toggleSector(sector)}
                      >
                        {sector}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrganizations.map((organization) => (
              <OrganizationCard key={organization.id} organization={organization} />
            ))}
            
            {filteredOrganizations.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                No se encontraron organizaciones con los criterios de búsqueda especificados.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Organizations;
