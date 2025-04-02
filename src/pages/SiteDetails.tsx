import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Link as LinkIcon, 
  File, 
  Plus, 
  Trash, 
  Edit,
  Globe,
  Download,
  ExternalLink,
  Network,
  Info
} from 'lucide-react';
import { WANDeployment } from '../types';
import WanConnectionModal from '../components/WanConnectionModal';
import SiteHeader from '../components/SiteHeader';

interface Site {
  _id: string;
  name: string;
  group_id?: string;
}

interface ExternalTool {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

const SiteDetails: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [externalTools, setExternalTools] = useState<ExternalTool[]>([]);
  const [wanConnections, setWanConnections] = useState<WANDeployment[]>([]);
  
  const [showAddToolModal, setShowAddToolModal] = useState(false);
  const [showAddWanModal, setShowAddWanModal] = useState(false);
  
  const [providers, setProviders] = useState<string[]>(['Orange', 'SFR', 'Bouygues', 'Free', 'Starlink']);
  const [newProvider, setNewProvider] = useState('');
  
  // Form states for WAN connection
  const [wanForm, setWanForm] = useState({
    provider: '',
    link_type: 'FTTO',
    bandwidth: '',
    status: 'active'
  });

  useEffect(() => {
    const fetchSiteData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch site details
        const siteResponse = await api.get(`/sites/${id}`);
        setSite(siteResponse.data);
        
        // Fetch external tools
        try {
          const toolsResponse = await api.get(`/sites/${id}/external-tools`);
          setExternalTools(toolsResponse.data || []);
        } catch (toolsErr) {
          console.error('Error fetching external tools:', toolsErr);
          // Initialize with some default tools if API fails
          setExternalTools([
            { id: '1', name: 'Passweb', url: 'https://passweb.example.com' },
            { id: '2', name: 'Wifipass', url: 'https://wifipass.example.com' },
            { id: '3', name: 'Topos', url: 'https://topos.example.com' }
          ]);
        }
        
        // Fetch WAN connections
        try {
          const wanResponse = await api.get(`/sites/${id}/wan-connections`);
          setWanConnections(wanResponse.data || []);
        } catch (wanErr) {
          console.error('Error fetching WAN connections:', wanErr);
        }
        
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

  const handleAddExternalTool = async (toolData: ExternalTool) => {
    try {
      const response = await api.post(`/sites/${id}/external-tools`, toolData);
      setExternalTools(prev => [...prev, response.data]);
      setShowAddToolModal(false);
    } catch (err) {
      console.error('Error adding external tool:', err);
      alert(t('errorAddingTool'));
    }
  };

  const handleDeleteExternalTool = async (toolId: string) => {
    if (window.confirm(t('confirmDeleteTool'))) {
      try {
        await api.delete(`/sites/${id}/external-tools/${toolId}`);
        setExternalTools(prev => prev.filter(tool => tool.id !== toolId));
      } catch (err) {
        console.error('Error deleting external tool:', err);
        alert(t('errorDeletingTool'));
      }
    }
  };

  const handleAddWanConnection = async (wanData: {
    provider: string;
    link_type: string;
    bandwidth: string;
    status: string;
  }) => {
    try {
      const response = await api.post(`/sites/${id}/wan-connections`, wanData);
      setWanConnections(prev => [...prev, response.data]);
      setShowAddWanModal(false);
      setWanForm({
        provider: '',
        link_type: 'FTTO',
        bandwidth: '',
        status: 'active'
      });
    } catch (err) {
      console.error('Error adding WAN connection:', err);
      alert(t('errorAddingWan'));
    }
  };

  const handleDeleteWanConnection = async (wanId: string) => {
    if (window.confirm(t('confirmDeleteWan'))) {
      try {
        await api.delete(`/sites/${id}/wan-connections/${wanId}`);
        setWanConnections(prev => prev.filter(wan => wan.id !== wanId));
      } catch (err) {
        console.error('Error deleting WAN connection:', err);
        alert(t('errorDeletingWan'));
      }
    }
  };

  const handleAddProvider = () => {
    if (newProvider.trim() && !providers.includes(newProvider.trim())) {
      // Add to providers list
      setProviders(prev => [...prev, newProvider.trim()]);
      
      // Update the provider in the form
      setWanForm(prev => ({ ...prev, provider: newProvider.trim() }));
      
      // Clear the input field
      setNewProvider('');
    }
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <SiteHeader 
        siteName={site.name}
        siteId={site._id}
        module={t('overview')}
        moduleIcon={<Globe className="h-5 w-5 text-blue-600" />}
        externalTools={externalTools}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* External Tool Links Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <ExternalLink className="h-5 w-5 text-purple-600 mr-2" />
              <h2 className="text-xl font-semibold">{t('externalTools')}</h2>
            </div>
            <button
              onClick={() => setShowAddToolModal(true)}
              className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t('addTool')}
            </button>
          </div>
          
          <p className="text-gray-600 mb-4">{t('externalToolsDescription')}</p>
          
          {externalTools.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-md">
              <p className="text-gray-500">{t('noExternalTools')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {externalTools.map(tool => (
                <div key={tool.id} className="border rounded-md p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{tool.name}</h3>
                    <a 
                      href={tool.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center text-sm"
                    >
                      <Globe className="h-3 w-3 mr-1" />
                      {t('openTool')}
                    </a>
                  </div>
                  <button
                    onClick={() => handleDeleteExternalTool(tool.id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label={t('deleteTool')}
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {showAddToolModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">{t('addExternalTool')}</h2>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  const toolData = {
                    id: Date.now().toString(), // Temporary ID
                    name: formData.get('name') as string,
                    url: formData.get('url') as string
                  };
                  handleAddExternalTool(toolData);
                }}>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tool-name">
                      {t('name')}
                    </label>
                    <input
                      id="tool-name"
                      name="name"
                      type="text"
                      required
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tool-url">
                      {t('url')}
                    </label>
                    <input
                      id="tool-url"
                      name="url"
                      type="url"
                      required
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowAddToolModal(false)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      {t('add')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
        
        {/* WAN Connections Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Network className="h-5 w-5 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold">{t('wanConnections')}</h2>
            </div>
            <button
              onClick={() => setShowAddWanModal(true)}
              className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t('addWanConnection')}
            </button>
          </div>
          
          <p className="text-gray-600 mb-4">{t('wanConnectionsDescription')}</p>
          
          {wanConnections.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-md">
              <p className="text-gray-500">{t('noWanConnections')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">{t('provider')}</th>
                    <th className="py-3 px-6 text-left">{t('linkType')}</th>
                    <th className="py-3 px-6 text-left">{t('bandwidth')}</th>
                    <th className="py-3 px-6 text-left">{t('status')}</th>
                    <th className="py-3 px-6 text-center">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  {wanConnections.map(wan => (
                    <tr key={wan.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-6 text-left">{wan.provider}</td>
                      <td className="py-3 px-6 text-left">{wan.link_type}</td>
                      <td className="py-3 px-6 text-left">{wan.bandwidth}</td>
                      <td className="py-3 px-6 text-left">
                        <span className={`
                          px-2 py-1 rounded-full text-xs 
                          ${wan.status === 'active' ? 'bg-green-100 text-green-800' : 
                            wan.status === 'ordered' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                          }
                        `}>
                          {wan.status}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button
                          onClick={() => handleDeleteWanConnection(wan.id)}
                          className="text-red-500 hover:text-red-700"
                          aria-label={t('deleteWan')}
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {showAddWanModal && (
            <WanConnectionModal
              initialProviders={providers}
              onClose={() => setShowAddWanModal(false)}
              onAddWanConnection={handleAddWanConnection}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteDetails;