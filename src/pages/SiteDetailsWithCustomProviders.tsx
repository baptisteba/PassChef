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
  Globe,
  ExternalLink,
  MapPin,
  Building,
  Phone,
  Mail,
  Edit,
  Save,
  Info
} from 'lucide-react';
import DocumentItem from '../components/documents/DocumentItem';
import UploadDocumentModal from '../components/documents/UploadDocumentModal';
import ActivityFeed from '../components/documents/ActivityFeed';
import WanConnectionsSection from '../components/WanConnectionsSection';
import { Document, WANDeployment } from '../types/index';
import SiteHeader from '../components/SiteHeader';

interface ExternalTool {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

interface Site {
  _id: string;
  name: string;
  group_id?: string;
  group_name?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  onsite_contact?: {
    name: string;
    email: string;
    phone: string;
  };
  gps_coordinates?: {
    latitude: string;
    longitude: string;
  };
  notes?: string;
}

const SiteDetails: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [externalTools, setExternalTools] = useState<ExternalTool[]>([]);
  const [wanConnections, setWanConnections] = useState<WANDeployment[]>([]);
  const [documentActivities, setDocumentActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddToolModal, setShowAddToolModal] = useState(false);
  const [showEditSiteModal, setShowEditSiteModal] = useState(false);
  const [showAddWanModal, setShowAddWanModal] = useState(false);
  const [showEditToolModal, setShowEditToolModal] = useState(false);
  const [showEditWanModal, setShowEditWanModal] = useState(false);
  
  const [editingTool, setEditingTool] = useState<ExternalTool | null>(null);
  const [editingWan, setEditingWan] = useState<WANDeployment | null>(null);
  
  const [editedSite, setEditedSite] = useState<Site | null>(null);

