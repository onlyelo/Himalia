import { db } from '../config/firebase';
import { 
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: string;
  color: 'green' | 'red' | 'blue' | 'yellow' | 'orange' | 'purple';
  recurring: boolean;
  createdBy: string;
  createdAt: Timestamp;
}

const EVENTS_COLLECTION = 'events';

export const planningService = {
  async getEvents(): Promise<Event[]> {
    try {
      const q = query(
        collection(db, EVENTS_COLLECTION),
        orderBy('date', 'asc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Event));
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch events');
    }
  },

  async createEvent(eventData: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
    try {
      // Create a clean event object with all required fields
      const newEvent = {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        type: eventData.type,
        color: eventData.color,
        recurring: eventData.recurring,
        createdBy: eventData.createdBy,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, EVENTS_COLLECTION), newEvent);
      
      return {
        id: docRef.id,
        ...newEvent,
        createdAt: Timestamp.now() // Use local timestamp for immediate UI update
      } as Event;
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create event');
    }
  },

  async updateEvent(id: string, updates: Partial<Event>): Promise<void> {
    try {
      const eventRef = doc(db, EVENTS_COLLECTION, id);
      const cleanUpdates = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      await updateDoc(eventRef, cleanUpdates);
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }
  },

  async deleteEvent(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, EVENTS_COLLECTION, id));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new Error('Failed to delete event');
    }
  }
};