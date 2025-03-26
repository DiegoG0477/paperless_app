
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  ExternalLink, 
  History, 
  Users, 
  Building2, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  Star, 
  BookOpen, 
  AlertTriangle,
  CheckCircle,
  Plus
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { toast } from "sonner";
import VersionHistory from '../components/VersionHistory';
import RelatedEntities from '../components/RelatedEntities';
import SpellingErrors from '../components/SpellingErrors';

// Mock data para un documento individual (en una app real, esto vendría de una API)
const getDocumentById = (id) => {
  const mockDocuments = [
    {
      id: 1,
      title: 'Contrato de Compraventa - Acme Corp',
      description: 'Contrato para la compra de bienes entre Acme Corp y Productos Industriales SA',
      type: 'contrato',
      fileType: 'pdf',
      fileSize: '2.4 MB',
      versions: [
        {
          id: 101,
          version_tag: 'v3.0',
          updated_at: '2023-11-05T10:30:00',
          author: 'Juan Pérez',
          comment: 'Revisión final con correcciones solicitadas por el cliente'
        },
        {
          id: 102,
          version_tag: 'v2.0',
          updated_at: '2023-10-15T14:20:00',
          author: 'María López',
          comment: 'Incorporación de cláusulas adicionales'
        },
        {
          id: 103,
          version_tag: 'v1.0',
          updated_at: '2023-10-01T08:15:00',
          author: 'Juan Pérez',
          comment: 'Versión inicial'
        }
      ],
      author: 'Juan Pérez',
      created_at: '2023-10-01T08:15:00',
      updated_at: '2023-11-05T10:30:00',
      spelling_errors: [
        { word: 'compraveta', suggestion: 'compraventa', context: '...contrato de compraveta entre...' },
        { word: 'producto', suggestion: 'productos', context: '...suministrados por producto industriales...' },
        { word: 'clausla', suggestion: 'cláusula', context: '...según la clausla 4.2 del contrato...' }
      ],
      entities: {
        personas: [
          { nombre: 'Juan Pérez', rol: 'demandante', tipo: 'física' },
          { nombre: 'María López', rol: 'abogada', tipo: 'física' }
        ],
        organizaciones: [
          { nombre: 'Acme Corp', tipo: 'empresa' },
          { nombre: 'Productos Industriales SA', tipo: 'empresa' }
        ],
        fechas: [
          { tipo: 'firma', valor: '2023-10-01' },
          { tipo: 'vencimiento', valor: '2025-10-01' }
        ],
        ubicaciones: [
          { tipo: 'notaría', valor: 'Notaría 34 de Madrid' }
        ],
        terminos_clave: [
          "compraventa", "bienes muebles", "garantía"
        ]
      }
    },
    {
      id: 2,
      title: 'Demanda Civil - Caso #45892',
      description: 'Demanda por incumplimiento de contrato contra Industrial Technologies Inc.',
      type: 'demanda',
      fileType: 'docx',
      fileSize: '3.7 MB',
      versions: [
        {
          id: 201,
          version_tag: 'v2.0',
          updated_at: '2023-11-01T16:45:00',
          author: 'María López',
          comment: 'Actualización con documentación adicional'
        },
        {
          id: 202,
          version_tag: 'v1.0',
          updated_at: '2023-10-15T14:20:00',
          author: 'María López',
          comment: 'Documento inicial'
        }
      ],
      author: 'María López',
      created_at: '2023-10-15T14:20:00',
      updated_at: '2023-11-01T16:45:00',
      spelling_errors: [
        { word: 'demandado', suggestion: 'demandante', context: '...el demandado Carlos Rodríguez...' },
        { word: 'incumplieinto', suggestion: 'incumplimiento', context: '...el incumplieinto de las obligaciones...' }
      ],
      entities: {
        personas: [
          { nombre: 'Carlos Rodríguez', rol: 'demandante', tipo: 'física' },
          { nombre: 'María López', rol: 'abogada', tipo: 'física' }
        ],
        organizaciones: [
          { nombre: 'Industrial Technologies Inc.', tipo: 'empresa' }
        ],
        fechas: [
          { tipo: 'presentación', valor: '2023-10-15' },
          { tipo: 'audiencia', valor: '2023-12-10' }
        ],
        ubicaciones: [
          { tipo: 'juzgado', valor: 'Juzgado 45 Civil' }
        ],
        terminos_clave: [
          "incumplimiento", "contrato", "indemnización"
        ]
      }
    }
  ];

  return mockDocuments.find(doc => doc.id === parseInt(id));
};

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

const DocumentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  
  useEffect(() => {
    // Simulamos la carga del documento
    const fetchDocument = async () => {
      setLoading(true);
      try {
        // En una app real, aquí haríamos la llamada a la API
        const doc = getDocumentById(id);
        if (doc) {
          setDocument(doc);
        }
      } catch (error) {
        console.error("Error al cargar el documento:", error);
        toast.error("Error al cargar el documento");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocument();
  }, [id]);

  const handleAddComment = () => {
    if (!comment.trim()) {
      toast.error("Por favor, escribe un comentario");
      return;
    }
    
    // Simular agregar comentario
    toast.success("Comentario agregado correctamente");
    setComment('');
  };

  const handleOpenFile = () => {
    toast.info("Abriendo archivo...");
    // En una app real, aquí abriríamos el archivo
  };

  const handleMarkAsRelevant = () => {
    toast.success("Documento marcado como relevante");
    // En una app real, actualizaríamos el estado en la base de datos
  };

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 ml-16 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                className="mr-2"
                onClick={goBack}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver
              </Button>
            </div>
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-6 py-1">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 ml-16 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                className="mr-2"
                onClick={goBack}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver
              </Button>
            </div>
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Documento no encontrado</h2>
              <p className="text-gray-500 mb-6">El documento solicitado no existe o ha sido eliminado.</p>
              <Button onClick={() => navigate('/')}>
                Volver al inicio
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 ml-16 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header con botón de volver y acciones principales */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2"
              onClick={goBack}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleMarkAsRelevant}
              >
                <Star className="w-4 h-4 mr-1" />
                Marcar como relevante
              </Button>
              
              <Button 
                size="sm"
                onClick={handleOpenFile}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Abrir archivo
              </Button>
            </div>
          </div>
          
          {/* Información principal del documento */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{document.title}</CardTitle>
                      <CardDescription className="mt-2">{document.description || 'Sin descripción'}</CardDescription>
                    </div>
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                      {document.type === 'contrato' && <FileText className="text-blue-500" />}
                      {document.type === 'demanda' && <FileText className="text-red-500" />}
                      {document.type === 'acuerdo' && <FileText className="text-green-500" />}
                      {document.type === 'escritura' && <FileText className="text-purple-500" />}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Tipo de documento</p>
                      <p className="font-medium capitalize">{document.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Formato</p>
                      <p className="font-medium uppercase">{document.fileType}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Tamaño</p>
                      <p className="font-medium">{document.fileSize}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Versiones</p>
                      <p className="font-medium">{document.versions.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Creado por</p>
                      <p className="font-medium">{document.author}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Fecha de creación</p>
                      <p className="font-medium">{formatDate(document.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Última modificación</p>
                      <p className="font-medium">{formatDate(document.updated_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Errores ortográficos */}
              <div className="mt-6">
                <SpellingErrors errors={document.spelling_errors} />
              </div>
              
              {/* Historial de versiones */}
              <div className="mt-6">
                <VersionHistory versions={document.versions} />
              </div>
            </div>
            
            <div>
              {/* Entidades relacionadas */}
              <RelatedEntities entities={document.entities} />
              
              {/* Sección de comentarios */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Agregar comentario
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    placeholder="Escribe un comentario sobre este documento..." 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[100px]"
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    onClick={handleAddComment}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar comentario
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentView;
