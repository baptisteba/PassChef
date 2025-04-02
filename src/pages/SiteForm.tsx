import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../contexts/AuthContext';

interface SiteFormData {
  name: string;
  group_id: string;
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  onsite_contact: {
    name: string;
    email: string;
    phone: string;
  };
  gps_coordinates: {
    latitude: string;
    longitude: string;
  };
  notes: string;
  [key: string]: any;
}

interface Group {
  _id: string;
  name: string;
}

const initialFormData: SiteFormData = {
  name: '',
  group_id: '',
  address: {
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  },
  onsite_contact: {
    name: '',
    email: '',
    phone: '',
  },
  gps_coordinates: {
    latitude: '',
    longitude: '',
  },
  notes: '',
};

const SiteForm: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<SiteFormData>(initialFormData);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get groupId from URL if present
        const params = new URLSearchParams(window.location.search);
        const groupIdFromUrl = params.get('group');
        
        // Fetch groups
        const groupsResponse = await api.get('/groups');
        setGroups(groupsResponse.data);
        
        // If editing, fetch site details
        if (isEditMode && id) {
          const siteResponse = await api.get(`/sites/${id}`);
          setFormData(siteResponse.data);
        } else if (groupIdFromUrl) {
          // If coming from a group page, use that group's ID
          setFormData(prev => ({
            ...prev,
            group_id: groupIdFromUrl,
          }));
        } else if (groupsResponse.data.length > 0) {
          // Otherwise default to first group if groups exist
          setFormData(prev => ({
            ...prev,
            group_id: groupsResponse.data[0]._id,
          }));
        }
        
        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(isEditMode ? 'Failed to load site details' : 'Failed to load groups');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Get groupId for redirection
      const params = new URLSearchParams(window.location.search);
      const groupIdFromUrl = params.get('group');

      if (isEditMode && id) {
        await api.put(`/sites/${id}`, formData);
        
        // If editing, redirect to the site view
        navigate(`/sites/${id}`);
      } else {
        const response = await api.post('/sites', formData);
        
        // After creation, navigate to the newly created site
        navigate(`/sites/${response.data._id}`);
      }
    } catch (err) {
      console.error('Error saving site:', err);
      setError('Failed to save site');
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
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? t('editSite') : t('addSite')}
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-[rgb(22,34,114)]">
              {t('siteInformation')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('name')} *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('group')} *
                </label>
                <select
                  name="group_id"
                  value={formData.group_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                >
                  <option value="">{t('selectGroup')}</option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-[rgb(22,34,114)]">
              {t('address')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('street')}
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('city')}
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('state')}
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('postalCode')}
                </label>
                <input
                  type="text"
                  name="address.postal_code"
                  value={formData.address.postal_code}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('country')}
                </label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-[rgb(22,34,114)]">
              {t('contactInformation')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('contactName')}
                </label>
                <input
                  type="text"
                  name="onsite_contact.name"
                  value={formData.onsite_contact.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('email')}
                </label>
                <input
                  type="email"
                  name="onsite_contact.email"
                  value={formData.onsite_contact.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  name="onsite_contact.phone"
                  value={formData.onsite_contact.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-[rgb(22,34,114)]">
              {t('gpsCoordinates')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('latitude')}
                </label>
                <input
                  type="text"
                  name="gps_coordinates.latitude"
                  value={formData.gps_coordinates.latitude}
                  onChange={handleChange}
                  placeholder="e.g., 40.7128"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('longitude')}
                </label>
                <input
                  type="text"
                  name="gps_coordinates.longitude"
                  value={formData.gps_coordinates.longitude}
                  onChange={handleChange}
                  placeholder="e.g., -74.0060"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
                />
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-[rgb(22,34,114)]">
              {t('additionalInformation')}
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('notes')}
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
              ></textarea>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                // Get groupId for redirection
                const params = new URLSearchParams(window.location.search);
                const groupIdFromUrl = params.get('group');
                
                if (isEditMode && id) {
                  // If editing, go back to the site details
                  navigate(`/sites/${id}`);
                } else if (groupIdFromUrl) {
                  // If coming from a group, go back to that group
                  navigate(`/groups/${groupIdFromUrl}`);
                } else {
                  // Fallback to groups list
                  navigate('/groups');
                }
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(22,34,114)]"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[rgb(22,34,114)] text-white rounded-md hover:bg-[rgb(32,44,124)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(22,34,114)] disabled:opacity-50"
            >
              {saving ? t('saving') : (isEditMode ? t('updateSite') : t('createSite'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteForm; 