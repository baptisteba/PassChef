import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../contexts/AuthContext';
import { Activity, Plus, Search, Edit, Trash2, Eye, Wifi, Network, Link } from 'lucide-react';

interface Site {
  _id: string;
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
  gps_coordinates?: {
    latitude: string;
    longitude: string;
  };
  created_at: string;
  created_by: string;
  group_name?: string; // This will be populated from a join
}

interface Group {
  _id: string;
  name: string;
}

const Sites: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch groups first
        const groupsResponse = await api.get('/groups');
        setGroups(groupsResponse.data);
        
        // Then fetch sites
        const sitesResponse = await api.get('/sites');
        
        // Combine site data with group names
        const sitesWithGroupNames = sitesResponse.data.map((site: Site) => {
          const group = groupsResponse.data.find((g: Group) => g._id === site.group_id);
          return {
            ...site,
            group_name: group ? group.name : 'Unknown Group'
          };
        });
        
        setSites(sitesWithGroupNames);
        setError('');
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load sites');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredSites = sites.filter(site => {
    // Filter by search term
    const matchesSearch = 
      site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (site.group_name && site.group_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (site.address?.city && site.address.city.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm(t('confirmDeleteSite'))) {
      try {
        await api.delete(`/sites/${id}`);
        setSites(sites.filter(site => site._id !== id));
      } catch (err) {
        console.error('Error deleting site:', err);
        setError('Failed to delete site');
      }
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('sites')}</h1>
        <button
          onClick={() => navigate('/sites/new')}
          className="bg-[rgb(22,34,114)] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[rgb(32,44,124)]"
        >
          <Plus size={18} />
          {t('addSite')}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex mb-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[rgb(22,34,114)] focus:border-[rgb(22,34,114)]"
              placeholder={t('searchSites')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredSites.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            {searchTerm ? t('noSearchResults') : t('noSites')}
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
                    {t('group')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('location')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('deployments')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSites.map((site) => (
                  <tr key={site._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Activity className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{site.name}</div>
                          {site.onsite_contact && (
                            <div className="text-sm text-gray-500">{site.onsite_contact.name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{site.group_name}</div>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-500 hover:text-blue-700"
                          title={t('wifiDeployments')}
                          onClick={() => navigate(`/sites/${site._id}/wifi`)}
                        >
                          <Wifi size={18} />
                        </button>
                        <button 
                          className="text-orange-500 hover:text-orange-700"
                          title={t('siteDetails')}
                          onClick={() => navigate(`/sites/${site._id}/details`)}
                        >
                          <Link size={18} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => navigate(`/sites/${site._id}/details`)}
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
                        <button
                          onClick={() => handleDelete(site._id)}
                          className="text-red-600 hover:text-red-900"
                          title={t('delete')}
                        >
                          <Trash2 size={18} />
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
  );
};

export default Sites;