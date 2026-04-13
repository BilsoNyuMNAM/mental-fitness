import { db } from '../firebase';
import {
  collection, doc, setDoc, getDocs, getDoc, updateDoc,
  query, where, Timestamp, addDoc, deleteDoc,
} from 'firebase/firestore';
import { format, subDays, differenceInDays, parseISO } from 'date-fns';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Challenge {
  id?: string;
  title: string;
  description: string;
  /** 'streak' = workout every day for N days, 'total' = N workouts in M days, 'weekend' = workout on N weekends */
  type: 'streak' | 'total' | 'weekend';
  /** Target count (days of streak, total workouts, or number of weekends) */
  target: number;
  /** Duration in days (how long user has to complete it) */
  durationDays: number;
  /** Badge ID awarded on completion */
  badgeId: string;
  badgeName: string;
  badgeTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  /** 'system' for built-in, 'admin' for admin-created */
  source: 'system' | 'admin';
  /** Is the challenge currently active/visible */
  active: boolean;
  createdAt: any;
}

export interface ChallengeParticipant {
  id?: string;
  userId: string;
  challengeId: string;
  joinedAt: any;
  /** ISO date string of when user joined */
  startDate: string;
  /** ISO date string of deadline */
  endDate: string;
  /** Current progress count */
  progress: number;
  /** Whether challenge is completed */
  completed: boolean;
  completedAt?: any;
}

// ─── Built-in challenges (seeded if not in Firestore) ────────────────────────

export const BUILT_IN_CHALLENGES: Omit<Challenge, 'id' | 'createdAt'>[] = [
  {
    title: '7-Day Kickstart',
    description: 'Complete a workout every day for 7 consecutive days. Build the habit!',
    type: 'streak',
    target: 7,
    durationDays: 7,
    badgeId: 'challenge_7day_kickstart',
    badgeName: '7-Day Kickstart',
    badgeTier: 'silver',
    source: 'system',
    active: true,
  },
  {
    title: 'Weekend Warrior',
    description: 'Complete workouts on 4 consecutive weekends (Sat or Sun counts).',
    type: 'weekend',
    target: 4,
    durationDays: 28,
    badgeId: 'challenge_weekend_warrior',
    badgeName: 'Weekend Warrior',
    badgeTier: 'silver',
    source: 'system',
    active: true,
  },
  {
    title: 'Volume Week',
    description: 'Complete 10 workouts in a single week. Push your limits!',
    type: 'total',
    target: 10,
    durationDays: 7,
    badgeId: 'challenge_volume_week',
    badgeName: 'Volume Week',
    badgeTier: 'gold',
    source: 'system',
    active: true,
  },
];

// ─── Seed built-in challenges ────────────────────────────────────────────────

export async function seedBuiltInChallenges(): Promise<void> {
  try {
    const snap = await getDocs(query(collection(db, 'challenges'), where('source', '==', 'system')));
    const existingIds = new Set(snap.docs.map(d => d.data().badgeId));

    for (const challenge of BUILT_IN_CHALLENGES) {
      if (!existingIds.has(challenge.badgeId)) {
        await addDoc(collection(db, 'challenges'), {
          ...challenge,
          createdAt: Timestamp.now(),
        });
      }
    }
  } catch (error) {
    console.error('Error seeding challenges:', error);
  }
}

// ─── Fetch all active challenges ─────────────────────────────────────────────

export async function fetchChallenges(): Promise<Challenge[]> {
  try {
    const q = query(collection(db, 'challenges'), where('active', '==', true));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Challenge));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'challenges');
    return [];
  }
}

// ─── Fetch all challenges (admin) ────────────────────────────────────────────

export async function fetchAllChallenges(): Promise<Challenge[]> {
  try {
    const snap = await getDocs(collection(db, 'challenges'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Challenge));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'challenges');
    return [];
  }
}

// ─── Create a challenge (admin) ──────────────────────────────────────────────

export async function createChallenge(challenge: Omit<Challenge, 'id' | 'createdAt'>): Promise<string> {
  try {
    const ref = await addDoc(collection(db, 'challenges'), {
      ...challenge,
      createdAt: Timestamp.now(),
    });
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'challenges');
    throw error;
  }
}

// ─── Delete a challenge (admin) ──────────────────────────────────────────────

