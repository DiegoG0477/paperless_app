
import React from 'react';
import { Calendar, FileText, User, Tag, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getDocumentIcon = (type) => {
  switch (type) {
    case 'contrato':
      return <FileText className="text-blue-500" />;
    case 'demanda':
      return <FileText className="text-red-500" />;
    case 'acuerdo':
      return <FileText className="text-green-500" />;
    case 'escritura':
      return <FileText className="text-purple-500" />;
    default:
      return <FileText className="text-gray-500" />;
  }
};

const getFileIcon = (fileType) => {
  switch (fileType) {
    case 'pdf':
      return <span className="text-red-500 font-medium">PDF</span>;
    case 'doc':
    case 'docx':
      return <span className="text-blue-500 font-medium">DOC</span>;
    case 'txt':
      return <span className="text-gray-500 font-medium">TXT</span>;
    default:
      return <span className="text-gray-500 font-medium">{fileType.toUpperCase()}</span>;
  }
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

const DocumentCard = ({ document, isSelected, onSelect, viewMode = 'list' }) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/document/${document.id}`);
  };
  
  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onSelect(document.id);
  };
  
  if (viewMode === 'list') {
    return (
      <div 
        className={`document-card ${isSelected ? 'active' : ''} cursor-pointer`}
        onClick={handleCardClick}
      >
        <div className="flex items-center space-x-2 pr-3">
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={handleCheckboxClick}
            className="w-4 h-4 rounded border-gray-300 text-crimson focus:ring-crimson"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
            {getDocumentIcon(document.type)}
          </div>
        </div>
        
        <div className="flex-1 ml-2">
          <h3 className="font-medium text-gray-900">{document.title}</h3>
          <p className="text-sm text-gray-500">{document.description || 'Sin descripción'}</p>
        </div>
        
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center space-x-1 min-w-20">
            {getFileIcon(document.fileType)}
          </div>
          
          <div className="flex items-center space-x-1 min-w-20">
            <Tag className="w-4 h-4" />
            <span>{document.type}</span>
          </div>
          
          <div className="flex items-center space-x-1 min-w-20">
            <History className="w-4 h-4" />
            <span>{document.versions || 1}</span>
          </div>
          
          <div className="flex items-center space-x-1 min-w-32">
            <User className="w-4 h-4" />
            <span>{document.author}</span>
          </div>
          
          <div className="flex items-center space-x-1 min-w-24">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(document.updated_at)}</span>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div 
        className={`p-4 border rounded-lg ${isSelected ? 'border-crimson' : 'border-gray-200'} hover:shadow-md transition-shadow duration-200 cursor-pointer`}
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center">
            {getDocumentIcon(document.type)}
          </div>
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={handleCheckboxClick}
            className="w-4 h-4 rounded border-gray-300 text-crimson focus:ring-crimson"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{document.title}</h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{document.description || 'Sin descripción'}</p>
        
        <div className="flex flex-wrap gap-y-2 text-xs text-gray-500">
          <div className="flex items-center space-x-1 mr-3">
            {getFileIcon(document.fileType)}
          </div>
          
          <div className="flex items-center space-x-1 mr-3">
            <Tag className="w-3 h-3" />
            <span>{document.type}</span>
          </div>
          
          <div className="flex items-center space-x-1 mr-3">
            <User className="w-3 h-3" />
            <span>{document.author}</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(document.updated_at)}</span>
          </div>
        </div>
      </div>
    );
  }
};

export default DocumentCard;
