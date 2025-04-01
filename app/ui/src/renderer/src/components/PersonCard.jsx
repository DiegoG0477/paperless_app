
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { User, FileText, Award } from 'lucide-react';
import { Badge } from './ui/badge';

const PersonCard = ({ person }) => {
  return (
    <Link to={`/persona/${person.id}`} className="block h-full">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-blue-500" />
            {person.nombre}
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <div className="space-y-2">
            {person.rol && (
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{person.rol}</span>
              </div>
            )}
            
            {person.tipo && (
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-700 dark:text-gray-300">Tipo:</span>
                <Badge variant="outline">{person.tipo}</Badge>
              </div>
            )}
            
            {person.contacto && (
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Contacto: </span>
                {person.contacto}
              </div>
            )}
            
            {person.documentos && (
              <div className="mt-2">
                <div className="flex items-center gap-1 mb-1">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Documentos asociados ({person.documentos.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {person.documentos.slice(0, 3).map((doc, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {doc.titulo}
                    </Badge>
                  ))}
                  {person.documentos.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{person.documentos.length - 3} más
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

export default PersonCard;
