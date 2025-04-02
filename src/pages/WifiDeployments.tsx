import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Wifi, 
  Search, 
  FileText, 
  Plus,
  Download,
  Trash2,
  Clock,
  CheckSquare,
  Building,
  Play,
  Archive,
  X,
  Calendar,
  FileDigit,
  Tag
} from 'lucide-react';
import UploadDocumentModal from '../components/documents/UploadDocumentModal';
import CommentModal from '../components/documents/CommentModal';
import DocumentItem from '../components/documents/DocumentItem';
import { Document } from '../types/index';
import Timeline from '../components/deployment/Timeline';
import TaskList from '../components/deployment/TaskList';
import { TimelineComment, DeploymentTask } from '../types';
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

interface WifiDeployment {
  _id: string;
  site_id: string;
  name: string;
  status: 'planning' | 'in_progress' | 'completed' | 'blocked';
  start_date?: string;
  completion_date?: string | null;
  created_by: {
    _id: string;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
  notes?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface ExternalTool {
  id: string;
  name: string;
  url: string;
  icon?: string;
}

// For compatibility with ActivityFeed component
interface Activity {
  _id: string;
  document_id: string;
  action: 'created' | 'updated' | 'deleted' | 'commented';
  user: User | string;
  timestamp: string;
  details?: string;
}

const WifiDeployments: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [site, setSite] = useState<Site | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [externalTools, setExternalTools] = useState<ExternalTool[]>([]);
  
  // States for deployments list and selection
  const [deployments, setDeployments] = useState<WifiDeployment[]>([]);
  const [deploymentsLoading, setDeploymentsLoading] = useState(true);
  const [selectedDeployment, setSelectedDeployment] = useState<WifiDeployment | null>(null);
  
  // New states for the timeline and task functionality
  const [timelineComments, setTimelineComments] = useState<TimelineComment[]>([]);
  const [tasks, setTasks] = useState<DeploymentTask[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);
  
  // State variables for the deployment management
  const [showDeploymentModal, setShowDeploymentModal] = useState(false);
  const [newDeployment, setNewDeployment] = useState<Partial<WifiDeployment>>({
    status: 'planning',
    site_id: id || '',
    name: '',
  });
  
  const [showEditDeploymentModal, setShowEditDeploymentModal] = useState(false);
  const [editingDeployment, setEditingDeployment] = useState<Partial<WifiDeployment>>({});
  
  // Add a state to track the view mode
  const [tableView, setTableView] = useState<'full' | 'reduced'>('full');
  // Add a state to track the active tab in deployment view
  const [activeTab, setActiveTab] = useState<'timeline' | 'documents' | 'tasks'>('timeline');
  // Add a state to track whether documents are visible
  const [documentsVisible, setDocumentsVisible] = useState(true);
  
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

  // Fetch all deployments for the site
  useEffect(() => {
    const fetchWifiDeployments = async () => {
      if (!id) return;
      
      try {
        setDeploymentsLoading(true);
        const response = await api.get(`/sites/${id}/wifi-deployment`);
        setDeployments(response.data || []);
        
        // If we have deployments, select the first one by default
        if (response.data && response.data.length > 0) {
          setSelectedDeployment(response.data[0]);
          // Don't automatically reduce the table on initial load
          setTableView('full');
        }
      } catch (err) {
        console.error('Error fetching WiFi deployments:', err);
        setDeployments([]);
      } finally {
        setDeploymentsLoading(false);
      }
    };
    
    fetchWifiDeployments();
  }, [id]);

  // Fetch documents only related to the selected deployment
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!id || !selectedDeployment?._id) return;
      
