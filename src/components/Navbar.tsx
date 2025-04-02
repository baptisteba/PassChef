import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Activity, LogOut, Settings } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const handleLanguageChange = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <Activity className="h-8 w-8 text-[rgb(22,34,114)]" />
              <span className="ml-2 text-xl font-semibold text-[rgb(22,34,114)]">
                Site Manager
              </span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLanguageChange}
                className="px-3 py-1 text-sm font-medium text-gray-700 hover:text-[rgb(22,34,114)]"
              >
                {language === 'en' ? '🇫🇷 FR' : '🇺🇸 EN'}
              </button>

              <Link
                to="/settings"
                className="p-2 text-gray-600 hover:text-[rgb(22,34,114)] transition-colors"
              >
                <Settings className="h-5 w-5" />
              </Link>

              <button
                onClick={signOut}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-[rgb(22,34,114)]"
              >
                <LogOut className="h-5 w-5 mr-1" />
                {t('signOut')}
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;