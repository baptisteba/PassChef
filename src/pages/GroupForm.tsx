import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../contexts/AuthContext';
import { Building2, Save, ArrowLeft, Edit, Eye, Plus, Activity } from 'lucide-react';

interface GroupFormData {
  name: string;
  primary_contact: {
    name: string;
    email: string;
    phone: string;
  };
  notes: string;
  [key: string]: any; // Add index signature to allow dynamic property access
}

interface Site {
  _id: string;
  name: string;
  group_id: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  created_at: string;
}

const GroupForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = window.location.pathname.includes('/edit');
  const isViewMode = id && !isEditMode && !window.location.pathname.includes('/new');
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    primary_contact: {
      name: '',
      email: '',
      phone: ''
    },
    notes: ''
  });
  
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [loadingSites, setLoadingSites] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // If we're viewing or editing a group, fetch the group data
    if (id) {
      const fetchGroup = async () => {
        try {
          const response = await api.get(`/groups/${id}`);
          setFormData({
            name: response.data.name || '',
            primary_contact: {
              name: response.data.primary_contact?.name || '',
              email: response.data.primary_contact?.email || '',
              phone: response.data.primary_contact?.phone || ''
            },
            notes: response.data.notes || ''
          });
          setError('');
        } catch (err) {
          console.error('Error fetching group:', err);
          setError('Failed to load group details');
        } finally {
          setLoading(false);
        }
      };

      fetchGroup();
      
      // If we're in view mode, also fetch sites for this group
      if (isViewMode) {
        fetchSites();
      }
    }
  }, [id, isViewMode]);
  
  const fetchSites = async () => {
    if (!id) return;
    
    try {
      setLoadingSites(true);
      const response = await api.get(`/sites?group_id=${id}`);
      setSites(response.data);
    } catch (err) {
      console.error('Error fetching sites:', err);
      // We don't show error for sites as it's secondary content
    } finally {
      setLoadingSites(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested objects (primary_contact.name, etc.)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (isEditMode && id) {
        // Update existing group
        await api.put(`/groups/${id}`, formData);
        setSuccess(t('groupUpdated'));
        
        // Stay on the same page, but switch to view mode after a delay
        setTimeout(() => {
          navigate(`/groups/${id}`);
        }, 1500);
      } else {
        // Create new group
        const response = await api.post('/groups', formData);
        setSuccess(t('groupCreated'));
        
        // Navigate to the new group view
        setTimeout(() => {
          navigate(`/groups/${response.data._id}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving group:', err);
      setError('Failed to save group');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[rgb(22,34,114)]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate('/groups')}
          className="mr-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">
          {isEditMode ? t('editGroup') : isViewMode ? formData.name : t('createGroup')}
        </h1>
        
        {isViewMode && (
          <button
            onClick={() => navigate(`/groups/${id}/edit`)}
            className="ml-auto flex items-center bg-[rgb(22,34,114)] text-white px-3 py-1 rounded-md hover:bg-[rgb(32,44,124)]"
          >
            <Edit size={16} className="mr-1" />
            {t('edit')}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {!isViewMode ? (
        // Edit/Create Form
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-full bg-blue-100 mr-3">
                  <Building2 className="h-6 w-6 text-blue-500" />
                </div>
                <h2 className="text-xl font-semibold">{t('groupInformation')}</h2>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  {t('groupName')} *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">{t('primaryContact')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="primary_contact.name">
                    {t('contactName')}
                  </label>
                  <input
                    id="primary_contact.name"
                    name="primary_contact.name"
                    type="text"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                    value={formData.primary_contact.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="primary_contact.email">
                    {t('contactEmail')}
                  </label>
                  <input
                    id="primary_contact.email"
                    name="primary_contact.email"
                    type="email"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                    value={formData.primary_contact.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="primary_contact.phone">
                    {t('contactPhone')}
                  </label>
                  <input
                    id="primary_contact.phone"
                    name="primary_contact.phone"
                    type="tel"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                    value={formData.primary_contact.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                {t('notes')}
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                value={formData.notes}
                onChange={handleInputChange}
              ></textarea>
            </div>
            
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => navigate('/groups')}
                className="mr-4 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-[rgb(22,34,114)] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[rgb(32,44,124)] disabled:opacity-75"
              >
                <Save size={18} />
                {saving ? t('saving') : t('save')}
              </button>
            </div>
          </form>
        </div>
      ) : (
        // View Mode
        <div>
          {/* Group Details Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-full bg-blue-100 mr-3">
                <Building2 className="h-6 w-6 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold">{t('groupInformation')}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <h3 className="text-sm text-gray-500 uppercase tracking-wider">{t('primaryContact')}</h3>
                  {formData.primary_contact && (formData.primary_contact.name || formData.primary_contact.email || formData.primary_contact.phone) ? (
                    <div className="mt-2">
                      {formData.primary_contact.name && (
                        <p className="text-gray-900">{formData.primary_contact.name}</p>
                      )}
                      {formData.primary_contact.email && (
                        <p className="text-gray-600">
                          <a href={`mailto:${formData.primary_contact.email}`} className="hover:underline">
                            {formData.primary_contact.email}
                          </a>
                        </p>
                      )}
                      {formData.primary_contact.phone && (
                        <p className="text-gray-600">
                          <a href={`tel:${formData.primary_contact.phone}`} className="hover:underline">
                            {formData.primary_contact.phone}
                          </a>
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-gray-500 italic">{t('noContactInformation')}</p>
                  )}
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <h3 className="text-sm text-gray-500 uppercase tracking-wider">{t('notes')}</h3>
                  {formData.notes ? (
                    <p className="mt-2 text-gray-900 whitespace-pre-line">{formData.notes}</p>
                  ) : (
                    <p className="mt-2 text-gray-500 italic">-</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Sites List */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">{t('sites')}</h2>
              <button
                onClick={() => navigate(`/sites/new?group=${id}`)}
                className="bg-[rgb(22,34,114)] text-white px-3 py-1 rounded-md flex items-center hover:bg-[rgb(32,44,124)]"
              >
                <Plus size={16} className="mr-1" />
                {t('addSite')}
              </button>
            </div>
            
            {loadingSites ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[rgb(22,34,114)]"></div>
              </div>
            ) : sites.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>{t('noSites')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('name')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('location')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('createdAt')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sites.map((site) => (
                      <tr key={site._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                              <Activity className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{site.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {site.address ? (
                            <div className="text-sm text-gray-900">
                              {site.address.city}, {site.address.country}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(site.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigate(`/sites/${site._id}`)}
                              className="text-blue-600 hover:text-blue-900"
                              title={t('view')}
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => navigate(`/sites/${site._id}/edit`)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title={t('edit')}
                            >
                              <Edit size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupForm; 