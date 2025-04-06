import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Organization from './pages/Organization';
import Tools from './pages/Tools';
import Knowledge from './pages/Knowledge';
import Blog from './pages/Blog';
import FleetManager from './pages/FleetManager';
import Planning from './pages/Planning';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';
import { getVisuals } from './config/visuals';
import { authService, type UserProfile } from './services/authService';

function App() {
  const [visuals, setVisuals] = useState(getVisuals());
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleVisualsUpdate = () => {
      setVisuals(getVisuals());
    };

    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      if (user) {
        const profile = await authService.getCurrentUser();
        setCurrentUser(profile);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    window.addEventListener('visualsUpdated', handleVisualsUpdate);
    return () => {
      window.removeEventListener('visualsUpdated', handleVisualsUpdate);
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-white">
        <div 
          className="fixed inset-0 bg-cover bg-center opacity-20 pointer-events-none transition-opacity duration-500"
          style={{ backgroundImage: `url(${visuals.homeHero})` }}
        />
        <div className="relative z-10">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/*"
              element={
                <>
                  <Navbar />
                  <main>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/organization" element={<Organization />} />
                      <Route path="/tools" element={<Tools />} />
                      <Route path="/knowledge" element={<Knowledge />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route 
                        path="/fleet-manager" 
                        element={
                          <ProtectedRoute requiresLink>
                            <FleetManager />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/planning" 
                        element={
                          <ProtectedRoute requiresLink>
                            <Planning />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/dashboard/*" 
                        element={
                          currentUser?.role === 'admin' ? (
                            <Dashboard />
                          ) : (
                            <Navigate 
                              to="/" 
                              replace 
                              state={{ error: "Accès non autorisé. Seuls les administrateurs peuvent accéder au dashboard." }} 
                            />
                          )
                        } 
                      />
                    </Routes>
                  </main>
                </>
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;