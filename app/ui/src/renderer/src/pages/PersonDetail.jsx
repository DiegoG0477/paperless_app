
import React from 'react';
import { User, Mail, UserCheck, Building, Award } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import EntityDetail from '../components/EntityDetail';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

// Simulated data for demo purposes
const mockPersons = [
  { id: '1', nombre: 'Juan Pérez', tipo: 'física', rol: 'Abogado', contacto: 'juan.perez@ejemplo.com' },
  { id: '2', nombre: 'María López', tipo: 'física', rol: 'Demandante', contacto: 'maria.lopez@ejemplo.com' },
  { id: '3', nombre: 'Carlos Rodríguez', tipo: 'física', rol: 'Juez', contacto: 'carlos.rodriguez@ejemplo.com' },
  { id: '4', nombre: 'Ana Martínez', tipo: 'física', rol: 'Testigo', contacto: 'ana.martinez@ejemplo.com' },
];

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
      personas: [{ id: '1', nombre: 'Juan Pérez', rol: 'demandante', tipo: 'física' }]
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
      personas: [{ id: '1', nombre: 'Juan Pérez', rol: 'demandante', tipo: 'física' }]
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
      personas: [{ id: '2', nombre: 'María López', rol: 'compradora', tipo: 'física' }]
    }
  }
];

const PersonDetail = () => {
  const getPersonById = (id) => {
    return mockPersons.find(person => person.id === id);
  };

  const getPersonDocuments = (id) => {
    return mockDocuments.filter(doc => 
      doc.entities && 
      doc.entities.personas && 
      doc.entities.personas.some(p => p.id === id)
    );
  };

  const renderPersonInfo = (person) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <User className="h-5 w-5 text-blue-500" />
        <div>
          <div className="font-medium">{person.nombre}</div>
          <div className="text-sm text-muted-foreground">
            <Badge variant="outline">{person.tipo}</Badge>
          </div>
        </div>
      </div>
      
      {person.rol && (
        <div className="flex items-start gap-2">
          <Award className="h-5 w-5 text-orange-500 mt-0.5" />
          <div>
            <div className="text-sm text-muted-foreground">Rol</div>
            <div>{person.rol}</div>
          </div>
        </div>
      )}
      
      {person.contacto && (
        <div className="flex items-start gap-2">
          <Mail className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <div className="text-sm text-muted-foreground">Contacto</div>
            <div>{person.contacto}</div>
          </div>
        </div>
      )}
      
      <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-medium mb-2">Entidades relacionadas</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Organizaciones asociadas:</span>
            <Badge variant="secondary">2</Badge>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Otras personas relacionadas:</span>
            <Badge variant="secondary">3</Badge>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className="flex-1 ml-16 flex flex-col">
        <Header />
        <EntityDetail 
          entityType="person"
          getEntityById={getPersonById}
          getEntityDocuments={getPersonDocuments}
          renderEntityInfo={renderPersonInfo}
        />
      </div>
    </div>
  );
};

export default PersonDetail;
