
import React from 'react';
import { Building2, MapPin, Users, Briefcase, Globe } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import EntityDetail from '../components/EntityDetail';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

// Simulated data for demo purposes
const mockOrganizations = [
  { 
    id: '1', 
    nombre: 'Acme Corp', 
    tipo: 'empresa', 
    sector: 'Tecnología',
    direccion: 'Calle Principal 123, Ciudad Ejemplo',
    contacto: 'info@acmecorp.com',
    web: 'www.acmecorp.com'
  },
  { 
    id: '2', 
    nombre: 'Industrial Technologies Inc.', 
    tipo: 'empresa',
    sector: 'Manufactura',
    direccion: 'Avenida Industrial 456, Ciudad Ejemplo',
    contacto: 'contact@indtech.com'
  },
  { 
    id: '3', 
    nombre: 'Global Solutions Inc.', 
    tipo: 'consultora',
    sector: 'Consultoría',
    direccion: 'Avenida Central 789, Ciudad Ejemplo',
    contacto: 'info@globalsolutions.com',
    web: 'www.globalsolutions.com'
  }
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
      organizaciones: [{ id: '1', nombre: 'Acme Corp', tipo: 'empresa' }]
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
      organizaciones: [
        { id: '1', nombre: 'Acme Corp', tipo: 'empresa' },
        { id: '3', nombre: 'Global Solutions Inc.', tipo: 'consultora' }
      ]
    }
  }
];

const OrganizationDetail = () => {
  const getOrganizationById = (id) => {
    return mockOrganizations.find(org => org.id === id);
  };

  const getOrganizationDocuments = (id) => {
    return mockDocuments.filter(doc => 
      doc.entities && 
      doc.entities.organizaciones && 
      doc.entities.organizaciones.some(o => o.id === id)
    );
  };

  const renderOrganizationInfo = (organization) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-green-500" />
        <div>
          <div className="font-medium">{organization.nombre}</div>
          <div className="text-sm text-muted-foreground">
            <Badge variant="outline">{organization.tipo}</Badge>
          </div>
        </div>
      </div>
      
      {organization.sector && (
        <div className="flex items-start gap-2">
          <Briefcase className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <div className="text-sm text-muted-foreground">Sector</div>
            <div>{organization.sector}</div>
          </div>
        </div>
      )}
      
      {organization.direccion && (
        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <div className="text-sm text-muted-foreground">Dirección</div>
            <div>{organization.direccion}</div>
          </div>
        </div>
      )}

      {organization.contacto && (
        <div className="flex items-start gap-2">
          <Users className="h-5 w-5 text-purple-500 mt-0.5" />
          <div>
            <div className="text-sm text-muted-foreground">Contacto</div>
            <div>{organization.contacto}</div>
          </div>
        </div>
      )}

      {organization.web && (
        <div className="flex items-start gap-2">
          <Globe className="h-5 w-5 text-cyan-500 mt-0.5" />
          <div>
            <div className="text-sm text-muted-foreground">Web</div>
            <div className="text-blue-600 hover:underline cursor-pointer">
              {organization.web}
            </div>
          </div>
        </div>
      )}
      
      <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-medium mb-2">Entidades relacionadas</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Personas asociadas:</span>
            <Badge variant="secondary">5</Badge>
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
          entityType="organization"
          getEntityById={getOrganizationById}
          getEntityDocuments={getOrganizationDocuments}
          renderEntityInfo={renderOrganizationInfo}
        />
      </div>
    </div>
  );
};

export default OrganizationDetail;
