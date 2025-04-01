
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MapPin, FileText, Building2 } from 'lucide-react';
import { Badge } from './ui/badge';

const LocationCard = ({ location }) => {
  return (
    <Link to={`/ubicacion/${location.id}`} className="block h-full">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-5 w-5 text-red-500" />
            {location.nombre || location.valor}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="space-y-2">
            {location.tipo && (
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-700 dark:text-gray-300">Tipo:</span>
                <Badge variant="outline">{location.tipo}</Badge>
              </div>
            )}
            
            {location.direccion && (
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Dirección: </span>
                {location.direccion}
              </div>
            )}
            
            {location.organizaciones && location.organizaciones.length > 0 && (
              <div className="mt-1">
                <div className="flex items-center gap-1 mb-1">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Organizaciones relacionadas ({location.organizaciones.length})
                  </span>
                </div>
              </div>
            )}
            
            {location.documentos && (
              <div className="mt-2">
                <div className="flex items-center gap-1 mb-1">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Documentos asociados ({location.documentos.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {location.documentos.slice(0, 3).map((doc, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {doc.titulo}
                    </Badge>
                  ))}
                  {location.documentos.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{location.documentos.length - 3} más
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default LocationCard;
