
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertTriangle, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from "sonner";

const SpellingErrors = ({ errors }) => {
  const [ignoredErrors, setIgnoredErrors] = useState([]);
  const [dictionaryAdded, setDictionaryAdded] = useState([]);
  
  const visibleErrors = errors.filter(error => 
    !ignoredErrors.includes(error.word) && 
    !dictionaryAdded.includes(error.word)
  );
  
  const handleIgnoreError = (word) => {
    setIgnoredErrors([...ignoredErrors, word]);
    toast.success(`Se ignorará "${word}" en este documento`);
  };
  
  const handleAddToDictionary = (word) => {
    setDictionaryAdded([...dictionaryAdded, word]);
    toast.success(`"${word}" agregado al diccionario`);
  };
  
  if (errors.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
          Errores Ortográficos
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({visibleErrors.length} {visibleErrors.length === 1 ? 'error' : 'errores'})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {visibleErrors.length > 0 ? (
          <div className="space-y-2">
            {visibleErrors.map((error, index) => (
              <div 
                key={index}
                className="p-2 rounded-md border border-gray-200 flex justify-between items-start"
              >
                <div>
                  <div className="text-sm flex items-center">
                    <span className="font-medium text-red-500 mr-1">{error.word}</span>
                    <span className="text-gray-500">→</span>
                    <span className="font-medium text-green-500 ml-1">{error.suggestion}</span>
                  </div>
                  {error.context && (
                    <p className="text-xs text-gray-500 mt-1">
                      Contexto: "...{error.context}..."
                    </p>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    title="Ignorar"
                    onClick={() => handleIgnoreError(error.word)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0" 
                    title="Agregar al diccionario"
                    onClick={() => handleAddToDictionary(error.word)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Todos los errores han sido corregidos o ignorados.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpellingErrors;
