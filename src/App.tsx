import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth';
import { Loader2 } from 'lucide-react';

// Lazy load components
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Projects = React.lazy(() => import('./pages/Projects'));
const Scenes = React.lazy(() => import('./pages/Scenes'));
const ShotsPage = React.lazy(() => import('./pages/ShotsPage'));
const Shots = React.lazy(() => import('./pages/Shots'));
const Script = React.lazy(() => import('./pages/Script'));
const MindMap = React.lazy(() => import('./pages/MindMap'));
const Auth = React.lazy(() => import('./pages/Auth'));

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-gray-600" />
  </div>
);

function App() {
  const { initialize, loading, user } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <React.Suspense fallback={<LoadingSpinner />}>
        <Routes>
          {user ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:projectId/scenes" element={<Scenes />} />
              <Route path="/projects/:projectId/script" element={<Script />} />
              <Route path="/projects/:projectId/mindmap" element={<MindMap />} />
              <Route path="/scenes/:sceneId/shots" element={<ShotsPage />} />
              <Route path="/shots" element={<Shots />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/auth" element={<Auth />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </>
          )}
        </Routes>
      </React.Suspense>
    </Router>
  );
}

export default App