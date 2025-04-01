
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Building2, FileText, Users } from 'lucide-react';
import { Badge } from './ui/badge';

const OrganizationCard = ({ organization }) => {
  return (
    <Link to={`/organizacion/${organization.id}`} className="block h-full">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-5 w-5 text-green-500" />
            {organization.nombre}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="space-y-2">
            {organization.tipo && (
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-700 dark:text-gray-300">Tipo:</span>
                <Badge variant="outline">{organization.tipo}</Badge>
              </div>
            )}
            
            {organization.sector && (
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Sector: </span>
                {organization.sector}
              </div>
            )}
            
            {organization.personas && organization.personas.length > 0 && (
              <div className="mt-1">
                <div className="flex items-center gap-1 mb-1">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Personas relacionadas ({organization.personas.length})
                  </span>
                </div>
              </div>
            )}
            
            {organization.documentos && (
              <div className="mt-2">
                <div className="flex items-center gap-1 mb-1">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Documentos asociados ({organization.documentos.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {organization.documentos.slice(0, 3).map((doc, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {doc.titulo}
                    </Badge>
                  ))}
                  {organization.documentos.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{organization.documentos.length - 3} más
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

export default OrganizationCard;
