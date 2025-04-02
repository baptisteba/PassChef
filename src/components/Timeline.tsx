import React, { useState } from 'react';
import { 
  Clock, 
  MessageSquare, 
  Plus, 
  Info, 
  AlertTriangle, 
  AlertCircle,
  X
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export interface TimelineComment {
  _id: string;
  text: string;
  importance: 'info' | 'warning' | 'critical';
  user: string;
  timestamp: string;
  deployment_id: string;
}

type ImportanceType = 'info' | 'warning' | 'critical';

interface TimelineProps {
  comments: TimelineComment[];
  deploymentId: string;
  onAddComment: (comment: Omit<TimelineComment, '_id' | 'timestamp'>) => Promise<void>;
}

const Timeline: React.FC<TimelineProps> = ({ comments, deploymentId, onAddComment }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newComment, setNewComment] = useState<Omit<TimelineComment, '_id' | 'timestamp'>>({
    text: '',
    importance: 'info',
    user: user?.name || user?.email || '',
    deployment_id: deploymentId
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.text.trim()) return;
    
    await onAddComment(newComment);
    setNewComment({
      text: '',
      importance: 'info',
      user: user?.name || user?.email || '',
      deployment_id: deploymentId
    });
    setShowAddForm(false);
  };

  const handleImportanceChange = (importance: ImportanceType) => {
    setNewComment({ ...newComment, importance });
  };

  const getImportanceClass = (importance: string): string => {
    switch (importance) {
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'info':
        return <Info className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Sort comments by timestamp (newest first)
  const sortedComments = [...comments].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Clock className="h-5 w-5 mr-2 text-indigo-600" />
          {t('timeline')}
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 flex items-center text-sm"
        >
          {showAddForm ? (
            <>
              <X className="h-4 w-4 mr-1" />
              {t('cancel')}
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              {t('addComment')}
            </>
          )}
        </button>
      </div>
      
      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-6 bg-gray-50 p-4 rounded-md">
          <div className="mb-4">
            <label htmlFor="comment-text" className="block text-sm font-medium text-gray-700 mb-1">
              {t('comment')}
            </label>
            <textarea
              id="comment-text"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={newComment.text}
              onChange={(e) => setNewComment({ ...newComment, text: e.target.value })}
              placeholder={t('enterYourComment')}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('importance')}
            </label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="importance"
                  checked={newComment.importance === 'info'}
                  onChange={() => handleImportanceChange('info')}
                  className="form-radio h-4 w-4 text-blue-600"
                />
                <span className="ml-2 flex items-center text-sm">
                  <Info className="h-4 w-4 text-blue-600 mr-1" />
                  {t('info')}
                </span>
              </label>
              
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="importance"
                  checked={newComment.importance === 'warning'}
                  onChange={() => handleImportanceChange('warning')}
                  className="form-radio h-4 w-4 text-yellow-600"
                />
                <span className="ml-2 flex items-center text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />
                  {t('warning')}
                </span>
              </label>
              
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="importance"
                  checked={newComment.importance === 'critical'}
                  onChange={() => handleImportanceChange('critical')}
                  className="form-radio h-4 w-4 text-red-600"
                />
                <span className="ml-2 flex items-center text-sm">
                  <AlertCircle className="h-4 w-4 text-red-600 mr-1" />
                  {t('critical')}
                </span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
            >
              {t('post')}
            </button>
          </div>
        </form>
      )}
      
      {sortedComments.length === 0 ? (
        <div className="p-6 text-center border-2 border-dashed border-gray-300 rounded-md">
          <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">{t('noCommentsYet')}</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-2 text-indigo-600 hover:text-indigo-800"
          >
            {t('addFirstComment')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedComments.map((comment) => (
            <div key={comment._id} className="border-l-4 pl-4 py-2 relative">
              <div className={`absolute w-5 h-5 rounded-full flex items-center justify-center -left-2.5 top-4 ${getImportanceClass(comment.importance)}`}>
                {getImportanceIcon(comment.importance)}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="font-medium text-gray-800">{comment.user}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {formatDate(comment.timestamp)}
                  </span>
                </div>
                <p className="text-gray-700 mt-1">{comment.text}</p>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getImportanceClass(comment.importance)}`}>
                    {getImportanceIcon(comment.importance)}
                    <span className="ml-1">{t(comment.importance)}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Timeline; 