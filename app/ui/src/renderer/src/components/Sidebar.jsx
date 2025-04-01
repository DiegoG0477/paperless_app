
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Search, 
  Users, 
  Building2, 
  MapPin, 
  Calendar, 
  Settings, 
  HelpCircle 
} from 'lucide-react';

const Sidebar = ({ pathname }) => {
  let location;
  try {
    // Try to use useLocation, will throw if not in Router context
    location = useLocation();
  } catch (error) {
    // Fallback to using the pathname prop if provided, or default to "/"
    location = { pathname: pathname || "/" };
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed left-0 top-0 bottom-0 w-16 bg-crimson dark:bg-gray-900 flex flex-col items-center py-5 z-10">
      <div className="flex flex-col items-center gap-1">
        <div className="w-10 h-10 bg-white/20 rounded-md flex items-center justify-center mb-6">
          <span className="text-white text-xl font-bold">P</span>
        </div>
        
        <div className="flex flex-col items-center gap-7 py-3">
          <Link to="/" className={`group relative ${isActive('/') ? 'text-white/90' : 'text-white/70 hover:text-white/90'}`}>
            <Home className="sidebar-icon" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Inicio
            </span>
          </Link>
          
          <Link to="/search" className={`group relative ${isActive('/search') ? 'text-white/90' : 'text-white/70 hover:text-white/90'}`}>
            <Search className="sidebar-icon" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Búsqueda
            </span>
          </Link>
          
          <Link to="/people" className={`group relative ${isActive('/people') ? 'text-white/90' : 'text-white/70 hover:text-white/90'}`}>
            <Users className="sidebar-icon" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Personas
            </span>
          </Link>
          
          <Link to="/organizations" className={`group relative ${isActive('/organizations') ? 'text-white/90' : 'text-white/70 hover:text-white/90'}`}>
            <Building2 className="sidebar-icon" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Organizaciones
            </span>
          </Link>
          
          <Link to="/locations" className={`group relative ${isActive('/locations') ? 'text-white/90' : 'text-white/70 hover:text-white/90'}`}>
            <MapPin className="sidebar-icon" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Ubicaciones
            </span>
          </Link>
          
          <Link to="/calendar" className={`group relative ${isActive('/calendar') ? 'text-white/90' : 'text-white/70 hover:text-white/90'}`}>
            <Calendar className="sidebar-icon" />
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Calendario
            </span>
          </Link>
        </div>
      </div>
      
      <div className="mt-auto flex flex-col items-center gap-7 py-3">
        <Link to="/settings" className={`group relative ${isActive('/settings') ? 'text-white/90' : 'text-white/70 hover:text-white/90'}`}>
          <Settings className="sidebar-icon" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Configuración
          </span>
        </Link>
        
        <button className="group relative text-white/70 hover:text-white/90">
          <HelpCircle className="sidebar-icon" />
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Ayuda
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
