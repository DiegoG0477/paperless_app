
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { User, Building2, MapPin, Calendar, Tag } from 'lucide-react';
import { Button } from './ui/button';

const EntityGroup = ({ title, entities, icon, onEntityClick }) => {
  if (!entities || entities.length === 0) return null;
  
  return (
    <div className="mb-4">
      <div className="flex items-center mb-2">
        {icon}
        <h3 className="text-sm font-medium ml-1">{title}</h3>
      </div>
      <div className="space-y-1">
        {entities.map((entity, index) => (
          <div 
            key={index}
            className="text-sm py-1 px-2 rounded-md hover:bg-gray-100 cursor-pointer flex justify-between items-center"
            onClick={() => onEntityClick(entity)}
          >
            <span className="truncate">{entity.nombre || entity.valor}</span>
            {entity.rol && <span className="text-xs text-gray-500">{entity.rol}</span>}
            {entity.tipo && entity.tipo !== 'física' && entity.tipo !== 'empresa' && <span className="text-xs text-gray-500">{entity.tipo}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

const RelatedEntities = ({ entities }) => {
  const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'json'
  
  const handleEntityClick = (entity) => {
    console.log("Entity clicked:", entity);
    // En una app real, aquí navegaríamos a la vista de entidad
  };
  
  const toggleViewMode = () => {
    setViewMode(viewMode === 'summary' ? 'json' : 'summary');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Entidades Relacionadas</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleViewMode}
        >
          {viewMode === 'summary' ? 'Ver JSON' : 'Ver Resumen'}
        </Button>
      </CardHeader>
      <CardContent>
        {viewMode === 'summary' ? (
          <div className="max-h-[400px] overflow-y-auto pr-1">
            <EntityGroup 
              title="Personas" 
              entities={entities.personas} 
              icon={<User className="w-4 h-4 text-blue-500" />}
              onEntityClick={handleEntityClick}
            />
            
            <EntityGroup 
              title="Organizaciones" 
              entities={entities.organizaciones} 
              icon={<Building2 className="w-4 h-4 text-green-500" />}
              onEntityClick={handleEntityClick}
            />
            
            <EntityGroup 
              title="Ubicaciones" 
              entities={entities.ubicaciones} 
              icon={<MapPin className="w-4 h-4 text-red-500" />}
              onEntityClick={handleEntityClick}
            />
            
            <EntityGroup 
              title="Fechas relevantes" 
              entities={entities.fechas} 
              icon={<Calendar className="w-4 h-4 text-orange-500" />}
              onEntityClick={handleEntityClick}
            />

            {entities.terminos_clave && entities.terminos_clave.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Tag className="w-4 h-4 text-purple-500" />
                  <h3 className="text-sm font-medium ml-1">Términos clave</h3>
                </div>
                <div className="flex flex-wrap gap-1">
                  {entities.terminos_clave.map((termino, index) => (
                    <span 
                      key={index}
                      className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full"
                    >
                      {termino}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-50 p-3 rounded-md overflow-x-auto">
            <pre className="text-xs">
              {JSON.stringify(entities, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RelatedEntities;