  useEffect(() => {
    const fetchSiteData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Fetch site details
        const siteResponse = await api.get(`/sites/${id}`);
        setSite(siteResponse.data);
        setEditedSite(siteResponse.data);
        
        // Fetch documents
        try {
          const documentResponse = await api.get(`/sites/${id}/documents?module=particularities`);
          setDocuments(documentResponse.data || []);
          
          // Fetch activities for documents
          if (documentResponse.data && documentResponse.data.length > 0) {
            setActivitiesLoading(true);
            try {
              const documentIds = documentResponse.data.map((doc: Document) => doc._id);
              const activitiesResponse = await api.get(`/documents/activities`, {
                params: { documentIds: documentIds.join(',') }
              });
              setDocumentActivities(activitiesResponse.data || []);
            } catch (actErr) {
              console.error('Error fetching document activities:', actErr);
              setDocumentActivities([]);
            } finally {
              setActivitiesLoading(false);
            }
          }
        } catch (err) {
          console.error('Error fetching documents:', err);
          setDocuments([]);
        }
        
        // Fetch external tools
        try {
          const toolsResponse = await api.get(`/sites/${id}/external-tools`);
          setExternalTools(toolsResponse.data || []);
        } catch (err) {
          console.error('Error fetching external tools:', err);
          setExternalTools([]);
        }
        
        // Fetch WAN connections
        try {
          const wanResponse = await api.get(`/sites/${id}/wan-connections`);
          if (wanResponse.data) {
            // Ensure all WAN connections have proper IDs
            const validConnections = wanResponse.data
              .filter((conn: any) => conn !== null)
              .map((conn: any) => ({
                ...conn,
                id: conn._id || conn.id || `wan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
              }));
            
            setWanConnections(validConnections);
          } else {
            setWanConnections([]);
          }
        } catch (err) {
          console.error('Error fetching WAN connections:', err);
          setWanConnections([]);
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

  const handleEditExternalTool = async (toolData: ExternalTool) => {
    if (!toolData.id) return;
    
    try {
      const response = await api.put(`/sites/${id}/external-tools/${toolData.id}`, toolData);
      setExternalTools(prev => 
        prev.map(tool => tool.id === toolData.id ? response.data : tool)
      );
      setShowEditToolModal(false);
      setEditingTool(null);
    } catch (err) {
      console.error('Error updating external tool:', err);
      alert(t('errorUpdatingTool'));
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

  const handleAddWanConnection = async (connection: WANDeployment) => {
    try {
      // Remove mock implementation and use real API call
      const response = await api.post(`/sites/${id}/wan-connections`, connection);
      
      // Ensure the returned connection has both id and _id properties
      const newConnection = {
        ...response.data,
        id: response.data._id || response.data.id // Make sure id is set
      };
      
      setWanConnections(prev => [...prev, newConnection]);
      setShowAddWanModal(false);
    } catch (err) {
      console.error('Error adding WAN connection:', err);
      alert(t('errorAddingWan'));
    }
  };

  const handleEditWanConnection = async (connection: WANDeployment) => {
    // We need either the MongoDB _id or the client-side id to identify the connection
    const connectionId = connection._id || connection.id;
    if (!connectionId) {
      console.error('Error: WAN connection ID is undefined');
      return;
    }
    
    try {
      // Use real API call
      const response = await api.put(`/sites/${id}/wan-connections/${connectionId}`, connection);
      
      // Ensure the returned connection has both id and _id properties
      const updatedConnection = {
        ...response.data,
        id: response.data._id || response.data.id // Make sure id is set
      };
      
      // Update UI with the response from the server
      setWanConnections(prev => 
        prev.map(wan => (wan._id === connectionId || wan.id === connectionId) ? updatedConnection : wan)
      );
      
      setShowEditWanModal(false);
      setEditingWan(null);
    } catch (err) {
      console.error('Error updating WAN connection:', err);
      alert(t('errorUpdatingWan'));
    }
  };

  const handleDeleteWanConnection = async (wanId: string | undefined) => {
    if (!wanId) {
      console.error('Error: WAN connection ID is undefined');
      return;
    }
    
    if (window.confirm(t('confirmDeleteWan'))) {
      try {
        // Use real API call
        await api.delete(`/sites/${id}/wan-connections/${wanId}`);
        
        // Update UI after successful deletion using typecasting to avoid linting errors
        setWanConnections((prevConnections) => {
          return prevConnections.filter((connection: any) => {
            if (connection.id && connection.id === wanId) return false;
            if (connection._id && connection._id === wanId) return false;
            return true;
          });
        });
      } catch (err) {
        console.error('Error deleting WAN connection:', err);
        alert(t('errorDeletingWan'));
      }
    }
  };

  const handleDocumentComment = (document: Document) => {
    // Implementation would go here
    console.log('Comment on document:', document);
  };

  const handleDocumentDownload = (document: Document) => {
    // Implementation would go here
    if (document.is_external && document.url) {
      window.open(document.url, '_blank');
    } else if (document.file_info) {
      console.log('Download document:', document);
      // API call to download document
    }
  };

  const handleDocumentDelete = async (document: Document) => {
    if (window.confirm(t('confirmDeleteDocument'))) {
      try {
        await api.delete(`/sites/${id}/documents/${document._id}`);
        setDocuments(prev => prev.filter(doc => doc._id !== document._id));
      } catch (err) {
        console.error('Error deleting document:', err);
        alert(t('errorDeletingDocument'));
      }
    }
  };

  const handleSiteUpdate = async () => {
    if (!editedSite || !id) return;
    
    try {
      const response = await api.put(`/sites/${id}`, editedSite);
      setSite(response.data);
      setShowEditSiteModal(false);
      // Show success notification or feedback here
    } catch (err) {
      console.error('Error updating site:', err);
      alert(t('errorUpdatingSite'));
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editedSite) return;
    
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditedSite({
        ...editedSite,
        [parent]: {
          ...editedSite[parent as keyof Site] as any,
          [child]: value,
        },
      });
    } else {
      setEditedSite({
        ...editedSite,
        [name]: value,
      });
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
      
      {/* Site Info Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Info className="h-5 w-5 text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold">{t('siteInformation')}</h2>
          </div>
          <button
            onClick={() => setShowEditSiteModal(true)}
            className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-md hover:bg-indigo-200 flex items-center"
          >
            <Edit className="h-4 w-4 mr-1" />
            {t('editSiteInfo')}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('basicInfo')}</h3>
              <div className="flex items-start mb-2">
                <Building className="h-4 w-4 text-gray-500 mr-2 mt-1" />
                <div>
                  <p className="font-medium">{site.name}</p>
                  {site.group_name && <p className="text-sm text-gray-600">{site.group_name}</p>}
                </div>
              </div>
            </div>
            
            {site.address && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('address')}</h3>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-1" />
                  <div>
                    {site.address.street && <p className="text-sm">{site.address.street}</p>}
                    <p className="text-sm">
                      {[
                        site.address.city,
                        site.address.state,
                        site.address.postal_code,
                        site.address.country
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {site.onsite_contact && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('contactInfo')}</h3>
              <div className="mb-2">
                <div className="flex items-center mb-1">
                  <div className="w-5 h-5 mr-2 flex items-center justify-center">
                    <span className="text-gray-500">👤</span>
                  </div>
                  <p className="text-sm">{site.onsite_contact.name}</p>
                </div>
                {site.onsite_contact.email && (
                  <div className="flex items-center mb-1">
                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                    <p className="text-sm">{site.onsite_contact.email}</p>
                  </div>
                )}
                {site.onsite_contact.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                    <p className="text-sm">{site.onsite_contact.phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {site.notes && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('notes')}</h3>
            <p className="text-sm whitespace-pre-line bg-gray-50 p-3 rounded">{site.notes}</p>
          </div>
        )}
      </div>
      
      {/* WAN Connections Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Globe className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold">{t('wanConnections')}</h2>
          </div>
          <button
            onClick={() => setShowAddWanModal(true)}
            className="bg-green-100 text-green-600 px-3 py-1 rounded-md hover:bg-green-200 flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t('addWanConnection')}
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('wanConnectionsDescription')}</h3>
          </div>
          
          {wanConnections.length === 0 ? (
            <div className="text-sm whitespace-pre-line bg-gray-50 p-4 rounded">
              <p className="text-gray-500 text-center">{t('noWanConnections')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">{t('provider')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">{t('linkType')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">{t('bandwidth')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">{t('subscription')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {wanConnections.map(wan => (
                    <tr key={wan.id || `temp-${Date.now()}`} className="hover:bg-gray-50">
                      <td className="py-3 px-4">{wan.provider || 'N/A'}</td>
                      <td className="py-3 px-4">{wan.link_type || 'N/A'}</td>
                      <td className="py-3 px-4">{wan.bandwidth || 'N/A'}</td>
                      <td className="py-3 px-4">
                        {wan.subscribed_by_site ? 
                          <span className="font-bold">{t('subscribedBySiteShort')}</span> : 
                          <span>{t('subscribedByUs')}</span>
                        }
                      </td>
                      <td className="py-3 px-4">
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${wan.status === 'active' ? 'bg-green-100 text-green-800' : 
                            wan.status === 'ordered' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }
                        `}>
                          {wan.status || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {(wan.id || wan._id) && (
                          <div className="flex space-x-2 justify-end">
                            <button
                              onClick={() => {
                                setEditingWan(wan);
                                setShowEditWanModal(true);
                              }}
                              className="text-blue-500 hover:text-blue-700"
                              aria-label={t('editWan')}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                console.log('Deleting WAN connection with ID:', wan.id || wan._id);
                                handleDeleteWanConnection(wan.id || wan._id);
                              }}
                              className="text-red-500 hover:text-red-700"
                              aria-label={t('deleteWan')}
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* External Tools and Documents Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* External Tool Links Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <ExternalLink className="h-5 w-5 text-purple-600 mr-2" />
              <h2 className="text-xl font-semibold">{t('externalTools')}</h2>
            </div>
            <button
              onClick={() => setShowAddToolModal(true)}
              className="bg-purple-100 text-purple-600 px-3 py-1 rounded-md hover:bg-purple-200 flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t('addTool')}
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 h-full">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('externalToolsDescription')}</h3>
            </div>
            
            {externalTools.length === 0 ? (
              <div className="text-sm whitespace-pre-line bg-gray-50 p-4 rounded">
                <p className="text-gray-500 text-center">{t('noExternalTools')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
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
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingTool(tool);
                          setShowEditToolModal(true);
                        }}
                        className="text-blue-500 hover:text-blue-700"
                        aria-label={t('editTool')}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExternalTool(tool.id)}
                        className="text-red-500 hover:text-red-700"
                        aria-label={t('deleteTool')}
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Documents Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <File className="h-5 w-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold">{t('documents')}</h2>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-200 flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t('addDocument')}
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 h-full">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('documentsDescription')}</h3>
            </div>
            
            {documents.length === 0 ? (
              <div className="text-sm whitespace-pre-line bg-gray-50 p-4 rounded">
                <p className="text-gray-500 text-center">{t('noDocuments')}</p>
              </div>
            ) : (
              <>
                <div className="divide-y">
                  {documents.map(doc => (
                    <DocumentItem 
                      key={doc._id} 
                      document={doc} 
                      onComment={handleDocumentComment}
                      onDownload={handleDocumentDownload}
                      onDelete={handleDocumentDelete}
                    />
                  ))}
                </div>
                
                {documents.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">{t('activityLog')}</h3>
                    <ActivityFeed 
                      activities={documentActivities} 
                      loading={activitiesLoading} 
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Upload Document Modal */}
      {showUploadModal && (
        <UploadDocumentModal
          siteId={id || ''}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={(doc) => {
            setDocuments(prev => [...prev, doc]);
            setShowUploadModal(false);
          }}
        />
      )}
      
      {/* Edit Site Modal */}
      {showEditSiteModal && editedSite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{t('editSiteInfo')}</h2>
              <button
                onClick={() => setShowEditSiteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleSiteUpdate(); }}>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-[rgb(22,34,114)]">
                  {t('basicInfo')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                      {t('name')} *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={editedSite.name || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-[rgb(22,34,114)]">
                  {t('address')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address.street">
                      {t('street')}
                    </label>
                    <input
                      id="address.street"
                      name="address.street"
                      type="text"
                      value={editedSite.address?.street || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address.city">
                      {t('city')}
                    </label>
                    <input
                      id="address.city"
                      name="address.city"
                      type="text"
                      value={editedSite.address?.city || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address.state">
                      {t('state')}
                    </label>
                    <input
                      id="address.state"
                      name="address.state"
                      type="text"
                      value={editedSite.address?.state || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address.postal_code">
                      {t('postalCode')}
                    </label>
                    <input
                      id="address.postal_code"
                      name="address.postal_code"
                      type="text"
                      value={editedSite.address?.postal_code || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address.country">
                      {t('country')}
                    </label>
                    <input
                      id="address.country"
                      name="address.country"
                      type="text"
                      value={editedSite.address?.country || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-[rgb(22,34,114)]">
                  {t('contactInfo')}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="onsite_contact.name">
                      {t('contactName')}
                    </label>
                    <input
                      id="onsite_contact.name"
                      name="onsite_contact.name"
                      type="text"
                      value={editedSite.onsite_contact?.name || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="onsite_contact.email">
                      {t('email')}
                    </label>
                    <input
                      id="onsite_contact.email"
                      name="onsite_contact.email"
                      type="email"
                      value={editedSite.onsite_contact?.email || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="onsite_contact.phone">
                      {t('phone')}
                    </label>
                    <input
                      id="onsite_contact.phone"
                      name="onsite_contact.phone"
                      type="tel"
                      value={editedSite.onsite_contact?.phone || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-[rgb(22,34,114)]">
                  {t('notes')}
                </h3>
                
                <div>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={editedSite.notes || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                    placeholder={t('notesPlaceholder')}
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditSiteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[rgb(22,34,114)] text-white rounded-md hover:bg-[rgb(32,44,124)] flex items-center"
                >
                  <Save className="h-4 w-4 mr-1" />
                  {t('saveChanges')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Add WAN Connection Modal */}
      {showAddWanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{t('addWanConnection')}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              
              const connectionData = {
                site_id: id || '', // Use the current site ID
                provider: formData.get('provider') as string,
                link_type: formData.get('link_type') as string,
                bandwidth: `${formData.get('bandwidth')} Mbps`,
                status: formData.get('status') as string,
                subscribed_by_site: formData.get('subscribed_by_site') === 'on'
              };
              
              console.log('Adding WAN connection with data:', connectionData);
              handleAddWanConnection(connectionData as WANDeployment);
            }}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="provider">
                  {t('provider')}
                </label>
                <input
                  id="provider"
                  name="provider"
                  type="text"
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="link_type">
                  {t('linkType')}
                </label>
                <select
                  id="link_type"
                  name="link_type"
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="FTTO">{t('FTTO')}</option>
                  <option value="FTTH">{t('FTTH')}</option>
                  <option value="Starlink">{t('Starlink')}</option>
                  <option value="ADSL">{t('ADSL')}</option>
                  <option value="VDSL">{t('VDSL')}</option>
                  <option value="OTHER">{t('OTHER')}</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bandwidth">
                  {t('bandwidth')}
                </label>
                <div className="flex items-center">
                  <select
                    id="bandwidth"
                    name="bandwidth"
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="300">300</option>
                    <option value="500">500</option>
                    <option value="1000">1000</option>
                  </select>
                  <span className="ml-2 text-gray-700">Mbps</span>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    id="subscribed_by_site"
                    name="subscribed_by_site"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-gray-700 text-sm font-bold" htmlFor="subscribed_by_site">
                    {t('subscribedBySite')}
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">{t('subscribedBySiteHelp')}</p>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                  {t('status')}
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="active">{t('active')}</option>
                  <option value="ordered">{t('ordered')}</option>
                  <option value="inactive">{t('inactive')}</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddWanModal(false)}
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
      
      {/* Add External Tool Modal */}
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
      
      {/* Edit External Tool Modal */}
      {showEditToolModal && editingTool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{t('editExternalTool')}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              const updatedToolData = {
                ...editingTool,
                name: formData.get('name') as string,
                url: formData.get('url') as string
              };
              handleEditExternalTool(updatedToolData);
            }}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-tool-name">
                  {t('name')}
                </label>
                <input
                  id="edit-tool-name"
                  name="name"
                  type="text"
                  required
                  defaultValue={editingTool.name}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-tool-url">
                  {t('url')}
                </label>
                <input
                  id="edit-tool-url"
                  name="url"
                  type="url"
                  required
                  defaultValue={editingTool.url}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditToolModal(false);
                    setEditingTool(null);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit WAN Connection Modal */}
      {showEditWanModal && editingWan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">{t('editWanConnection')}</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              
              // Extract the bandwidth number for cleaner formatting
              let bandwidth = formData.get('bandwidth') as string || '';
              if (!bandwidth.includes('Mbps') && !bandwidth.includes('Gbps')) {
                bandwidth = `${bandwidth} Mbps`;
              }
              
              // Create a new connection object with the updated values
              const updatedWanData: Partial<WANDeployment> = {
                // Keep the same ID from the original connection
                _id: editingWan._id,
                id: editingWan.id,
                site_id: id || '',
                provider: formData.get('provider') as string || '',
                link_type: formData.get('link_type') as string || '',
                bandwidth: bandwidth,
                status: formData.get('status') as string || '',
                subscribed_by_site: formData.get('subscribed_by_site') === 'on'
              };
              
              // Call the update function
              handleEditWanConnection(updatedWanData as WANDeployment);
            }}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-provider">
                  {t('provider')}
                </label>
                <input
                  id="edit-provider"
                  name="provider"
                  type="text"
                  required
                  defaultValue={editingWan.provider}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-link_type">
                  {t('linkType')}
                </label>
                <select
                  id="edit-link_type"
                  name="link_type"
                  required
                  defaultValue={editingWan.link_type}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="FTTO">{t('FTTO')}</option>
                  <option value="FTTH">{t('FTTH')}</option>
                  <option value="Starlink">{t('Starlink')}</option>
                  <option value="ADSL">{t('ADSL')}</option>
                  <option value="VDSL">{t('VDSL')}</option>
                  <option value="OTHER">{t('OTHER')}</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-bandwidth">
                  {t('bandwidth')}
                </label>
                <div className="flex items-center">
                  <select
                    id="edit-bandwidth"
                    name="bandwidth"
                    required
                    defaultValue={editingWan.bandwidth.replace(' Mbps', '')}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="300">300</option>
                    <option value="500">500</option>
                    <option value="1000">1000</option>
                  </select>
                  <span className="ml-2 text-gray-700">Mbps</span>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    id="edit-subscribed_by_site"
                    name="subscribed_by_site"
                    type="checkbox"
                    defaultChecked={editingWan.subscribed_by_site}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-gray-700 text-sm font-bold" htmlFor="edit-subscribed_by_site">
                    {t('subscribedBySite')}
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">{t('subscribedBySiteHelp')}</p>
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="edit-status">
                  {t('status')}
                </label>
                <select
                  id="edit-status"
                  name="status"
                  required
                  defaultValue={editingWan.status}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="active">{t('active')}</option>
                  <option value="ordered">{t('ordered')}</option>
                  <option value="inactive">{t('inactive')}</option>
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditWanModal(false);
                    setEditingWan(null);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteDetails; 