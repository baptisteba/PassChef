import React from 'react';
import { Clock, Plus, FileText, Trash2, MessageSquare } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Activity {
  _id: string;
  document_id: string;
  action: 'created' | 'updated' | 'deleted' | 'commented';
  user: User | string;
  timestamp: string;
  details?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  loading: boolean;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, loading }) => {
  const { t } = useLanguage();

  // Get user's name from activity
  const getUserName = (user: User | string): string => {
    if (typeof user === 'string') {
      return user;
    }
    return user.name;
  };

  // Get action description based on action type
  const getActionText = (action: Activity['action']): string => {
    switch (action) {
      case 'created':
        return t('created');
      case 'updated':
        return t('updated');
      case 'deleted':
        return t('deleted');
      case 'commented':
        return t('commented');
      default:
        return action;
    }
  };

  // Get appropriate icon for activity
  const getActivityIcon = (action: Activity['action']) => {
    switch (action) {
      case 'created':
        return <Plus className="h-4 w-4 text-blue-600" />;
      case 'updated':
        return <FileText className="h-4 w-4 text-orange-600" />;
      case 'deleted':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case 'commented':
        return <MessageSquare className="h-4 w-4 text-green-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Clock className="h-5 w-5 text-gray-600 mr-2" />
        {t('activityFeed')}
      </h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <p>{t('noActivitiesYet')}</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {activities.map(activity => (
            <li key={activity._id} className="flex gap-3">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                {getActivityIcon(activity.action)}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  {activity.details || 
                    `${getUserName(activity.user)} ${getActionText(activity.action)} ${t('aDocument')}`}
                </p>
                <span className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActivityFeed; 