
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { FileText, Clock, MapPin, User, Calendar } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

const EventDetails = ({ isOpen, onClose, event }) => {
  if (!event) return null;

  const getEventTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'audiencia':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'vencimiento':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'reunión':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.titulo}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-2">
            <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <div className="text-sm text-muted-foreground">Fecha</div>
              <div>{new Date(event.fecha).toLocaleDateString()}</div>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
            <div>
              <div className="text-sm text-muted-foreground">Hora</div>
              <div>{new Date(event.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="mt-0.5">
              <Badge className={getEventTypeColor(event.tipo)}>
                {event.tipo}
              </Badge>
            </div>
          </div>
          
          {event.ubicacion && (
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Ubicación</div>
                <div>{event.ubicacion}</div>
              </div>
            </div>
          )}
          
          {event.participantes && event.participantes.length > 0 && (
            <div className="flex items-start gap-2">
              <User className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <div className="text-sm text-muted-foreground">Participantes</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {event.participantes.map((participante, index) => (
                    <Badge key={index} variant="outline">
                      {participante}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {event.descripcion && (
            <div className="mt-2">
              <div className="text-sm font-medium mb-1">Descripción</div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {event.descripcion}
              </p>
            </div>
          )}
          
          {event.documento && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-start gap-2">
                <FileText className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Documento relacionado</div>
                  <Link 
                    to={`/document/${event.documento.id}`}
                    className="flex items-center gap-2 p-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div>
                      <div className="font-medium">{event.documento.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {event.documento.type} • Actualizado: {new Date(event.documento.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetails;
