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

export interface DayStatus {
  date: string;       // yyyy-MM-dd
  label: string;      // display label (day name or M/d)
  hasWorkout: boolean;
  isToday: boolean;
}

/** Fetch per-day workout status for a date range */
export async function fetchProgressDataRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{ days: DayStatus[]; streak: number }> {
  try {
    const startStr = format(startDate, 'yyyy-MM-dd');
    const endStr = format(endDate, 'yyyy-MM-dd');
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    const completionsRef = collection(db, 'workout_completions');
    const qCompletions = query(
      completionsRef,
      where('userId', '==', userId),
      where('date', '>=', startStr),
      where('date', '<=', endStr)
    );
    const completionsSnap = await getDocs(qCompletions);

    const workoutDates = new Set<string>();
    completionsSnap.docs.forEach(doc => {
      workoutDates.add(doc.data().date);
    });

    const days: DayStatus[] = [];
    let current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = format(current, 'yyyy-MM-dd');
      days.push({
        date: dateStr,
        label: format(current, 'M/d'),
        hasWorkout: workoutDates.has(dateStr),
        isToday: dateStr === todayStr,
      });
      current = new Date(current.getTime() + 86400000);
    }

    // Calculate current streak
    let streak = 0;
    const allCompletionsQuery = query(
      completionsRef,
      where('userId', '==', userId)
    );
    const allSnap = await getDocs(allCompletionsQuery);
    const allDates = new Set<string>();
    allSnap.docs.forEach(doc => allDates.add(doc.data().date));

    let checkDate = new Date();
    if (!allDates.has(format(checkDate, 'yyyy-MM-dd'))) {
      checkDate = subDays(checkDate, 1);
    }
    while (allDates.has(format(checkDate, 'yyyy-MM-dd'))) {
      streak++;
      checkDate = subDays(checkDate, 1);
    }

    return { days, streak };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'workout_completions');
    return { days: [], streak: 0 };
  }
}

export interface CompletedWorkout extends Workout {
  completionDate: string;
  completionId: string;
}

/** Fetch all workouts a user has completed (for history) */
export async function fetchCompletedWorkouts(userId: string): Promise<CompletedWorkout[]> {
  try {
    const completionsRef = collection(db, 'workout_completions');
    const qCompletions = query(completionsRef, where('userId', '==', userId));
    const completionsSnap = await getDocs(qCompletions);

    if (completionsSnap.empty) return [];

    const completions = completionsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as {
      id: string;
      userId: string;
      workoutId: string;
      date: string;
      completedAt: any;
    }[];

    // Fetch unique workout docs
    const uniqueWorkoutIds = [...new Set(completions.map(c => c.workoutId))];
    const workoutDocs = await Promise.all(
      uniqueWorkoutIds.map(async (wId) => {
        const snap = await getDoc(doc(db, 'workouts', wId));
        if (snap.exists()) return { id: snap.id, ...snap.data() } as Workout;
        return null;
      })
    );
    const workoutMap = new Map<string, Workout>();
    workoutDocs.forEach(w => { if (w) workoutMap.set(w.id!, w); });

    // Combine completions with workout data
    const result: CompletedWorkout[] = completions
      .map(c => {
        const workout = workoutMap.get(c.workoutId);
        if (!workout) return null;
        return {
          ...workout,
          completed: true,
          completionDate: c.date,
          completionId: c.id,
        };
      })
      .filter(Boolean) as CompletedWorkout[];

    // Sort by completion date descending
    result.sort((a, b) => b.completionDate.localeCompare(a.completionDate));
    return result;
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

// ─── Custom Workout functions ────────────────────────────────────────────────

export interface CustomWorkout {
  id?: string;
  userId: string;
  title: string;
  description: string;
  videoUrl?: string;
  durationMinutes: number;
  goal: string;
  createdAt: any;
}

/** Create a custom workout */
export async function createCustomWorkout(workout: Omit<CustomWorkout, 'id' | 'createdAt'>): Promise<string> {
  try {
    const ref = await addDoc(collection(db, 'custom_workouts'), {
      ...workout,
      createdAt: Timestamp.now(),
    });
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'custom_workouts');
    throw error;
  }
}

/** Fetch all custom workouts for a user */
export async function fetchCustomWorkouts(userId: string): Promise<CustomWorkout[]> {
  try {
    const q = query(collection(db, 'custom_workouts'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomWorkout));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'custom_workouts');
    return [];
  }
}

