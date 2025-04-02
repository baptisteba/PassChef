import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../contexts/AuthContext';
import { Building2, Wifi, Network, FileSpreadsheet, Activity } from 'lucide-react';

// Sample dashboard statistics interface
interface DashboardStats {
  totalGroups: number;
  totalSites: number;
  recentDocuments: number;
  activeWanConnections: number;
}

const Dashboard: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalGroups: 0,
    totalSites: 0,
    recentDocuments: 0,
    activeWanConnections: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard statistics
    const fetchStats = async () => {
      try {
        // For now, we'll use placeholder data
        // In a real implementation, we would fetch from the API
        setStats({
          totalGroups: 5,
          totalSites: 12,
          recentDocuments: 8,
          activeWanConnections: 10
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Stat cards for the dashboard
  const StatCard = ({ title, value, icon, color, onClick }: { 
    title: string, 
    value: number, 
    icon: React.ReactNode,
    color: string,
    onClick?: () => void
  }) => (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 flex items-center ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      onClick={onClick}
    >
      <div className={`p-3 rounded-full mr-4 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[rgb(22,34,114)]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t('dashboard')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title={t('groups')} 
          value={stats.totalGroups} 
          icon={<Building2 className="h-6 w-6 text-white" />} 
          color="bg-blue-500"
          onClick={() => navigate('/groups')}
        />
        <StatCard 
          title={t('sites')} 
          value={stats.totalSites} 
          icon={<Activity className="h-6 w-6 text-white" />} 
          color="bg-green-500"
          onClick={() => navigate('/sites')}
        />
        <StatCard 
          title={t('documents')} 
          value={stats.recentDocuments} 
          icon={<FileSpreadsheet className="h-6 w-6 text-white" />} 
          color="bg-yellow-500"
        />
        <StatCard 
          title={t('wanDeployments')} 
          value={stats.activeWanConnections} 
          icon={<Network className="h-6 w-6 text-white" />} 
          color="bg-purple-500"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">{t('recentActivity')}</h2>
          <p className="text-gray-500">{t('noRecentActivity')}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">{t('quickActions')}</h2>
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/groups/new')} 
              className="w-full text-left px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center"
            >
              <Building2 className="h-5 w-5 mr-2 text-blue-500" />
              {t('addGroup')}
            </button>
            <button 
              onClick={() => navigate('/sites/new')} 
              className="w-full text-left px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center"
            >
              <Activity className="h-5 w-5 mr-2 text-green-500" />
              {t('addSite')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;