export async function deleteChallenge(challengeId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'challenges', challengeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `challenges/${challengeId}`);
    throw error;
  }
}

// ─── Join a challenge ────────────────────────────────────────────────────────

export async function joinChallenge(userId: string, challengeId: string, durationDays: number): Promise<void> {
  try {
    const startDate = format(new Date(), 'yyyy-MM-dd');
    const endDate = format(new Date(Date.now() + durationDays * 86400000), 'yyyy-MM-dd');
    const docId = `${userId}_${challengeId}`;
    await setDoc(doc(db, 'challenge_participants', docId), {
      userId,
      challengeId,
      joinedAt: Timestamp.now(),
      startDate,
      endDate,
      progress: 0,
      completed: false,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'challenge_participants');
    throw error;
  }
}

// ─── Leave a challenge ───────────────────────────────────────────────────────

export async function leaveChallenge(userId: string, challengeId: string): Promise<void> {
  try {
    const docId = `${userId}_${challengeId}`;
    await deleteDoc(doc(db, 'challenge_participants', docId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'challenge_participants');
    throw error;
  }
}

// ─── Fetch user's challenge participations ───────────────────────────────────

export async function fetchUserChallenges(userId: string): Promise<ChallengeParticipant[]> {
  try {
    const q = query(collection(db, 'challenge_participants'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ChallengeParticipant));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'challenge_participants');
    return [];
  }
}

// ─── Update challenge progress ───────────────────────────────────────────────

export async function updateChallengeProgress(userId: string): Promise<string[]> {
  const completedChallengeIds: string[] = [];

  try {
    const participations = await fetchUserChallenges(userId);
    if (participations.length === 0) return [];

    // Fetch user's workout completion dates
    const completionsRef = collection(db, 'workout_completions');
    const completionsQ = query(completionsRef, where('userId', '==', userId));
    const completionsSnap = await getDocs(completionsQ);

    const allDates = new Set<string>();
    completionsSnap.docs.forEach(d => allDates.add(d.data().date));

    for (const participation of participations) {
      if (participation.completed) continue;

      // Check if challenge deadline has passed
      const today = format(new Date(), 'yyyy-MM-dd');
      if (today > participation.endDate) continue; // Expired, skip

      // Fetch the challenge definition
      const challengeSnap = await getDoc(doc(db, 'challenges', participation.challengeId));
      if (!challengeSnap.exists()) continue;
      const challenge = challengeSnap.data() as Challenge;

      // Calculate progress based on challenge type
      let progress = 0;
      const startDate = parseISO(participation.startDate);
      const relevantDates = Array.from(allDates)
        .filter(d => d >= participation.startDate && d <= participation.endDate)
        .sort();

      switch (challenge.type) {
        case 'streak': {
          // Count consecutive days from start
          let streak = 0;
          let checkDate = new Date(startDate);
          while (allDates.has(format(checkDate, 'yyyy-MM-dd')) && format(checkDate, 'yyyy-MM-dd') <= participation.endDate) {
            streak++;
            checkDate = new Date(checkDate.getTime() + 86400000);
          }
          progress = streak;
          break;
        }
        case 'total': {
          // Count total workout sessions within the date range, not just unique days
          const totalSessions = completionsSnap.docs.filter(d => {
            const date = d.data().date;
            return date >= participation.startDate && date <= participation.endDate;
          });
          progress = totalSessions.length;
          break;
        }
        case 'weekend': {
          // Count unique weekends with workouts
          const weekends = new Set<string>();
          for (const dateStr of relevantDates) {
            const date = parseISO(dateStr);
            const day = date.getDay();
            if (day === 0 || day === 6) {
              // Use week number as key to count unique weekends
              const weekKey = format(date, 'yyyy-ww');
              weekends.add(weekKey);
            }
          }
          progress = weekends.size;
          break;
        }
      }

      // Update progress in Firestore
      const docId = `${userId}_${participation.challengeId}`;
      const completed = progress >= challenge.target;

      await updateDoc(doc(db, 'challenge_participants', docId), {
        progress,
        completed,
        ...(completed ? { completedAt: Timestamp.now() } : {}),
      });

      if (completed) {
        completedChallengeIds.push(participation.challengeId);
      }
    }
  } catch (error) {
    console.error('Error updating challenge progress:', error);
  }

  return completedChallengeIds;
}
