import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Ship, FileText, Activity } from 'lucide-react';
import { statsService, type DashboardStats } from '../../services/statsService';
import { authService, type LoginActivity } from '../../services/authService';
import LoginActivityLog from './LoginActivityLog';

function DashboardHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<LoginActivity[]>([]);
  const [allActivity, setAllActivity] = useState<LoginActivity[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, recentLogins, allLogins] = await Promise.all([
        statsService.getDashboardStats(),
        authService.getRecentLoginActivity(),
        authService.getAllLoginActivity()
      ]);
      
      setStats(dashboardStats);
      setRecentActivity(recentLogins);
      setAllActivity(allLogins);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-himalia"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Membres Actifs',
      value: stats?.activeMembers.count || 0,
      change: stats?.activeMembers.change || '0%',
      icon: Users,
      color: 'text-blue-500'
    },
    {
      name: 'Croissance Membres',
      value: stats?.memberGrowth.percentage || '0%',
      trend: stats?.memberGrowth.trend || 'up',
      icon: Activity,
      color: 'text-green-500'
    },
    {
      name: 'Vaisseaux',
      value: stats?.ships.count || 0,
      change: stats?.ships.change || '0%',
      icon: Ship,
      color: 'text-himalia'
    },
    {
      name: 'Articles Blog',
      value: '28',
      change: '+5%',
      icon: FileText,
      color: 'text-purple-500'
    }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Vue d'ensemble</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-gray-700"
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
              <span className={`text-sm ${
                (stat.change?.startsWith('+') || stat.trend === 'up') ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.change || (stat.trend === 'up' ? '↑' : '↓')}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-100 mb-1">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </div>
            <div className="text-sm text-gray-400">{stat.name}</div>
          </motion.div>
        ))}
      </div>

      {/* Activité Récente */}
      <LoginActivityLog 
        recentActivity={recentActivity}
        allActivity={allActivity}
      />
    </div>
  );
}

export default DashboardHome;