/** Update a custom workout */
export async function updateCustomWorkout(workoutId: string, data: Partial<CustomWorkout>): Promise<void> {
  try {
    const ref = doc(db, 'custom_workouts', workoutId);
    await updateDoc(ref, { ...data });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `custom_workouts/${workoutId}`);
    throw error;
  }
}

/** Delete a custom workout */
export async function deleteCustomWorkout(workoutId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'custom_workouts', workoutId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `custom_workouts/${workoutId}`);
    throw error;
  }
}

// ─── Favorite Workout functions ──────────────────────────────────────────────

export interface FavoriteWorkout {
  id?: string;
  userId: string;
  workoutId: string;
  source: 'global' | 'custom';
  createdAt: any;
}

/** Add a workout to favorites */
export async function addFavorite(userId: string, workoutId: string, source: 'global' | 'custom'): Promise<string> {
  try {
    const favoriteId = `${userId}_${workoutId}`;
    const ref = doc(db, 'favorite_workouts', favoriteId);
    await setDoc(ref, {
      userId,
      workoutId,
      source,
      createdAt: Timestamp.now(),
    });
    return favoriteId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'favorite_workouts');
    throw error;
  }
}

/** Remove a workout from favorites */
export async function removeFavorite(userId: string, workoutId: string): Promise<void> {
  try {
    const favoriteId = `${userId}_${workoutId}`;
    await deleteDoc(doc(db, 'favorite_workouts', favoriteId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'favorite_workouts');
    throw error;
  }
}

/** Check if a workout is favorited */
export async function isFavorited(userId: string, workoutId: string): Promise<boolean> {
  try {
    const favoriteId = `${userId}_${workoutId}`;
    const snap = await getDoc(doc(db, 'favorite_workouts', favoriteId));
    return snap.exists();
  } catch (error) {
    return false;
  }
}

/** Fetch all favorite workouts for a user, with full workout data */
export async function fetchFavorites(userId: string): Promise<(Workout | CustomWorkout)[]> {
  try {
    const q = query(collection(db, 'favorite_workouts'), where('userId', '==', userId));
    const snap = await getDocs(q);

    if (snap.empty) return [];

    const favorites = snap.docs.map(d => d.data() as FavoriteWorkout);
    const results: (Workout | CustomWorkout)[] = [];

    for (const fav of favorites) {
      try {
        const collectionName = fav.source === 'custom' ? 'custom_workouts' : 'workouts';
        const workoutSnap = await getDoc(doc(db, collectionName, fav.workoutId));
        if (workoutSnap.exists()) {
          results.push({ id: workoutSnap.id, ...workoutSnap.data() } as Workout | CustomWorkout);
        }
      } catch {
        // Workout may have been deleted, skip
      }
    }

    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'favorite_workouts');
    return [];
  }
}

/** Fetch all global workouts (for browsing/mix-and-match) */
export async function fetchAllGlobalWorkouts(goal?: string): Promise<Workout[]> {
  try {
    const workoutsRef = collection(db, 'workouts');
    const q = query(workoutsRef, where('userId', '==', 'global'));
    const snap = await getDocs(q);

    let workouts = snap.docs.map(d => ({ id: d.id, ...d.data() } as Workout));

    if (goal) {
      const lowerGoal = goal.toLowerCase().trim();
      workouts = workouts.filter(w => w.goal?.toLowerCase().trim() === lowerGoal);
    }

    return workouts;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'workouts');
    return [];
  }
}
