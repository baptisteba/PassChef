import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../contexts/AuthContext';
import { 
  Globe, 
  Plus, 
  Download,
  Trash2,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import SiteHeader from '../components/SiteHeader';

interface Site {
  _id: string;
  name: string;
  group_id: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  onsite_contact?: {
    name: string;
    email: string;
    phone: string;
  };
}

interface ExternalTool {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

const WanDeployments: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [externalTools, setExternalTools] = useState<ExternalTool[]>([]);
  
  useEffect(() => {
    const fetchSite = async () => {
      try {
        const response = await api.get(`/sites/${id}`);
        setSite(response.data);
      } catch (err) {
        console.error('Error fetching site:', err);
        setError(t('errorFetchingSite'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchSite();
  }, [id, t]);
  
  useEffect(() => {
    const fetchExternalTools = async () => {
      if (!id) return;

      try {
        const response = await api.get(`/sites/${id}/external-tools`);
        setExternalTools(response.data || []);
      } catch (err) {
        console.error('Error fetching external tools:', err);
        setExternalTools([]);
      }
    };

    fetchExternalTools();
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[rgb(22,34,114)]"></div>
      </div>
    );
  }
  
  if (error || !site) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || t('siteNotFound')}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-[rgb(22,34,114)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('back')}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SiteHeader 
        siteName={site.name}
        siteId={site._id}
        module={t('wanConnections')}
        moduleIcon={<Globe className="h-5 w-5 text-blue-600" />}
        externalTools={externalTools}
      />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col items-center justify-center py-8">
          <Globe className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">{t('wanDeploymentsTitle')}</h2>
          <p className="text-gray-500 text-center mb-6 max-w-lg">{t('wanDeploymentsDescription')}</p>
          
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md opacity-50 cursor-not-allowed"
            disabled
          >
            <Plus className="h-4 w-4 inline mr-2" />
            {t('addWanConnection')}
          </button>
          <p className="text-xs text-gray-500 mt-2">{t('comingSoon')}</p>
        </div>
      </div>
    </div>
  );
};

export default WanDeployments; 