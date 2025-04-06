import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Ship,
  MessageSquare,
  Wrench,
  Image,
  UserCog,
  FileText
} from 'lucide-react';
import DashboardHome from '../components/dashboard/DashboardHome';
import ArticleManager from '../components/dashboard/ArticleManager';
import MemberManager from '../components/dashboard/MemberManager';
import FleetManager from '../components/dashboard/FleetManager';
import CommunicationHub from '../components/dashboard/CommunicationHub';
import ToolsManager from '../components/dashboard/ToolsManager';
import VisualSettings from '../components/dashboard/VisualSettings';
import UserManager from '../components/dashboard/UserManager';

function Dashboard() {
  const location = useLocation();
  
  const navigation = [
    { name: 'Vue d\'ensemble', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Verse News', href: '/dashboard/articles', icon: FileText },
    { name: 'Gestion Membres', href: '/dashboard/members', icon: Users },
    { name: 'Gestion Utilisateurs', href: '/dashboard/users', icon: UserCog },
    { name: 'Gestion Flotte', href: '/dashboard/fleet', icon: Ship },
    { name: 'Communication', href: '/dashboard/communication', icon: MessageSquare },
    { name: 'Gestion Outils', href: '/dashboard/tools', icon: Wrench },
    { name: 'Visuels', href: '/dashboard/visuals', icon: Image },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800/80 backdrop-blur-sm border-r border-gray-700">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-100 mb-6">Dashboard Himalia</h2>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-accent' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="articles" element={<ArticleManager />} />
            <Route path="members" element={<MemberManager />} />
            <Route path="users" element={<UserManager />} />
            <Route path="fleet" element={<FleetManager />} />
            <Route path="communication" element={<CommunicationHub />} />
            <Route path="tools" element={<ToolsManager />} />
            <Route path="visuals" element={<VisualSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;