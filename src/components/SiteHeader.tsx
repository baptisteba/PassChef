import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, ExternalLink } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ExternalTool {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

interface SiteHeaderProps {
  siteName: string;
  siteId: string;
  module?: string;
  moduleIcon?: React.ReactNode;
  externalTools?: ExternalTool[];
}

const SiteHeader: React.FC<SiteHeaderProps> = ({ 
  siteName, 
  siteId,
  module,
  moduleIcon,
  externalTools = []
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="mb-6">
      {/* Navigation */}
      <div className="flex items-center mb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-[rgb(22,34,114)] hover:underline"
          aria-label={t('back')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('back')}
        </button>
      </div>
      
      {/* Site context header */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Home className="h-5 w-5 text-indigo-600 mr-2" />
            <h1 className="text-xl font-semibold text-gray-800">{siteName}</h1>
            
            {module && moduleIcon && (
              <div className="flex items-center ml-6 pl-6 border-l border-gray-300">
                {moduleIcon}
                <span className="ml-2 text-lg font-medium text-gray-700">{module}</span>
              </div>
            )}
          </div>
          
          {/* External tools */}
          {externalTools.length > 0 && (
            <div className="flex space-x-2">
              {externalTools.map(tool => (
                <a 
                  key={tool.id}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm flex items-center text-gray-700"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  {tool.name}
                </a>
              ))}
            </div>
          )}
        </div>
        
        {/* Navigation tabs */}
        <div className="mt-4 flex space-x-4 text-sm">
          <button 
            key="overview"
            onClick={() => navigate(`/sites/${siteId}/details`)}
            className={`px-3 py-1 rounded-md ${module === t('overview') ? 'bg-indigo-100 text-indigo-800' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            {t('overview')}
          </button>
          <button 
            key="wifiDeployments"
            onClick={() => navigate(`/sites/${siteId}/wifi`)}
            className={`px-3 py-1 rounded-md ${module === t('wifiDeployments') ? 'bg-indigo-100 text-indigo-800' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            {t('wifiDeployments')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SiteHeader; 