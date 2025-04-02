import React, { useState } from 'react';
import { Upload, Link, Plus, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../contexts/AuthContext';
import { Document } from '../../types/index';

interface UploadDocumentModalProps {
  siteId: string;
  deploymentId?: string;
  onClose: () => void;
  onUploadSuccess: (document: Document) => void;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ siteId, deploymentId, onClose, onUploadSuccess }) => {
  const { t } = useLanguage();
  const [isExternalLink, setIsExternalLink] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'deployment_plan', // Default type
    url: '',
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // If no name is entered yet, use the file name
      if (!formData.name) {
        setFormData({ ...formData, name: selectedFile.name });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    
    // Don't add duplicate tags
    if (!formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
    }
    
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;

      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('type', formData.type);
      formDataObj.append('description', formData.description);
      formDataObj.append('is_external', String(isExternalLink));
      formDataObj.append('module', 'wifi');
      
      if (formData.tags.length > 0) {
        formDataObj.append('tags', JSON.stringify(formData.tags));
      }
      
      if (isExternalLink) {
        formDataObj.append('url', formData.url);
      } else if (!isExternalLink && file) {
        formDataObj.append('file', file);
      }
      
      if (deploymentId) {
        formDataObj.append('deployment_id', deploymentId);
      }

      response = await api.post('/documents/upload', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onUploadSuccess(response.data);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(t('errorUploadingDocument'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {isExternalLink ? t('addExternalLink') : t('uploadDocument')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label={t('close')}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="flex justify-center mb-4">
              <button
                type="button"
                className={`flex-1 py-2 px-4 ${!isExternalLink ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setIsExternalLink(false)}
              >
                <Upload className="inline-block h-4 w-4 mr-1" />
                {t('uploadFile')}
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 ${isExternalLink ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setIsExternalLink(true)}
              >
                <Link className="inline-block h-4 w-4 mr-1" />
                {t('externalLink')}
              </button>
            </div>

            {!isExternalLink && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('selectFile')}
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full py-2 px-3 border border-gray-300 rounded-md"
                />
                {file && (
                  <p className="mt-1 text-sm text-gray-500">
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
            )}

            {isExternalLink && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('url')}
                </label>
                <input
                  type="url"
                  name="url"
                  value={formData.url}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="w-full py-2 px-3 border border-gray-300 rounded-md"
                  required={isExternalLink}
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('name')}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full py-2 px-3 border border-gray-300 rounded-md"
                placeholder={t('documentNamePlaceholder')}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('description')}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full py-2 px-3 border border-gray-300 rounded-md"
                placeholder={t('documentDescriptionPlaceholder')}
                rows={3}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('documentType')}
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full py-2 px-3 border border-gray-300 rounded-md"
                required
              >
                <option value="deployment_plan">{t('deploymentPlan')}</option>
                <option value="site_survey">{t('siteSurvey')}</option>
                <option value="network_diagram">{t('networkDiagram')}</option>
                <option value="technical_specification">{t('technicalSpecification')}</option>
                <option value="other">{t('other')}</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('tags')}
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  className="flex-grow py-2 px-3 border border-gray-300 rounded-l-md"
                  placeholder={t('addTagsPlaceholder')}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-blue-600 text-white py-2 px-3 rounded-r-md hover:bg-blue-700"
                >
                  <Plus size={20} />
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-800 hover:text-blue-900"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
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
              {loading ? t('uploading') : isExternalLink ? t('add') : t('upload')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDocumentModal; 