      try {
        setDocsLoading(true);
        const response = await api.get(`/sites/${id}/documents?module=wifi&deployment_id=${selectedDeployment._id}`);
        setDocuments(response.data || []);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setDocuments([]);
      } finally {
        setDocsLoading(false);
      }
    };

    fetchDocuments();
  }, [id, selectedDeployment]);

  // Fetch timeline comments for the selected deployment
  useEffect(() => {
    const fetchTimelineComments = async () => {
      if (!selectedDeployment?._id) return;
      
      try {
        setTimelineLoading(true);
        const response = await api.get(`/deployments/${selectedDeployment._id}/comments`);
        setTimelineComments(response.data || []);
      } catch (err) {
        console.error('Error fetching timeline comments:', err);
        setTimelineComments([]);
      } finally {
        setTimelineLoading(false);
      }
    };

    fetchTimelineComments();
  }, [selectedDeployment]);

  // Fetch tasks for the selected deployment
  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedDeployment?._id) return;
      
      try {
        setTasksLoading(true);
        const response = await api.get(`/deployments/${selectedDeployment._id}/tasks`);
        setTasks(response.data || []);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setTasks([]);
      } finally {
        setTasksLoading(false);
      }
    };

    fetchTasks();
  }, [selectedDeployment]);

  const handleUpload = () => {
    setShowUploadModal(true);
  };

  const handleAddComment = async (comment: Omit<TimelineComment, '_id' | 'timestamp'>) => {
    if (!selectedDeployment?._id) {
      console.error('Cannot add comment: No deployment selected');
      alert(t('errorAddingComment'));
      return;
    }
    
    try {
      // Ensure we're sending only the necessary fields to the API
      const commentData = {
        text: comment.text,
        importance: comment.importance || 'info'
      };
      
      console.log('Sending comment data:', commentData);
      const response = await api.post(`/deployments/${selectedDeployment._id}/comments`, commentData);
      console.log('Comment response:', response.data);
      
      const newComment = response.data;
      setTimelineComments([newComment, ...timelineComments]);
    } catch (err) {
      console.error('Error adding comment:', err);
      alert(t('errorAddingComment'));
    }
  };

  const handleDownload = async (document: Document) => {
    if (document.is_external) {
      window.open(document.url, '_blank');
    } else if (document.file_info) {
      try {
        // Call the endpoint to download the file
        const response = await api.get(`/documents/${document._id}/download`, {
          responseType: 'blob'
        });
        
        // Create a download link using the window.document
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = window.document.createElement('a');
        link.href = url;
        link.setAttribute('download', document.name);
        window.document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        console.error('Error downloading file:', err);
      }
    }
  };

  const handleDelete = async (document: Document) => {
    if (window.confirm(t('confirmDeleteDocument'))) {
      try {
        await api.delete(`/documents/${document._id}`);
        setDocuments(documents.filter(doc => doc._id !== document._id));
      } catch (err) {
        console.error('Error deleting document:', err);
      }
    }
  };

  const handleAddTask = async (task: Omit<DeploymentTask, '_id' | 'created_at' | 'updated_at'>) => {
    if (!selectedDeployment?._id) {
      console.error('Cannot add task: No deployment selected');
      return;
    }
    
    try {
      const response = await api.post(`/deployments/${selectedDeployment._id}/tasks`, task);
      const newTask = response.data;
      setTasks([...tasks, newTask]);
    } catch (err) {
      console.error('Error adding task:', err);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<DeploymentTask>) => {
    if (!selectedDeployment?._id) {
      console.error("Cannot update task: No deployment selected");
      return;
    }
    
    try {
      await api.patch(`/deployments/${selectedDeployment._id}/tasks/${taskId}`, updates);
      setTasks(tasks.map(task => {
        if (task._id === taskId) {
          return {
            ...task,
            ...updates,
            updated_at: new Date().toISOString()
          };
        }
        return task;
      }));
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!selectedDeployment?._id) {
      console.error("Cannot delete task: No deployment selected");
      return;
    }
    
    if (window.confirm(t('confirmDeleteTask'))) {
      try {
        await api.delete(`/deployments/${selectedDeployment._id}/tasks/${taskId}`);
        setTasks(tasks.filter(task => task._id !== taskId));
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  // Deployment management functions
  const handleCreateDeployment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!newDeployment.name?.trim()) {
      alert(t('deploymentNameRequired'));
      return;
    }
    
    try {
      const response = await api.post(`/sites/${id}/wifi-deployment`, newDeployment);
      setDeployments([response.data, ...deployments]);
      setSelectedDeployment(response.data);
      setShowDeploymentModal(false);
      // Reset the form
      setNewDeployment({
        status: 'planning',
        site_id: id || '',
        name: '',
      });
    } catch (err) {
      console.error('Error creating WiFi deployment:', err);
    }
  };

  const handleUpdateDeploymentStatus = async (status: WifiDeployment['status']) => {
    if (!selectedDeployment?._id) return;
    
    try {
      const updates: Partial<WifiDeployment> = { status };
      // If status is completed, add completion date
      if (status === 'completed') {
        updates.completion_date = new Date().toISOString();
      }
      
      const response = await api.patch(`/sites/${id}/wifi-deployment/${selectedDeployment._id}`, updates);
      
      // Update both the deployments list and the selected deployment
      setDeployments(deployments.map(d => 
        d._id === selectedDeployment._id ? response.data : d
      ));
      setSelectedDeployment(response.data);
    } catch (err) {
      console.error('Error updating deployment status:', err);
    }
  };

  const handleArchiveDeployment = async () => {
    if (!selectedDeployment?._id) return;
    
    if (window.confirm(t('confirmArchiveDeployment'))) {
      try {
        await api.post(`/sites/${id}/wifi-deployment/${selectedDeployment._id}/archive`);
        // Remove the archived deployment from the list
        setDeployments(deployments.filter(d => d._id !== selectedDeployment._id));
        // Select the next deployment if available
        if (deployments.length > 1) {
          const nextDeployment = deployments.find(d => d._id !== selectedDeployment._id);
          setSelectedDeployment(nextDeployment || null);
        } else {
          setSelectedDeployment(null);
        }
      } catch (err) {
        console.error('Error archiving deployment:', err);
      }
    }
  };

  const handleDeleteDeployment = async () => {
    if (!selectedDeployment?._id) return;
    
    if (window.confirm(t('confirmDeleteDeployment'))) {
      try {
        await api.delete(`/deployments/${selectedDeployment._id}`);
        
        // Remove the deleted deployment from the list
        setDeployments(deployments.filter(d => d._id !== selectedDeployment._id));
        
        // Clear all related states
        setTasks([]);
        setTimelineComments([]);
        // Only keep documents not related to this deployment
        // This assumes we have a way to identify which documents belong to which deployment
        // If there's no deployment_id on Document type, we'll need another way to filter
        setDocuments([...documents]); // Just refresh documents without filtering
        
        // Select the next deployment if available
        if (deployments.length > 1) {
          const nextDeployment = deployments.find(d => d._id !== selectedDeployment._id);
          setSelectedDeployment(nextDeployment || null);
        } else {
          setSelectedDeployment(null);
        }
        
        // Show success message
        alert(t('deploymentDeleted'));
      } catch (err) {
        console.error('Error deleting deployment:', err);
        alert(t('errorDeletingDeployment'));
      }
    }
  };
  
  const handleEditDeployment = () => {
    if (!selectedDeployment) return;
    
    // Set up the editing state with current values
    setEditingDeployment({
      name: selectedDeployment.name,
      status: selectedDeployment.status,
      notes: selectedDeployment.notes
    });
    
    setShowEditDeploymentModal(true);
  };
  
  const handleUpdateDeployment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDeployment?._id || !editingDeployment.name?.trim()) {
      alert(t('deploymentNameRequired'));
      return;
    }
    
    try {
      const response = await api.patch(`/deployments/${selectedDeployment._id}`, editingDeployment);
      
      // Update both the deployments list and the selected deployment
      setDeployments(deployments.map(d => 
        d._id === selectedDeployment._id ? response.data : d
      ));
      setSelectedDeployment(response.data);
      setShowEditDeploymentModal(false);
      
      // Show success message
      alert(t('deploymentUpdated'));
    } catch (err) {
      console.error('Error updating deployment:', err);
      alert(t('errorUpdatingDeployment'));
    }
  };

  // Modify the function to handle selecting a deployment
  const handleSelectDeployment = (deployment: WifiDeployment) => {
    setSelectedDeployment(deployment);
    setTableView('reduced');
  };

  // Add a function to handle going back to the full table view
  const handleBackToFullTable = () => {
    setTableView('full');
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

  // Filter documents based on search term and filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (doc.comments.some(comment => comment.text.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesTag = tagFilter.length === 0 || tagFilter.some(tag => doc.tags.includes(tag));
    const matchesType = !typeFilter || doc.type === typeFilter;
    
    return matchesSearch && matchesTag && matchesType;
  });

  // Get all unique tags from documents
  const allTags = Array.from(new Set(documents.flatMap(doc => doc.tags)));
  
  // Get all unique document types
  const allTypes = Array.from(new Set(documents.map(doc => doc.type)));

  return (
    <div className="container mx-auto px-4 py-8">
      <SiteHeader 
        siteName={site.name}
        siteId={site._id}
        module={t('wifiDeployments')}
        moduleIcon={<Wifi className="h-5 w-5 text-blue-600" />}
        externalTools={externalTools}
      />
      
      {/* Deployments List */}
      <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${selectedDeployment ? 'border-l-4 border-blue-500' : ''}`}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Wifi className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">{t('wifiDeployments')}</h2>
            {selectedDeployment && (
              <span className="ml-2 text-sm text-gray-500">
                - {selectedDeployment.name}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {selectedDeployment && tableView === 'reduced' && (
              <button
                onClick={handleBackToFullTable}
                className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md hover:bg-gray-200 flex items-center text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('showAllDeployments')}
              </button>
            )}
            <button
              onClick={() => setShowDeploymentModal(true)}
              className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-200 flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" />
              {t('createDeployment')}
            </button>
          </div>
        </div>
        
        {/* Show the deployments table if we're in full view mode or there's no selected deployment */}
        {(tableView === 'full' || !selectedDeployment) && (
          deploymentsLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : deployments.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-4">{t('noDeploymentsYet')}</p>
              <button
                onClick={() => setShowDeploymentModal(true)}
                className="bg-blue-100 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-200 flex items-center mx-auto"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t('createFirstDeployment')}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('name')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('startDate')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('completionDate')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('tasks')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deployments.map(deployment => (
                    <tr 
                      key={deployment._id} 
                      className={`hover:bg-gray-50 cursor-pointer ${selectedDeployment?._id === deployment._id ? 'bg-blue-50' : ''}`}
                      onClick={() => handleSelectDeployment(deployment)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {deployment.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          deployment.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                          deployment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          deployment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {t(deployment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {deployment.start_date ? new Date(deployment.start_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {deployment.completion_date ? new Date(deployment.completion_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <CheckSquare className="h-4 w-4 mr-1 text-gray-400" />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectDeployment(deployment);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {t('view')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
      
      {/* Only show deployment details if a deployment is selected */}
      {selectedDeployment && (
        <>
          {/* Deployment Status */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="text-xl font-semibold text-gray-800">
                    {selectedDeployment?.name}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedDeployment.status === 'planning' ? 'bg-blue-100 text-blue-800' :
                    selectedDeployment.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    selectedDeployment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {t(selectedDeployment.status)}
                  </span>
                  <button
                    onClick={handleEditDeployment}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {t('edit')}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                  {selectedDeployment.start_date && (
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {t('started')}: {new Date(selectedDeployment.start_date).toLocaleDateString()}
                    </span>
                  )}
                  {selectedDeployment.completion_date && (
                    <span className="text-sm text-gray-500 flex items-center">
                      <CheckSquare className="h-4 w-4 mr-1" />
                      {t('completed')}: {new Date(selectedDeployment.completion_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {selectedDeployment.status === 'planning' && (
                    <button
                      onClick={() => handleUpdateDeploymentStatus('in_progress')}
                      className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-md hover:bg-yellow-200 flex items-center text-sm"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      {t('startDeployment')}
                    </button>
                  )}
                  {selectedDeployment.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateDeploymentStatus('completed')}
                      className="bg-green-100 text-green-600 px-3 py-1 rounded-md hover:bg-green-200 flex items-center text-sm"
                    >
                      <CheckSquare className="h-4 w-4 mr-1" />
                      {t('markCompleted')}
                    </button>
                  )}
                  {selectedDeployment.status === 'completed' && (
                    <button
                      onClick={handleArchiveDeployment}
                      className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md hover:bg-gray-200 flex items-center text-sm"
                    >
                      <Archive className="h-4 w-4 mr-1" />
                      {t('archiveDeployment')}
                    </button>
                  )}
                  <button
                    onClick={handleDeleteDeployment}
                    className="bg-red-100 text-red-600 px-3 py-1 rounded-md hover:bg-red-200 flex items-center text-sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {t('delete')}
                  </button>
                </div>
              </div>
              
              <div className="text-sm whitespace-pre-line">
                {selectedDeployment.notes ? (
                  <p className="text-gray-600">{selectedDeployment.notes}</p>
                ) : (
                  <p className="text-gray-400 italic">{t('noDeploymentNotes')}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Combined Timeline and Tasks in a single card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className="flex items-center mr-6">
                  <Clock className="h-5 w-5 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold">{t('timeline')}</h2>
                </div>
                <div className="flex items-center">
                  <CheckSquare className="h-5 w-5 text-green-600 mr-2" />
                  <h2 className="text-xl font-semibold">{t('tasks')}</h2>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Timeline in the main area */}
              <div className="lg:col-span-2">
                {timelineLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <Timeline 
                    comments={timelineComments}
                    deploymentId={selectedDeployment._id}
                    onAddComment={async (commentData) => {
                      const fullComment: Omit<TimelineComment, '_id' | 'timestamp'> = {
                        text: commentData.text,
                        importance: commentData.importance,
                        user: 'Current User',
                        deployment_id: selectedDeployment._id
                      };
                      return await handleAddComment(fullComment);
                    }}
                  />
                )}
              </div>
              
              {/* Tasks in the sidebar */}
              <div className="lg:col-span-1">
                {tasksLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <TaskList 
                    tasks={tasks}
                    deploymentId={selectedDeployment._id}
                    onAddTask={handleAddTask}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Toggle-able Documents section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold">{t('documents')}</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setDocumentsVisible(!documentsVisible)}
                  className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md hover:bg-gray-200 flex items-center text-sm"
                >
                  {documentsVisible ? t('hideDocuments') : t('showDocuments')}
                </button>
                <button
                  onClick={handleUpload}
                  className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-200 flex items-center text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t('addDocument')}
                </button>
              </div>
            </div>
            
            {documentsVisible && (
              <>
                <div className="mb-4">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('searchDocuments')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      aria-label={t('searchDocuments')}
                    />
                  </div>
                </div>
                
                {docsLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-4">{searchTerm ? t('noDocumentsFound') : t('noDocumentsYet')}</p>
                    <button
                      onClick={handleUpload}
                      className="bg-blue-100 text-blue-600 px-4 py-2 rounded-md hover:bg-blue-200 flex items-center mx-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('addDocument')}
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredDocuments.map(doc => (
                      <DocumentItem 
                        key={doc._id}
                        document={doc}
                        onComment={() => {
                          setSelectedDocument(doc);
                          setShowCommentModal(true);
                        }}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
      
      {/* Upload Document Modal */}
      {showUploadModal && (
        <UploadDocumentModal 
          siteId={id || ''}
          deploymentId={selectedDeployment?._id}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={(newDoc) => {
            setDocuments([newDoc, ...documents]);
            setShowUploadModal(false);
          }}
        />
      )}
      
      {/* Comment Modal */}
      {showCommentModal && selectedDocument && (
        <CommentModal 
          document={selectedDocument}
          onClose={() => {
            setShowCommentModal(false);
            setSelectedDocument(null);
          }}
          onCommentAdded={(updatedDoc: Document) => {
            // Update the document in the documents array
            setDocuments(
              documents.map(doc => 
                doc._id === updatedDoc._id ? updatedDoc : doc
              )
            );
          }}
        />
      )}
      
      {/* Deployment Creation Modal */}
      {showDeploymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{t('createDeployment')}</h2>
              <button
                onClick={() => setShowDeploymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateDeployment}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="deployment-status">
                  {t('initialStatus')}
                </label>
                <select
                  id="deployment-status"
                  value={newDeployment.status}
                  onChange={(e) => setNewDeployment({...newDeployment, status: e.target.value as WifiDeployment['status']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="planning">{t('planning')}</option>
                  <option value="in_progress">{t('inProgress')}</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="deployment-name">
                  {t('deploymentName')}
                </label>
                <input
                  id="deployment-name"
                  value={newDeployment.name || ''}
                  onChange={(e) => setNewDeployment({...newDeployment, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={t('enterDeploymentName')}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="deployment-notes">
                  {t('deploymentNotes')}
                </label>
                <textarea
                  id="deployment-notes"
                  value={newDeployment.notes || ''}
                  onChange={(e) => setNewDeployment({...newDeployment, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={t('enterDeploymentNotes')}
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeploymentModal(false)}
                  className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                >
                  {t('create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Deployment Modal */}
      {showEditDeploymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{t('editDeployment')}</h2>
              <button
                onClick={() => setShowEditDeploymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateDeployment}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="deployment-name">
                  {t('deploymentName')}
                </label>
                <input
                  id="deployment-name"
                  value={editingDeployment.name || ''}
                  onChange={(e) => setEditingDeployment({...editingDeployment, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={t('enterDeploymentName')}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="deployment-status">
                  {t('status')}
                </label>
                <select
                  id="deployment-status"
                  value={editingDeployment.status}
                  onChange={(e) => setEditingDeployment({...editingDeployment, status: e.target.value as WifiDeployment['status']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="planning">{t('planning')}</option>
                  <option value="in_progress">{t('inProgress')}</option>
                  <option value="completed">{t('completed')}</option>
                  <option value="blocked">{t('blocked')}</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="deployment-notes">
                  {t('deploymentNotes')}
                </label>
                <textarea
                  id="deployment-notes"
                  value={editingDeployment.notes || ''}
                  onChange={(e) => setEditingDeployment({...editingDeployment, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={t('enterDeploymentNotes')}
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditDeploymentModal(false)}
                  className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
                >
                  {t('update')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WifiDeployments; 