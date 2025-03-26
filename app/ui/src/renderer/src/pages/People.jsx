
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Search, Filter, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Separator } from '../components/ui/separator';
import Sidebar from '../components/Sidebar';
import PersonCard from '../components/PersonCard';

// Mock data for people
const mockPeople = [
  {
    id: 1,
    nombre: "Juan Pérez",
    rol: "Abogado",
    tipo: "física",
    contacto: "juan.perez@example.com",
    documentos: [
      { id: 1, titulo: "Contrato de Arrendamiento" },
      { id: 2, titulo: "Poder Notarial" },
      { id: 5, titulo: "Acta Constitutiva" }
    ]
  },
  {
    id: 2,
    nombre: "Ana García",
    rol: "Juez",
    tipo: "física",
    contacto: "ana.garcia@tribunales.gob",
    documentos: [
      { id: 3, titulo: "Sentencia Judicial" },
      { id: 4, titulo: "Dictamen Pericial" }
    ]
  },
  {
    id: 3,
    nombre: "Carlos Rodríguez",
    rol: "Autor",
    tipo: "física",
    contacto: "carlos.rodriguez@editorial.com",
    documentos: [
      { id: 6, titulo: "Manuscrito Original" },
      { id: 7, titulo: "Contrato Editorial" }
    ]
  },
  {
    id: 4,
    nombre: "María López",
    rol: "Testigo",
    tipo: "física",
    contacto: "maria.lopez@example.com",
    documentos: [
      { id: 8, titulo: "Declaración Testimonial" }
    ]
  },
  {
    id: 5,
    nombre: "Roberto Sánchez",
    rol: "Demandante",
    tipo: "física",
    contacto: "roberto.sanchez@example.com",
    documentos: [
      { id: 9, titulo: "Demanda Civil" },
      { id: 10, titulo: "Pruebas Documentales" }
    ]
  },
  {
    id: 6,
    nombre: "Sofía Martínez",
    rol: "Notario",
    tipo: "física",
    contacto: "sofia.martinez@notaria.com",
    documentos: [
      { id: 11, titulo: "Escritura Pública" },
      { id: 12, titulo: "Acta Notarial" }
    ]
  }
];

const People = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  
  const roles = [...new Set(mockPeople.map(person => person.rol))];
  const types = [...new Set(mockPeople.map(person => person.tipo))];
  
  const toggleRole = (role) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role) 
        : [...prev, role]
    );
  };
  
  const toggleType = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  const filteredPeople = mockPeople.filter(person => {
    const matchesSearch = searchTerm === '' || 
      person.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (person.rol && person.rol.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = selectedRoles.length === 0 || 
      (person.rol && selectedRoles.includes(person.rol));
      
    const matchesType = selectedTypes.length === 0 || 
      (person.tipo && selectedTypes.includes(person.tipo));
    
    return matchesSearch && matchesRole && matchesType;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Helmet>
        <title>Personas | Sistema de Gestión Documental</title>
      </Helmet>
      
      <Sidebar />
      
      <div className="flex-1 pl-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold flex items-center">
              <User className="mr-2 h-6 w-6 text-blue-500" />
              Personas
            </h1>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Buscar personas..."
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
                  <h3 className="text-sm font-medium">Rol</h3>
                  <div className="flex flex-wrap gap-1">
                    {roles.map((role) => (
                      <button
                        key={role}
                        className={`text-xs px-2 py-1 rounded-full ${
                          selectedRoles.includes(role)
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        onClick={() => toggleRole(role)}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
                
                <Separator className="md:h-auto md:w-px h-px w-full bg-gray-200" />
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Tipo</h3>
                  <div className="flex flex-wrap gap-1">
                    {types.map((type) => (
                      <button
                        key={type}
                        className={`text-xs px-2 py-1 rounded-full ${
                          selectedTypes.includes(type)
                            ? 'bg-blue-100 text-blue-700'
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
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPeople.map((person) => (
              <PersonCard key={person.id} person={person} />
            ))}
            
            {filteredPeople.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                No se encontraron personas con los criterios de búsqueda especificados.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default People;
