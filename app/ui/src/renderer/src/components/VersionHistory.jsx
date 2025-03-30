
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { History, ArrowUpDown, GitCompare, RefreshCw } from 'lucide-react';
import { toast } from "sonner";

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const VersionHistory = ({ versions }) => {
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [compareModeActive, setCompareModeActive] = useState(false);

  const toggleVersionSelection = (versionId) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(selectedVersions.filter(id => id !== versionId));
    } else {
      if (compareModeActive && selectedVersions.length >= 2) {
        // Si ya tenemos 2 versiones seleccionadas, reemplazamos la más antigua
        setSelectedVersions([selectedVersions[1], versionId]);
      } else {
        setSelectedVersions([...selectedVersions, versionId]);
      }
    }
  };

  const handleCompareVersions = () => {
    if (selectedVersions.length !== 2) {
      toast.error("Selecciona exactamente 2 versiones para comparar");
      return;
    }
    
    // Simular comparación de versiones
    toast.info(`Comparando versiones: ${selectedVersions.join(' y ')}`);
    // En una app real, aquí abriríamos una vista de comparación
  };

  const handleRestoreVersion = (versionId) => {
    // Simular restauración de versión
    toast.success(`Versión restaurada: ${versionId}`);
    // En una app real, aquí restauraríamos la versión
  };

  const toggleCompareMode = () => {
    setCompareModeActive(!compareModeActive);
    if (!compareModeActive) {
      setSelectedVersions(selectedVersions.slice(0, 2)); // Limitar a 2 selecciones al activar
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg flex items-center">
          <History className="w-5 h-5 mr-2" />
          Historial de versiones
        </CardTitle>
        <Button 
          variant={compareModeActive ? "default" : "outline"} 
          size="sm"
          onClick={toggleCompareMode}
        >
          <GitCompare className="w-4 h-4 mr-1" />
          {compareModeActive ? "Modo comparación activo" : "Comparar versiones"}
        </Button>
      </CardHeader>
      <CardContent>
        {compareModeActive && selectedVersions.length === 2 && (
          <div className="mb-4">
            <Button 
              className="w-full"
              onClick={handleCompareVersions}
            >
              <ArrowUpDown className="w-4 h-4 mr-1" />
              Comparar versiones seleccionadas
            </Button>
          </div>
        )}
        
        <div className="space-y-2">
          {versions.map((version, index) => (
            <div 
              key={version.id}
              className={`p-3 rounded-md border ${
                selectedVersions.includes(version.id) 
                  ? 'border-crimson bg-crimson/5' 
                  : 'border-gray-200 hover:bg-gray-50'
              } transition-colors`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {compareModeActive ? (
                    <input 
                      type="checkbox" 
                      checked={selectedVersions.includes(version.id)}
                      onChange={() => toggleVersionSelection(version.id)}
                      className="mr-2 h-4 w-4 rounded border-gray-300 text-crimson focus:ring-crimson"
                    />
                  ) : index === 0 ? (
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full mr-2">
                      Actual
                    </span>
                  ) : null}
                  
                  <div>
                    <div className="font-medium">{version.version_tag}</div>
                    <div className="text-sm text-gray-500">
                      {formatDate(version.updated_at)} - {version.author}
                    </div>
                  </div>
                </div>
                
                {!compareModeActive && index > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRestoreVersion(version.id)}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Restaurar
                  </Button>
                )}
              </div>
              
              {version.comment && (
                <div className="mt-2 text-sm text-gray-600 pl-4 border-l-2 border-gray-200">
                  {version.comment}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VersionHistory;
