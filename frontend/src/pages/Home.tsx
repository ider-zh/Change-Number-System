import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ApplicationForm } from '../components/ApplicationForm';
import { ApplicationList } from '../components/ApplicationList';

export function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleApplicationSubmitted = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">自动取号系统</h1>
          <nav className="flex gap-3">
            {isAdmin ? (
              <>
                <Link to="/admin/dashboard">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                    管理后台
                  </button>
                </Link>
                <button 
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
                  onClick={() => {
                    localStorage.removeItem('adminToken');
                    localStorage.removeItem('isAdmin');
                    window.location.reload();
                  }}
                >
                  退出管理员
                </button>
              </>
            ) : (
              <Link to="/admin/login">
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600">
                  管理员登录
                </button>
              </Link>
            )}
          </nav>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ApplicationForm onApplicationSubmitted={handleApplicationSubmitted} />
        </div>
        <div className="lg:col-span-2">
          <ApplicationList key={refreshKey} />
        </div>
      </main>
    </div>
  );
}
