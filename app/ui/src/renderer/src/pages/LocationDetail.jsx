
import React from 'react';
import { MapPin, Info, Building2, Landmark, Home } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import EntityDetail from '../components/EntityDetail';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

// Simulated data for demo purposes
const mockLocations = [
  { 
    id: '1', 
    nombre: 'Juzgado 45 Civil', 
    valor: 'Juzgado 45 Civil',
    tipo: 'juzgado',
    direccion: 'Avenida de la Justicia 123, Ciudad Judicial',
    jurisdiccion: 'Civil'
  },
  { 
    id: '2', 
    nombre: 'Juzgado 3 Laboral', 
    valor: 'Juzgado 3 Laboral',
    tipo: 'juzgado',
    direccion: 'Avenida de la Justicia 456, Ciudad Judicial',
    jurisdiccion: 'Laboral'
  },
  { 
    id: '3', 
    nombre: 'Calle Real 123', 
    valor: 'Calle Real 123',
    tipo: 'propiedad',
    direccion: 'Calle Real 123, Ciudad Ejemplo',
    detalles: 'Propiedad residencial de 150m²'
  }
];

const mockDocuments = [
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
      ubicaciones: [{ id: '1', tipo: 'juzgado', valor: 'Juzgado 45 Civil' }]
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
      ubicaciones: [{ id: '3', tipo: 'propiedad', valor: 'Calle Real 123' }]
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
      ubicaciones: [{ id: '2', tipo: 'juzgado', valor: 'Juzgado 3 Laboral' }]
    }
  }
];

const LocationDetail = () => {
  const getLocationById = (id) => {
    return mockLocations.find(location => location.id === id);
  };

  const getLocationDocuments = (id) => {
    return mockDocuments.filter(doc => 
      doc.entities && 
      doc.entities.ubicaciones && 
      doc.entities.ubicaciones.some(l => l.id === id)
    );
  };

  const getLocationIcon = (locationType) => {
    switch (locationType) {
      case 'juzgado':
        return <Landmark className="h-5 w-5 text-purple-500" />;
      case 'propiedad':
        return <Home className="h-5 w-5 text-blue-500" />;
      default:
        return <MapPin className="h-5 w-5 text-red-500" />;
    }
  };

  const renderLocationInfo = (location) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {getLocationIcon(location.tipo)}
        <div>
          <div className="font-medium">{location.nombre || location.valor}</div>
          <div className="text-sm text-muted-foreground">
            <Badge variant="outline">{location.tipo}</Badge>
          </div>
        </div>
      </div>
      
      {location.direccion && (
        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <div className="text-sm text-muted-foreground">Dirección</div>
            <div>{location.direccion}</div>
          </div>
        </div>
      )}
      
      {location.jurisdiccion && (
        <div className="flex items-start gap-2">
          <Landmark className="h-5 w-5 text-purple-500 mt-0.5" />
          <div>
            <div className="text-sm text-muted-foreground">Jurisdicción</div>
            <div>{location.jurisdiccion}</div>
          </div>
        </div>
      )}

      {location.detalles && (
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <div className="text-sm text-muted-foreground">Detalles</div>
            <div>{location.detalles}</div>
          </div>
        </div>
      )}
      
      <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-medium mb-2">Entidades relacionadas</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Organizaciones asociadas:</span>
            <Badge variant="secondary">1</Badge>
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
          entityType="location"
          getEntityById={getLocationById}
          getEntityDocuments={getLocationDocuments}
          renderEntityInfo={renderLocationInfo}
        />
      </div>
    </div>
  );
};

export default LocationDetail;
