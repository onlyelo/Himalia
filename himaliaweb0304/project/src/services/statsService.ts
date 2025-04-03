import { db } from '../config/firebase';
import { 
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  orderBy,
  getDoc,
  doc,
  limit
} from 'firebase/firestore';
import { fleetService } from './fleetService';

export interface DashboardStats {
  activeMembers: {
    count: number;
    change: string;
  };
  memberGrowth: {
    percentage: string;
    trend: 'up' | 'down';
  };
  ships: {
    count: number;
    change: string;
  };
}

export const statsService = {
  async getActiveMembers(): Promise<{ count: number; change: string }> {
    try {
      const oneWeekAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      
      // Get users who logged in within the last week
      const q = query(
        collection(db, 'loginActivity'),
        where('timestamp', '>=', oneWeekAgo),
        orderBy('timestamp', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      // Count unique users
      const uniqueUsers = new Set(snapshot.docs.map(doc => doc.data().userId));
      const activeCount = uniqueUsers.size;

      // Get previous week's count
      const twoWeeksAgo = Timestamp.fromDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000));
      const previousWeekQuery = query(
        collection(db, 'loginActivity'),
        where('timestamp', '>=', twoWeeksAgo),
        where('timestamp', '<', oneWeekAgo)
      );
      
      const previousWeekSnapshot = await getDocs(previousWeekQuery);
      const previousUniqueUsers = new Set(previousWeekSnapshot.docs.map(doc => doc.data().userId));
      const previousCount = previousUniqueUsers.size;

      const changePercentage = previousCount === 0 
        ? '+100' 
        : Math.round(((activeCount - previousCount) / previousCount) * 100);

      return {
        count: activeCount,
        change: `${changePercentage > 0 ? '+' : ''}${changePercentage}%`
      };
    } catch (error) {
      console.error('Error getting active members:', error);
      return { count: 0, change: '0%' };
    }
  },

  async getMemberGrowth(): Promise<{ percentage: string; trend: 'up' | 'down' }> {
    try {
      // Get current month's new users
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      currentMonthStart.setHours(0, 0, 0, 0);

      // Get previous month's start
      const previousMonthStart = new Date(currentMonthStart);
      previousMonthStart.setMonth(previousMonthStart.getMonth() - 1);

      // Query for current month's new users
      const currentMonthQuery = query(
        collection(db, 'users'),
        where('createdAt', '>=', Timestamp.fromDate(currentMonthStart)),
        orderBy('createdAt', 'desc')
      );

      // Query for previous month's new users
      const previousMonthQuery = query(
        collection(db, 'users'),
        where('createdAt', '>=', Timestamp.fromDate(previousMonthStart)),
        where('createdAt', '<', Timestamp.fromDate(currentMonthStart)),
        orderBy('createdAt', 'desc')
      );

      // Execute both queries
      const [currentMonthSnapshot, previousMonthSnapshot] = await Promise.all([
        getDocs(currentMonthQuery),
        getDocs(previousMonthQuery)
      ]);

      const currentMonthCount = currentMonthSnapshot.size;
      const previousMonthCount = previousMonthSnapshot.size;

      // Calculate growth percentage
      const growthPercentage = previousMonthCount === 0
        ? currentMonthCount * 100
        : ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100;

      return {
        percentage: `${growthPercentage > 0 ? '+' : ''}${Math.round(growthPercentage)}%`,
        trend: growthPercentage >= 0 ? 'up' : 'down'
      };
    } catch (error) {
      console.error('Error getting member growth:', error);
      return { percentage: '0%', trend: 'up' };
    }
  },

  async getShipsStats(): Promise<{ count: number; change: string }> {
    try {
      const ships = await fleetService.getFleet();
      const operationalShips = ships.filter(ship => ship.status !== 'Détruit').length;

      // Get previous month's count from stats collection
      const statsDoc = await getDoc(doc(db, 'stats', 'fleet'));
      const previousCount = statsDoc.exists() ? statsDoc.data().lastMonthCount || operationalShips : operationalShips;

      const percentageChange = previousCount === 0 
        ? 100 
        : ((operationalShips - previousCount) / previousCount) * 100;

      return {
        count: operationalShips,
        change: `${percentageChange > 0 ? '+' : ''}${Math.round(percentageChange)}%`
      };
    } catch (error) {
      console.error('Error getting ships stats:', error);
      return { count: 0, change: '0%' };
    }
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const [activeMembers, memberGrowth, ships] = await Promise.all([
      this.getActiveMembers(),
      this.getMemberGrowth(),
      this.getShipsStats()
    ]);

    return {
      activeMembers,
      memberGrowth,
      ships
    };
  }
};