import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import WanProviderInput from './WanProviderInput';

interface WanConnectionModalProps {
  onClose: () => void;
  onAddWanConnection: (wanData: {
    provider: string;
    link_type: string;
    bandwidth: string;
    status: string;
  }) => void;
  initialProviders: string[];
}

const WanConnectionModal: React.FC<WanConnectionModalProps> = ({
  onClose,
  onAddWanConnection,
  initialProviders = []
}) => {
  const { t } = useLanguage();
  const [providers, setProviders] = useState<string[]>(initialProviders);
  
  const [wanForm, setWanForm] = useState({
    provider: '',
    link_type: 'FTTO',
    bandwidth: '',
    status: 'active'
  });

  const handleSelectProvider = (provider: string) => {
    setWanForm(prev => ({ ...prev, provider }));
  };

  const handleAddProvider = (newProvider: string) => {
    setProviders(prev => [...prev, newProvider]);
    setWanForm(prev => ({ ...prev, provider: newProvider }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If provider field is empty but there's text in the new provider input
    // use that as the provider instead
    if (!wanForm.provider && document.getElementById('new-provider-input')) {
      const inputElement = document.getElementById('new-provider-input') as HTMLInputElement;
      if (inputElement && inputElement.value.trim()) {
        const newProviderValue = inputElement.value.trim();
        // First add it to the providers list
        if (!providers.includes(newProviderValue)) {
          setProviders(prev => [...prev, newProviderValue]);
        }
        // Then update the form
        const updatedForm = {
          ...wanForm,
          provider: newProviderValue
        };
        onAddWanConnection(updatedForm);
        return;
      }
    }
    
    onAddWanConnection(wanForm);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{t('addWanConnection')}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label={t('close')}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="provider">
              {t('provider')}
            </label>
            <WanProviderInput
              selectedProvider={wanForm.provider}
              providers={providers}
              onSelectProvider={handleSelectProvider}
              onAddProvider={handleAddProvider}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="linkType">
              {t('linkType')}
            </label>
            <select
              id="linkType"
              value={wanForm.link_type}
              onChange={(e) => setWanForm({...wanForm, link_type: e.target.value})}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="FTTO">FTTO</option>
              <option value="FTTH">FTTH</option>
              <option value="Starlink">Starlink</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bandwidth">
              {t('bandwidth')}
            </label>
            <input
              id="bandwidth"
              type="text"
              placeholder="e.g. 100 Mbps, 1 Gbps"
              value={wanForm.bandwidth}
              onChange={(e) => setWanForm({...wanForm, bandwidth: e.target.value})}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
              {t('linkStatus')}
            </label>
            <select
              id="status"
              value={wanForm.status}
              onChange={(e) => setWanForm({...wanForm, status: e.target.value})}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="ordered">Ordered</option>
              <option value="active">Active</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={!wanForm.provider || !wanForm.bandwidth}
            >
              {t('add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WanConnectionModal; 