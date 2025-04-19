import React, { useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { useDashboardStore } from '../store/dashboard';
import NavBar from '../components/NavBar';
import DashboardStats from '../components/DashboardStats';
import { Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { stats, loading, error, fetchStats } = useDashboardStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.email}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Here's an overview of your projects and progress
              </p>
            </div>

            {error ? (
              <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
                {error}
              </div>
            ) : (
              <DashboardStats {...stats} />
            )}

            {/* Recent Activity section will be added here */}
          </div>
        </div>
      </main>
    </>
  );
}