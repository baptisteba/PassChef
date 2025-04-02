import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface WanProviderInputProps {
  selectedProvider: string;
  providers: string[];
  onSelectProvider: (provider: string) => void;
  onAddProvider: (provider: string) => void;
}

const WanProviderInput: React.FC<WanProviderInputProps> = ({
  selectedProvider,
  providers,
  onSelectProvider,
  onAddProvider
}) => {
  const { t } = useLanguage();
  const [newProvider, setNewProvider] = useState('');
  const [isAddingProvider, setIsAddingProvider] = useState(providers.length === 0);

  const handleAddProvider = () => {
    if (newProvider.trim() && !providers.includes(newProvider.trim())) {
      onAddProvider(newProvider.trim());
      setNewProvider('');
      setIsAddingProvider(false);
    }
  };

  // Show the provider input by default if there are no providers
  useEffect(() => {
    if (providers.length === 0) {
      setIsAddingProvider(true);
    }
  }, [providers]);

  // If the selected provider is not in the list, show custom input
  useEffect(() => {
    if (selectedProvider && !providers.includes(selectedProvider) && selectedProvider !== '__custom__') {
      setIsAddingProvider(true);
      setNewProvider(selectedProvider);
    }
  }, [selectedProvider, providers]);

  return (
    <div className="flex flex-col">
      {providers.length > 0 && !isAddingProvider && (
        <div className="flex items-center mb-2">
          <select
            value={selectedProvider}
            onChange={(e) => {
              if (e.target.value === '__custom__') {
                setIsAddingProvider(true);
                setNewProvider('');
              } else {
                onSelectProvider(e.target.value);
              }
            }}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="">{t('selectProvider')}</option>
            {providers.map(provider => (
              <option key={provider} value={provider}>{provider}</option>
            ))}
            <option value="__custom__">{t('addNewProvider')}</option>
          </select>
        </div>
      )}
      
      {(isAddingProvider || providers.length === 0) && (
        <div className="flex flex-col">
          <div className="flex items-center">
            <input
              id="new-provider-input"
              type="text"
              placeholder={t('enterProviderName')}
              value={newProvider}
              onChange={(e) => setNewProvider(e.target.value)}
              className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <button
              type="button"
              onClick={handleAddProvider}
              disabled={!newProvider.trim()}
              className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-r disabled:opacity-50"
              title={t('addProvider')}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          {providers.length > 0 && (
            <button
              type="button"
              onClick={() => setIsAddingProvider(false)}
              className="text-sm text-blue-600 hover:underline mt-2 self-start"
            >
              {t('selectExistingProvider')}
            </button>
          )}
          
          {newProvider.trim() && providers.includes(newProvider.trim()) && (
            <p className="text-red-500 text-xs mt-1">{t('providerAlreadyExists')}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default WanProviderInput; 