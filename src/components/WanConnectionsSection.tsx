import React, { useState } from 'react';
import { Network, Plus, Trash } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { WANDeployment } from '../types';
import WanConnectionModal from './WanConnectionModal';

interface WanConnectionsSectionProps {
  siteId: string;
  connections: WANDeployment[];
  onAddConnection: (connection: WANDeployment) => void;
  onDeleteConnection: (connectionId: string) => void;
}

const WanConnectionsSection: React.FC<WanConnectionsSectionProps> = ({
  siteId,
  connections,
  onAddConnection,
  onDeleteConnection
}) => {
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const [providers, setProviders] = useState<string[]>([]);

  const handleAddWanConnection = async (wanData: {
    provider: string;
    link_type: string;
    bandwidth: string;
    status: string;
  }) => {
    try {
      // Add site_id to create a proper WANDeployment
      const connection = {
        ...wanData,
        id: Date.now().toString(), // Temporary ID, will be replaced by API
        site_id: siteId,
        created_at: new Date().toISOString(),
        created_by: 'current_user' // This would come from auth context in a real app
      } as WANDeployment;
      
      onAddConnection(connection);
      setShowAddModal(false);
      
      // Update providers list if it's a new provider
      if (!providers.includes(wanData.provider)) {
        setProviders(prev => [...prev, wanData.provider]);
      }
    } catch (err) {
      console.error('Error adding WAN connection:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Network className="h-5 w-5 text-green-600 mr-2" />
          <h2 className="text-xl font-semibold">{t('wanConnections')}</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-1" />
          {t('addWanConnection')}
        </button>
      </div>
      
      <p className="text-gray-600 mb-4">{t('wanConnectionsDescription')}</p>
      
      {connections.length === 0 ? (
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
              {connections.map(wan => (
                <tr key={wan.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-6 text-left">{wan.provider}</td>
                  <td className="py-3 px-6 text-left">{wan.link_type}</td>
                  <td className="py-3 px-6 text-left">{wan.bandwidth}</td>
                  <td className="py-3 px-6 text-left">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      wan.status === 'active' ? 'bg-green-200 text-green-800' :
                      wan.status === 'ordered' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {wan.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center">
                      <button
                        onClick={() => onDeleteConnection(wan.id)}
                        className="transform hover:text-red-500 hover:scale-110 ml-3"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {showAddModal && (
        <WanConnectionModal
          onClose={() => setShowAddModal(false)}
          onAddWanConnection={handleAddWanConnection}
          initialProviders={providers}
        />
      )}
    </div>
  );
};

export default WanConnectionsSection; 