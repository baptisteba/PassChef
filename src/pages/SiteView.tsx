import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Wifi, 
  Network, 
  Link as LinkIcon, 
  Info,
  Settings,
  MapPin
} from 'lucide-react';

interface Site {
  _id: string;
  name: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  description?: string;
  group_id?: string;
}

const SiteView: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSiteData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/sites/${id}`);
        setSite(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching site details:', err);
        setError('Failed to load site details');
      } finally {
        setLoading(false);
      }
    };

    fetchSiteData();
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
          {error || 'Site not found'}
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

  const navigateCard = (path: string) => {
    navigate(path);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">{site.name}</h1>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 flex-1">
          <div className="flex items-center mb-4">
            <MapPin className="h-5 w-5 text-gray-600 mr-2" />
            <h1 className="text-2xl font-bold">{site.name}</h1>
          </div>
          
          {site.address && (
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">{t('address')}:</span> {site.address.street && site.address.city ? 
              `${site.address.street}, ${site.address.city}, ${site.address.state} ${site.address.postal_code}, ${site.address.country}` : 
              t('noAddressProvided')}
            </p>
          )}
          
          {site.description && (
            <p className="text-gray-600">
              <span className="font-semibold">{t('description')}:</span> {site.description}
            </p>
          )}
        </div>
        
        <div className="bg-[rgb(22,34,114)] text-white rounded-lg shadow-md p-6 lg:w-72">
          <h2 className="text-xl font-bold mb-4">{t('siteManagement')}</h2>
          <button
            onClick={() => navigate(`/sites/${id}/edit`)}
            className="flex items-center hover:bg-blue-900 p-2 rounded w-full mb-2"
          >
            <Settings className="h-5 w-5 mr-2" />
            {t('editSite')}
          </button>
          
          <button
            onClick={() => {
              if (confirm(t('confirmDeleteSite'))) {
                // Delete site logic here
              }
            }}
            className="flex items-center hover:bg-red-700 p-2 rounded w-full text-red-200"
          >
            <Info className="h-5 w-5 mr-2" />
            {t('deleteSite')}
          </button>
        </div>
      </div>
      
      <h2 className="text-xl font-bold mb-4">{t('deployments')}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WiFi Card */}
        <div 
          onClick={() => navigateCard(`/sites/${id}/wifi`)}
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Wifi className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold">{t('wifiDeployments')}</h3>
          </div>
          <p className="text-gray-600">{t('wifiDeploymentsShort')}</p>
        </div>
        
        {/* WAN Card */}
        <div 
          onClick={() => navigateCard(`/sites/${id}/wan`)}
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Network className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold">{t('wanDeployments')}</h3>
          </div>
          <p className="text-gray-600">{t('wanDeploymentsShort')}</p>
        </div>
      </div>
      
      {/* Site Details Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">{t('siteInfo')}</h2>
        <div
          onClick={() => navigateCard(`/sites/${id}/details`)}
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex items-center mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <LinkIcon className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold">{t('siteDetails')}</h3>
          </div>
          <p className="text-gray-600">{t('siteDetailsShort')}</p>
        </div>
      </div>
    </div>
  );
};

export default SiteView; 