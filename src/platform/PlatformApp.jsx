import { useCallback, useEffect, useState } from 'react';
import CreateTenantForm from './CreateTenantForm.jsx';
import PlatformLogin from './PlatformLogin.jsx';
import PlatformOverview from './PlatformOverview.jsx';
import PlatformShell from './PlatformShell.jsx';
import PlatformTenantsView from './PlatformTenantsView.jsx';
import { fetchAllTenants, fetchPlatformHealth } from './platformApi.js';
import { isPlatformAuthenticated, logoutPlatform } from './platformAuth.js';

function PlatformDashboard({ onLogout }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [tenants, setTenants] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState(null);

  const loadTenants = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const rows = await fetchAllTenants();
      setTenants(rows);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHealth = useCallback(async () => {
    try {
      const payload = await fetchPlatformHealth();
      setHealth(payload);
    } catch {
      setHealth(null);
    }
  }, []);

  useEffect(() => {
    loadTenants();
    loadHealth();
  }, [loadTenants, loadHealth]);

  const handleTenantCreated = async (tenant) => {
    await loadTenants();
    setActiveSection('tenants');
    if (tenant?.id) {
      setSelectedTenantId(tenant.id);
    }
  };

  const handleTenantUpdated = (tenant) => {
    setTenants((current) => current.map((row) => (row.id === tenant.id ? tenant : row)));
  };

  const openTenant = (tenantId) => {
    setSelectedTenantId(tenantId);
    setActiveSection('tenants');
  };

  return (
    <PlatformShell
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      onLogout={onLogout}
    >
      {activeSection === 'overview' && (
        <PlatformOverview
          tenants={tenants}
          health={health}
          onOpenTenant={openTenant}
          onGoToCreate={() => setActiveSection('create')}
        />
      )}

      {activeSection === 'tenants' && (
        <PlatformTenantsView
          tenants={tenants}
          loading={loading}
          error={error}
          onRefresh={loadTenants}
          selectedTenantId={selectedTenantId}
          onSelectTenant={setSelectedTenantId}
          onUpdated={handleTenantUpdated}
        />
      )}

      {activeSection === 'create' && <CreateTenantForm onCreated={handleTenantCreated} />}
    </PlatformShell>
  );
}

export default function PlatformApp() {
  const [authenticated, setAuthenticated] = useState(() => isPlatformAuthenticated());

  const handleLogout = () => {
    logoutPlatform();
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <PlatformLogin onSuccess={() => setAuthenticated(true)} />;
  }

  return <PlatformDashboard onLogout={handleLogout} />;
}
