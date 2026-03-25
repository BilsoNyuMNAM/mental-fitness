import { db } from '../firebase';
import {
  collection, doc, setDoc, getDocs, getDoc,
  query, where, Timestamp, deleteDoc, updateDoc, addDoc
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';
import { format, subDays, parseISO } from 'date-fns';

export interface Workout {
  id?: string;
  date: string;
  title: string;
  description: string;
  videoUrl?: string;
  durationMinutes: number;
  completed: boolean;
  completedAt?: any;
  goal: string;
  userId: string;
}

/** Fetch workouts for a specific user and date */
export async function fetchTodayWorkouts(userId: string, date: string, goal?: string): Promise<Workout[]> {
  try {
    const workoutsRef = collection(db, 'workouts');
    
    // Fetch global workouts and user-specific workouts
    const qGlobal = query(workoutsRef, where('userId', '==', 'global'));
    const qUser = query(workoutsRef, where('userId', '==', userId), where('date', '==', date));
    
    const [globalSnap, userSnap] = await Promise.all([getDocs(qGlobal), getDocs(qUser)]);
    
    const workoutsMap = new Map<string, Workout>();
    let dbg = `global pool docs: ${globalSnap.docs.length} | `;
    
    globalSnap.docs.forEach(d => {
      const data = d.data();
      dbg += `[${data.goal}], `;
      
      const dbGoal = data.goal?.toLowerCase().trim();
      const userGoal = goal?.toLowerCase().trim();
      if (!userGoal || dbGoal === userGoal) {
        workoutsMap.set(d.id, { id: d.id, ...data } as Workout);
      }
    });
    userSnap.docs.forEach(d => workoutsMap.set(d.id, { id: d.id, ...d.data() } as Workout));
    
    const workouts = Array.from(workoutsMap.values());
    if (workouts.length === 0) return [];

    // Fetch user completions
    const completionsRef = collection(db, 'workout_completions');
    const qCompletions = query(completionsRef, where('userId', '==', userId), where('date', '==', date));
    const completionsSnap = await getDocs(qCompletions);
    
    const completedSet = new Set(completionsSnap.docs.map(d => d.data().workoutId));

    return workouts.map(w => ({
      ...w,
      completed: completedSet.has(w.id!),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'workouts/completions');
    return [];
  }
}

/** Mark a workout as complete */
export async function markWorkoutComplete(workoutId: string, userId: string): Promise<void> {
  try {
    const date = format(new Date(), 'yyyy-MM-dd');

    const completionRef = doc(db, 'workout_completions', `${userId}_${workoutId}_${date}`);
    await setDoc(completionRef, {
      userId,
      workoutId,
      date,
      completedAt: Timestamp.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `workout_completions`);
  }
}

/** Fetch progress data for the last 7 days */
export async function fetchProgressData(userId: string, startDate: string): Promise<{date: string, completed: number}[]> {
  try {
    const completionsRef = collection(db, 'workout_completions');
    const qCompletions = query(completionsRef, where('userId', '==', userId), where('date', '>=', startDate));
    const completionsSnap = await getDocs(qCompletions);
    
    const completedCountByDate: Record<string, number> = {};
    completionsSnap.docs.forEach(doc => {
      const data = doc.data();
      completedCountByDate[data.date] = (completedCountByDate[data.date] || 0) + 1;
    });

    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const completedCount = completedCountByDate[d] || 0;
      chartData.push({ date: format(parseISO(d), 'MMM d'), completed: completedCount });
    }
    return chartData;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'workout_completions');
    return [];
  }
}

// ─── Admin-only functions ────────────────────────────────────────────────────

/** Create a new workout (admin only) */
export async function createWorkout(workout: Omit<Workout, 'id'>): Promise<string> {
  try {
    const ref = await addDoc(collection(db, 'workouts'), {
      ...workout,
      completed: false,
    });
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'workouts');
    throw error;
  }
}

/** Update an existing workout (admin only) */
export async function updateWorkout(workoutId: string, data: Partial<Workout>): Promise<void> {
  try {
    const workoutRef = doc(db, 'workouts', workoutId);
    await updateDoc(workoutRef, { ...data });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `workouts/${workoutId}`);
    throw error;
  }
}

/** Delete a workout (admin only) */
export async function deleteWorkout(workoutId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'workouts', workoutId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `workouts/${workoutId}`);
    throw error;
  }
}

/** Fetch all workouts (admin only) */
export async function fetchAllWorkouts(): Promise<Workout[]> {
  try {
    const snapshot = await getDocs(collection(db, 'workouts'));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Workout));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'workouts');
    return [];
  }
}
