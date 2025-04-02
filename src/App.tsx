import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import GroupForm from './pages/GroupForm';
import Sites from './pages/Sites';
import SiteForm from './pages/SiteForm';
import Settings from './pages/Settings';
import WifiDeployments from './pages/WifiDeployments';
import SiteDetailsWithCustomProviders from './pages/SiteDetailsWithCustomProviders';

// Redirect component to handle /sites/:id to /sites/:id/details
const SiteRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/sites/${id}/details`} replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<Layout />}>
              <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
              <Route path="/groups" element={<PrivateRoute element={<Groups />} />} />
              <Route path="/groups/new" element={<PrivateRoute element={<GroupForm />} />} />
              <Route path="/groups/:id" element={<PrivateRoute element={<GroupForm />} />} />
              <Route path="/groups/:id/edit" element={<PrivateRoute element={<GroupForm />} />} />
              <Route path="/sites" element={<PrivateRoute element={<Sites />} />} />
              <Route path="/sites/new" element={<PrivateRoute element={<SiteForm />} />} />
              <Route path="/sites/:id" element={<PrivateRoute element={<SiteRedirect />} />} />
              <Route path="/sites/:id/wifi" element={<PrivateRoute element={<WifiDeployments />} />} />
              <Route path="/sites/:id/details" element={<PrivateRoute element={<SiteDetailsWithCustomProviders />} />} />
              <Route path="/sites/:id/edit" element={<PrivateRoute element={<SiteForm />} />} />
              <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
            </Route>
          </Routes>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;