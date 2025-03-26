
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import DocumentCard from './DocumentCard';
import { ArrowLeft, File, Clock } from 'lucide-react';
import { Helmet } from 'react-helmet';

const EntityDetail = ({ 
  entityType, 
  getEntityById, 
  getEntityDocuments, 
  renderEntityInfo 
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const entity = getEntityById(id);
  const documents = getEntityDocuments(id);

  if (!entity) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="w-96 text-center">
          <CardContent className="pt-6">
            <p className="mb-4">Esta entidad no existe o ha sido eliminada.</p>
            <Button onClick={() => navigate(-1)}>Volver</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getEntityTitle = () => {
    switch (entityType) {
      case 'person':
        return entity.nombre;
      case 'organization':
        return entity.nombre;
      case 'location':
        return entity.nombre || entity.valor;
      default:
        return '';
    }
  };

  const getEntityTypeLabel = () => {
    switch (entityType) {
      case 'person':
        return 'Persona';
      case 'organization':
        return 'Organización';
      case 'location':
        return 'Ubicación';
      default:
        return 'Entidad';
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <Helmet>
        <title>{getEntityTitle()} | Vista Avanzada</title>
      </Helmet>
      
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mr-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">{getEntityTitle()}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle>Información de {getEntityTypeLabel()}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderEntityInfo(entity)}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <File className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-sm">Documentos asociados</span>
                  </div>
                  <span className="font-medium">{documents.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-orange-500 mr-2" />
                    <span className="text-sm">Último documento</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {documents.length > 0 
                      ? new Date(documents[0].updated_at).toLocaleDateString() 
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Documentos relacionados</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="grid" className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="grid">Cuadrícula</TabsTrigger>
                    <TabsTrigger value="list">Lista</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="grid" className="mt-0">
                  {documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {documents.map(doc => (
                        <DocumentCard 
                          key={doc.id} 
                          document={doc} 
                          isSelected={false}
                          onSelect={() => {}}
                          viewMode="grid"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      No hay documentos asociados a esta entidad.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="list" className="mt-0">
                  {documents.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Título</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Última actualización</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {documents.map(doc => (
                            <TableRow key={doc.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/document/${doc.id}`)}>
                              <TableCell className="font-medium">{doc.title}</TableCell>
                              <TableCell>{doc.type}</TableCell>
                              <TableCell>{new Date(doc.updated_at).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      No hay documentos asociados a esta entidad.
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EntityDetail;
