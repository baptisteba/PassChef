import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth, api } from '../contexts/AuthContext';
import { 
  User, 
  Settings as SettingsIcon, 
  Shield, 
  Lock,
  Globe,
  AlertTriangle,
  Trash2,
  Save,
  CheckCircle
} from 'lucide-react';

const Settings: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const ADMIN_EMAIL = 'baptiste.debut@passman.fr';
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  // Admin functionality state
  const [confirmText, setConfirmText] = useState('');
  const [adminMessage, setAdminMessage] = useState('');
  const [adminActionInProgress, setAdminActionInProgress] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwordsDontMatch'));
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError(t('passwordTooShort'));
      return;
    }
    
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      setPasswordSuccess(t('passwordChangedSuccess'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError(t('errorChangingPassword'));
    }
  };

  const handleDatabaseReset = async () => {
    if (confirmText !== 'RESET DATABASE') {
      setAdminMessage(t('incorrectConfirmationText'));
      return;
    }
    
    setAdminActionInProgress(true);
    setAdminMessage('');
    
    try {
      await api.post('/admin/reset-database');
      setAdminMessage(t('databaseResetSuccess'));
      setConfirmText('');
    } catch (error) {
      console.error('Error resetting database:', error);
      setAdminMessage(t('databaseResetError'));
    } finally {
      setAdminActionInProgress(false);
    }
  };
  
  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <SettingsIcon className="h-6 w-6 text-indigo-600 mr-2" />
        <h1 className="text-2xl font-bold text-gray-800">{t('settings')}</h1>
      </div>
      
      {/* User settings section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          <User className="h-5 w-5 text-indigo-600 mr-2" />
          <h2 className="text-xl font-semibold">{t('userSettings')}</h2>
        </div>
        
        {/* Language preference */}
        <div className="mb-6">
          <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            {t('languagePreference')}
          </h3>
          <div className="flex space-x-4">
            <button
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-md ${
                language === 'en' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('fr')}
              className={`px-4 py-2 rounded-md ${
                language === 'fr' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Français
            </button>
          </div>
        </div>
        
        {/* Password change */}
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            {t('changePassword')}
          </h3>
          <form onSubmit={handlePasswordChange} className="max-w-md">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('currentPassword')}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('newPassword')}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('confirmPassword')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {passwordError && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {passwordError}
              </div>
            )}
            
            {passwordSuccess && (
              <div className="mb-4 p-2 bg-green-100 text-green-700 rounded-md text-sm flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                {passwordSuccess}
              </div>
            )}
            
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Save className="h-4 w-4 mr-1" />
              {t('saveChanges')}
            </button>
          </form>
        </div>
      </div>
      
      {/* Admin settings section */}
      {user && user.email === ADMIN_EMAIL && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-red-600 mr-2" />
            <h2 className="text-xl font-semibold">{t('adminSettings')}</h2>
          </div>
          
          <div className="bg-red-50 p-4 rounded-md mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
              <div>
                <h4 className="text-lg font-medium text-red-800">{t('dangerZone')}</h4>
                <p className="text-red-700 mt-1">{t('dangerZoneWarning')}</p>
              </div>
            </div>
          </div>
          
          <div className="border border-red-300 rounded-md p-4">
            <h3 className="text-md font-medium text-gray-700 mb-2 flex items-center">
              <Trash2 className="h-4 w-4 text-red-600 mr-2" />
              {t('resetDatabase')}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{t('resetDatabaseDescription')}</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('typeToConfirm')}
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500"
                placeholder="RESET DATABASE"
              />
            </div>
            
            {adminMessage && (
              <div className={`mb-4 p-2 rounded-md text-sm flex items-center ${
                adminMessage === t('databaseResetSuccess') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {adminMessage === t('databaseResetSuccess') 
                  ? <CheckCircle className="h-4 w-4 mr-1" /> 
                  : <AlertTriangle className="h-4 w-4 mr-1" />
                }
                {adminMessage}
              </div>
            )}
            
            <button
              onClick={handleDatabaseReset}
              disabled={confirmText !== 'RESET DATABASE' || adminActionInProgress}
              className={`
                inline-flex items-center px-4 py-2 rounded-md 
                ${confirmText === 'RESET DATABASE' 
                  ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
                focus:outline-none focus:ring-2 focus:ring-offset-2
              `}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {adminActionInProgress ? t('processing') : t('resetDatabase')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;