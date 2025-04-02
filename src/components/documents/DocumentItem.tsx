import React from 'react';
import { FileText, LinkIcon, Calendar, MessageSquare, Download, Trash2 } from 'lucide-react';
import { Document } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

interface DocumentItemProps {
  document: Document;
  onComment: (document: Document) => void;
  onDownload: (document: Document) => void;
  onDelete: (document: Document) => void;
}

const DocumentItem: React.FC<DocumentItemProps> = ({ 
  document, 
  onComment, 
  onDownload, 
  onDelete 
}) => {
  const { t } = useLanguage();

  return (
    <li className="p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-medium text-gray-900">{document.name}</h3>
          </div>
          
          {document.description && (
            <p className="mt-1 text-sm text-gray-600">{document.description}</p>
          )}
          
          <div className="mt-2 flex flex-wrap gap-1">
            {document.tags.map(tag => (
              <span key={tag} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded">
              {t(document.type.replace(/\_/g, ''))}
            </span>
            {document.is_external && (
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded flex items-center">
                <LinkIcon className="h-3 w-3 mr-1" />
                {t('externalLink')}
              </span>
            )}
          </div>
          
          <div className="mt-2 flex items-center text-xs text-gray-500">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{new Date(document.created_at).toLocaleDateString()}</span>
            
            {document.comments.length > 0 && (
              <span className="ml-3 flex items-center">
                <MessageSquare className="h-3 w-3 mr-1" />
                {document.comments.length}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => onComment(document)}
            className="text-gray-500 hover:text-gray-700"
            title={t('addComment')}
            aria-label={t('addComment')}
          >
            <MessageSquare size={16} />
          </button>
          <button 
            onClick={() => onDownload(document)}
            className="text-blue-500 hover:text-blue-700"
            title={document.is_external ? t('openLink') : t('download')}
            aria-label={document.is_external ? t('openLink') : t('download')}
          >
            <Download size={16} />
          </button>
          <button 
            onClick={() => onDelete(document)}
            className="text-red-500 hover:text-red-700"
            title={t('delete')}
            aria-label={t('delete')}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </li>
  );
};

export default DocumentItem; 