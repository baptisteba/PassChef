import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { LayoutDashboard, Users, Building2, Settings } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { t } = useLanguage();

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'dashboard' },
    { to: '/groups', icon: Users, label: 'groups' },
    { to: '/settings', icon: Settings, label: 'settings' },
  ];

  return (
    <aside className="w-64 bg-white shadow-sm min-h-screen">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-[rgb(22,34,114)] text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[rgb(22,34,114)]'
                }`
              }
            >
              <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {t(label)}
            </NavLink>
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;