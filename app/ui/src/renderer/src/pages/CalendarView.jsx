
import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, ArrowLeft, ArrowRight, Filter, X, AlertCircle, CalendarDays, CalendarClock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import EventDetails from '../components/EventDetails';

// Mock data for events with more sample events
const mockEvents = [
  {
    id: 1,
    titulo: "Audiencia Preliminar",
    descripcion: "Audiencia preliminar para el caso de demanda civil #45892",
    tipo: "audiencia",
    fecha: "2024-04-10T10:30:00",
    ubicacion: "Juzgado 45 Civil - Sala 3",
    participantes: ["Juan Pérez", "Ana García"],
    documento: {
      id: 2,
      title: "Demanda Civil - Caso #45892",
      description: "Demanda por incumplimiento de contrato contra Industrial Technologies Inc.",
      type: "demanda",
      updated_at: "2023-11-01T16:45:00"
    }
  },
  {
    id: 2,
    titulo: "Vencimiento Plazo de Apelación",
    descripcion: "Vence el plazo para presentar apelación en el caso de demanda laboral",
    tipo: "vencimiento",
    fecha: "2024-04-15T23:59:59",
    participantes: ["Carlos Rodríguez"],
    documento: {
      id: 6,
      title: "Demanda Laboral - Expediente #J789",
      description: "Demanda por despido injustificado contra Retail Services Inc.",
      type: "demanda",
      updated_at: "2023-11-07T10:15:00"
    }
  },
  {
    id: 3,
    titulo: "Reunión con Cliente",
    descripcion: "Reunión para discutir detalles del contrato de arrendamiento",
    tipo: "reunión",
    fecha: "2024-04-15T14:00:00",
    ubicacion: "Despacho Jurídico Méndez - Sala de Juntas",
    participantes: ["María López", "Roberto Sánchez"],
    documento: {
      id: 1,
      title: "Contrato de Arrendamiento - Acme Corp",
      description: "Contrato para la compra de bienes entre Acme Corp y Productos Industriales SA",
      type: "contrato",
      updated_at: "2023-11-05T10:30:00"
    }
  },
  {
    id: 4,
    titulo: "Firma de Escritura",
    descripcion: "Firma de escritura de compraventa de inmueble residencial",
    tipo: "reunión",
    fecha: "2024-04-20T11:00:00",
    ubicacion: "Notaría Pública No. 28",
    participantes: ["Sofía Martínez", "María López"],
    documento: {
      id: 3,
      title: "Escritura Notarial - Propiedad Calle Real 123",
      description: "Escritura de compraventa de inmueble residencial",
      type: "escritura",
      updated_at: "2023-10-28T09:15:00"
    }
  },
  {
    id: 5,
    titulo: "Audiencia Final",
    descripcion: "Audiencia final para resolución del caso de demanda civil",
    tipo: "audiencia",
    fecha: "2024-04-25T09:00:00",
    ubicacion: "Juzgado 45 Civil - Sala Principal",
    participantes: ["Juan Pérez", "Ana García", "Carlos Rodríguez"],
    documento: {
      id: 2,
      title: "Demanda Civil - Caso #45892",
      description: "Demanda por incumplimiento de contrato contra Industrial Technologies Inc.",
      type: "demanda",
      updated_at: "2023-11-01T16:45:00"
    }
  },
  // Nuevos eventos de muestra
  {
    id: 6,
    titulo: "Presentación de Pruebas",
    descripcion: "Fecha límite para presentar pruebas documentales en el caso de propiedad intelectual",
    tipo: "vencimiento",
    fecha: "2024-04-12T17:00:00",
    participantes: ["Elena Vázquez", "Mario Gutiérrez"],
    documento: {
      id: 8,
      title: "Demanda Propiedad Intelectual - Caso #PI2023-45",
      description: "Demanda por violación de patente contra Innovate Solutions LLC",
      type: "demanda",
      updated_at: "2023-12-10T14:30:00"
    }
  },
  {
    id: 7,
    titulo: "Mediación Familiar",
    descripcion: "Sesión de mediación para acuerdo de custodia compartida",
    tipo: "reunión",
    fecha: "2024-04-18T09:30:00",
    ubicacion: "Centro de Mediación Familiar - Sala 2B",
    participantes: ["Luis Morales", "Carmen Jiménez", "Mediador: Dr. Sánchez"],
    documento: {
      id: 12,
      title: "Expediente Custodia - Familia Morales",
      description: "Procedimiento de custodia compartida y régimen de visitas",
      type: "expediente",
      updated_at: "2024-01-15T11:20:00"
    }
  },
  {
    id: 8,
    titulo: "Declaración de Testigos",
    descripcion: "Toma de declaraciones a testigos clave en caso de fraude corporativo",
    tipo: "audiencia",
    fecha: "2024-04-22T14:00:00",
    ubicacion: "Fiscalía Especializada en Delitos Financieros",
    participantes: ["Fernando Ortega", "Testigos: Carolina Díaz, Raúl Montes"],
    documento: {
      id: 15,
      title: "Caso Fraude Corporativo - Expediente #F2024-89",
      description: "Investigación por presunto fraude financiero en Global Investments SA",
      type: "expediente",
      updated_at: "2024-02-20T09:45:00"
    }
  }
];

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState('month');
  const [filterType, setFilterType] = useState('all');
  const [filterDocument, setFilterDocument] = useState('all');
  
  // Get unique event types and document titles for filters
  const eventTypes = [...new Set(mockEvents.map(event => event.tipo))];
  const documentTitles = [...new Set(mockEvents.filter(event => event.documento).map(event => event.documento.title))];
  
  // Filter events based on selected filters
  const filteredEvents = useMemo(() => {
    return mockEvents.filter(event => {
      const matchesType = filterType === 'all' || event.tipo === filterType;
      const matchesDocument = filterDocument === 'all' || 
        (event.documento && event.documento.title === filterDocument);
      
      return matchesType && matchesDocument;
    });
  }, [filterType, filterDocument]);
  
  // Group events by date for easier rendering
  const eventsByDate = useMemo(() => {
    const grouped = {};
    filteredEvents.forEach(event => {
      const date = event.fecha.split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });
    return grouped;
  }, [filteredEvents]);
  
  // Calendar navigation
  const nextMonth = () => {
    setCurrentDate(date => {
      const newDate = new Date(date);
      if (view === 'month') {
        newDate.setMonth(date.getMonth() + 1);
      } else {
        newDate.setDate(date.getDate() + 7);
      }
      return newDate;
    });
  };
  
  const prevMonth = () => {
    setCurrentDate(date => {
      const newDate = new Date(date);
      if (view === 'month') {
        newDate.setMonth(date.getMonth() - 1);
      } else {
        newDate.setDate(date.getDate() - 7);
      }
      return newDate;
    });
  };
  
  const onDateClick = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayEvents = eventsByDate[dateStr] || [];
    
    if (dayEvents.length === 1) {
      setSelectedEvent(dayEvents[0]);
      setIsModalOpen(true);
    } else if (dayEvents.length > 1) {
      // TODO: Show multiple events for the day
      // For now, just show the first one
      setSelectedEvent(dayEvents[0]);
      setIsModalOpen(true);
    }
  };
  
  const renderHeader = () => {
    const dateFormat = view === 'month' ? 'MMMM yyyy' : 'PP';
    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-purple-500" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">Calendario Legal</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            onClick={prevMonth}
          >
            <ArrowLeft className="h-4 w-4" />
            {view === 'month' ? 'Mes anterior' : 'Semana anterior'}
          </Button>
          
          <h2 className="text-xl font-medium px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
            {format(currentDate, dateFormat, { locale: es })}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 hover:bg-purple-50 dark:hover:bg-purple-900/20"
            onClick={nextMonth}
          >
            {view === 'month' ? 'Mes siguiente' : 'Semana siguiente'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={view} onValueChange={setView}>
            <SelectTrigger className="w-[180px] border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-purple-500" />
                <SelectValue placeholder="Ver por..." />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Vista Mensual</SelectItem>
              <SelectItem value="week">Vista Semanal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };
  
  const renderFilters = () => {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-purple-100 dark:border-purple-900/50 mb-6 backdrop-blur-sm bg-white/90 dark:bg-gray-800/90">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium flex items-center gap-1 text-purple-700 dark:text-purple-300">
            <Filter className="h-4 w-4" />
            Filtros
          </h3>
          
          {(filterType !== 'all' || filterDocument !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
              onClick={() => {
                setFilterType('all');
                setFilterDocument('all');
              }}
            >
              <X className="h-3 w-3 mr-1" />
              Limpiar filtros
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="w-64">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="border-purple-100 dark:border-purple-900/50">
                <SelectValue placeholder="Filtrar por tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {eventTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-64">
            <Select value={filterDocument} onValueChange={setFilterDocument}>
              <SelectTrigger className="border-purple-100 dark:border-purple-900/50">
                <SelectValue placeholder="Filtrar por documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los documentos</SelectItem>
                {documentTitles.map((title) => (
                  <SelectItem key={title} value={title}>
                    {title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    );
  };
  
  const renderDays = () => {
    if (view !== 'month') return null;
    
    const dateFormat = 'eee';
    const days = [];
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(startDate, i);
      days.push(
        <div key={i} className="font-medium text-gray-600 dark:text-gray-300 text-center py-2 border-b border-purple-100 dark:border-purple-900/50">
          {format(day, dateFormat, { locale: es }).toUpperCase()}
        </div>
      );
    }
    
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };
  
  const getEventBadgeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'audiencia':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-800/50';
      case 'vencimiento':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-800/50';
      case 'reunión':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800/50 hover:bg-green-100 dark:hover:bg-green-800/50';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700/50';
    }
  };
  
  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const rows = [];
    let days = [];
    let day = startDate;
    
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayEvents = eventsByDate[dateStr] || [];
        const formattedDate = format(day, 'd');
        
        const dayClasses = `relative h-32 p-1 border border-purple-100 dark:border-purple-900/50 transition-colors duration-150 ${
          !isSameMonth(day, monthStart)
            ? 'bg-gray-50/70 text-gray-400 dark:bg-gray-900/30 dark:text-gray-600'
            : isToday(day)
            ? 'bg-purple-50/80 dark:bg-purple-900/20 ring-1 ring-inset ring-purple-200 dark:ring-purple-700'
            : 'bg-white/90 dark:bg-gray-800/90 hover:bg-purple-50/50 dark:hover:bg-purple-900/10'
        }`;
        
        days.push(
          <div key={day.toString()} className={dayClasses} onClick={() => onDateClick(day)}>
            <div className={`font-medium p-1 ${
              isToday(day) 
              ? 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 w-7 h-7 rounded-full flex items-center justify-center' 
              : ''
            }`}>
              {formattedDate}
            </div>
            <div className="overflow-auto max-h-24 scrollbar-thin">
              {dayEvents.map((event, idx) => (
                <div
                  key={idx}
                  className={`mt-1 p-1.5 text-xs rounded-md border cursor-pointer shadow-sm transition-all ${getEventBadgeColor(event.tipo)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(event);
                    setIsModalOpen(true);
                  }}
                >
                  <div className="font-medium truncate">{event.titulo}</div>
                  <div className="truncate text-xs opacity-80">
                    {format(parseISO(event.fecha), 'HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
        
        day = addDays(day, 1);
      }
      
      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );
      days = [];
    }
    
    return <div className="flex-1">{rows}</div>;
  };
  
  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const endDate = endOfWeek(startDate, { weekStartsOn: 1 });
    const days = [];
    let day = startDate;
    
    while (day <= endDate) {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayEvents = eventsByDate[dateStr] || [];
      
      days.push(
        <div key={day.toString()} className="flex-1 border border-purple-100 dark:border-purple-900/50 p-2 bg-white/90 dark:bg-gray-800/90">
          <div className={`font-medium mb-2 text-center py-1.5 rounded-md ${
            isToday(day) 
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
              : 'text-gray-700 dark:text-gray-300'
          }`}>
            {format(day, 'eee dd', { locale: es })}
          </div>
          
          <div className="space-y-2 overflow-auto max-h-[calc(100vh-250px)] scrollbar-thin">
            {dayEvents.length > 0 ? (
              dayEvents.map((event, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 text-xs rounded-md border cursor-pointer shadow-sm transition-all ${getEventBadgeColor(event.tipo)}`}
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsModalOpen(true);
                  }}
                >
                  <div className="font-medium">{event.titulo}</div>
                  <div className="mt-1 text-xs opacity-80">
                    {format(parseISO(event.fecha), 'HH:mm')}
                  </div>
                  <div className="mt-1 truncate text-[10px] opacity-70">
                    {event.documento?.title}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-8 italic">
                No hay eventos
              </div>
            )}
          </div>
        </div>
      );
      
      day = addDays(day, 1);
    }
    
    return <div className="flex flex-1 rounded-md overflow-hidden">{days}</div>;
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Helmet>
        <title>Calendario Legal | Sistema de Gestión Documental</title>
      </Helmet>
      
      <Sidebar />
      
      <div className="flex-1 ml-16 flex flex-col">
        <Header />
        
        <div className="container mx-auto px-4 py-6">
          {renderHeader()}
          
          {renderFilters()}
          
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 dark:text-gray-400 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm border border-purple-100 dark:border-purple-900/50">
              <AlertCircle className="h-12 w-12 mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No hay eventos que mostrar</h3>
              <p>No se encontraron eventos con los filtros actuales.</p>
              <Button 
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                variant="default"
                onClick={() => {
                  setFilterType('all');
                  setFilterDocument('all');
                }}
              >
                Mostrar todos los eventos
              </Button>
            </div>
          ) : (
            <>
              {view === 'month' ? (
                <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm border border-purple-100 dark:border-purple-900/50 overflow-hidden">
                  {renderDays()}
                  {renderCells()}
                </div>
              ) : (
                <div className="bg-white/90 dark:bg-gray-800/90 rounded-lg shadow-sm border border-purple-100 dark:border-purple-900/50 min-h-[600px] flex flex-col">
                  {renderWeekView()}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <EventDetails 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        event={selectedEvent} 
      />
    </div>
  );
};

export default CalendarView;
