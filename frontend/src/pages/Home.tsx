import { useState, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { ApplicationForm } from '../components/ApplicationForm';
import { ApplicationList } from '../components/ApplicationList';

export function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleApplicationSubmitted = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ApplicationForm onApplicationSubmitted={handleApplicationSubmitted} />
        </div>
        <div className="lg:col-span-2">
          <ApplicationList key={refreshKey} />
        </div>
      </div>
    </Layout>
  );
}
