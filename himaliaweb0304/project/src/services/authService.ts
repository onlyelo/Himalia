import { 
  auth, 
  db 
} from '../config/firebase';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseAuthStateChanged,
  User as FirebaseUser,
  deleteUser as firebaseDeleteUser
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  Timestamp,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'member';
  linkedMemberId?: string | null;
  createdAt: Timestamp;
  lastLogin?: Timestamp;
}

export interface LoginActivity {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  timestamp: Timestamp;
}

const PROTECTED_EMAILS = ['lukemury@gmail.com', 'yelo@himalia.com'];

export const authService = {
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return firebaseAuthStateChanged(auth, callback);
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    const user = auth.currentUser;
    if (!user) return null;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) return null;

      return {
        uid: user.uid,
        ...userDoc.data()
      } as UserProfile;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      return querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as UserProfile));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw new Error('Impossible de récupérer la liste des utilisateurs');
    }
  },

  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      // Update last login timestamp
      const userRef = doc(db, 'users', user.uid);
      const timestamp = serverTimestamp();
      
      await updateDoc(userRef, {
        lastLogin: timestamp
      });

      // Log login activity
      await addDoc(collection(db, 'loginActivity'), {
        userId: user.uid,
        userEmail: user.email,
        userName: user.displayName || email,
        timestamp: timestamp
      });
    } catch (error: any) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  async register(email: string, password: string, displayName: string): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      const timestamp = serverTimestamp();

      await setDoc(doc(db, 'users', user.uid), {
        email,
        displayName,
        role: 'member',
        linkedMemberId: null,
        createdAt: timestamp,
        lastLogin: timestamp
      });

      // Log first login activity
      await addDoc(collection(db, 'loginActivity'), {
        userId: user.uid,
        userEmail: email,
        userName: displayName,
        timestamp: timestamp
      });
    } catch (error: any) {
      console.error('Error registering:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      throw new Error('Erreur lors de la déconnexion');
    }
  },

  async updateUserRole(uid: string, role: 'admin' | 'member'): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { role });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error('Impossible de mettre à jour le rôle de l\'utilisateur');
    }
  },

  async deleteUser(uid: string): Promise<void> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) throw new Error('Utilisateur non trouvé');

      const userData = userDoc.data();
      if (PROTECTED_EMAILS.includes(userData.email)) {
        throw new Error('Ce compte ne peut pas être supprimé');
      }

      await deleteDoc(doc(db, 'users', uid));

      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === uid) {
        await firebaseDeleteUser(currentUser);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error instanceof Error ? error : new Error('Impossible de supprimer l\'utilisateur');
    }
  },

  async linkUserToMember(userId: string, memberId: string): Promise<void> {
    try {
      // Check if member is already linked to another user
      const existingUsers = await getDocs(
        query(collection(db, 'users'), where('linkedMemberId', '==', memberId))
      );

      if (!existingUsers.empty) {
        throw new Error('Ce membre est déjà lié à un autre utilisateur');
      }

      // Update user with member link
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { 
        linkedMemberId: memberId,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error linking user to member:', error);
      throw error instanceof Error ? error : new Error('Impossible de lier l\'utilisateur au membre');
    }
  },

  async unlinkUserFromMember(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { 
        linkedMemberId: null,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error unlinking user from member:', error);
      throw error instanceof Error ? error : new Error('Impossible de délier l\'utilisateur du membre');
    }
  },

  async getRecentLoginActivity(limitCount = 3): Promise<LoginActivity[]> {
    try {
      const q = query(
        collection(db, 'loginActivity'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LoginActivity));
    } catch (error) {
      console.error('Error getting login activity:', error);
      return [];
    }
  },

  async getAllLoginActivity(): Promise<LoginActivity[]> {
    try {
      const q = query(
        collection(db, 'loginActivity'),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as LoginActivity));
    } catch (error) {
      console.error('Error getting all login activity:', error);
      return [];
    }
  },

  async getActiveUsersCount(): Promise<number> {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const q = query(
        collection(db, 'users'),
        where('lastLogin', '>=', Timestamp.fromDate(oneWeekAgo))
      );
      
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting active users count:', error);
      return 0;
    }
  }
};