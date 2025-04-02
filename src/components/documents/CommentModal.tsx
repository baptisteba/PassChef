import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../contexts/AuthContext';
import { Document, Comment } from '../../types';

interface CommentModalProps {
  document: Document;
  onClose: () => void;
  onCommentAdded: (document: Document) => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ document, onClose, onCommentAdded }) => {
  const { t } = useLanguage();
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError(t('commentCannotBeEmpty'));
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post(`/documents/${document._id}/comment`, {
        text: comment
      });
      
      // Server should return the updated document or just the comments
      // Depending on your API design
      if (response.data) {
        // If the API returns the updated document
        onCommentAdded(response.data);
      }
      
      onClose();
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(t('errorAddingComment'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{t('addComment')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label={t('close')}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <h3 className="font-medium text-gray-700">{t('document')}: {document.name}</h3>
          {document.description && (
            <p className="text-sm text-gray-600 mt-1">{document.description}</p>
          )}
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('yourComment')}
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 rounded-md min-h-[100px]"
              placeholder={t('writeCommentPlaceholder')}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-70"
              disabled={loading}
            >
              {loading ? t('posting') : t('post')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommentModal; 