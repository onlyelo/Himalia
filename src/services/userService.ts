import { db, auth } from '../config/firebase';
import { 
  collection,
  doc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'member' | 'admin';
  joinDate: string;
  linkedMemberId: string | null;
}

const USERS_COLLECTION = 'users';
const PROTECTED_USER_EMAIL = 'yelo@himalia.com';

export const userService = {
  async getUsers(): Promise<User[]> {
    try {
      const q = query(
        collection(db, USERS_COLLECTION),
        orderBy('joinDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as User));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Impossible de récupérer les utilisateurs');
    }
  },

  async deleteUser(uid: string): Promise<void> {
    try {
      // Vérifier si c'est l'utilisateur protégé
      const userDoc = await getDocs(
        query(
          collection(db, USERS_COLLECTION),
          where('email', '==', PROTECTED_USER_EMAIL)
        )
      );

      if (!userDoc.empty && userDoc.docs[0].id === uid) {
        throw new Error('Ce compte ne peut pas être supprimé');
      }

      // Supprimer le document utilisateur de Firestore
      await deleteDoc(doc(db, USERS_COLLECTION, uid));

      // Supprimer l'utilisateur de Firebase Auth si c'est l'utilisateur courant
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === uid) {
        await deleteUser(currentUser);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error instanceof Error ? error : new Error('Impossible de supprimer l\'utilisateur');
    }
  },

  async getUsersByRole(role: 'member' | 'admin'): Promise<User[]> {
    try {
      const q = query(
        collection(db, USERS_COLLECTION),
        where('role', '==', role),
        orderBy('joinDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as User));
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw new Error('Impossible de récupérer les utilisateurs par rôle');
    }
  },

  async getUnlinkedUsers(): Promise<User[]> {
    try {
      const q = query(
        collection(db, USERS_COLLECTION),
        where('linkedMemberId', '==', null),
        orderBy('joinDate', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      } as User));
    } catch (error) {
      console.error('Error fetching unlinked users:', error);
      throw new Error('Impossible de récupérer les utilisateurs non liés');
    }
  }
};