import { db } from '../firebase';
import {
  collection, doc, setDoc, getDocs, getDoc,
  query, where, Timestamp,
} from 'firebase/firestore';
import { format, subDays } from 'date-fns';
import { BADGE_DEFINITIONS, BadgeDefinition, EarnedBadge } from './badgeDefinitions';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';
import { Trophy } from 'lucide-react';

// ─── Fetch user's earned badges ──────────────────────────────────────────────

export async function fetchEarnedBadges(userId: string): Promise<EarnedBadge[]> {
  try {
    const q = query(collection(db, 'badges_earned'), where('userId', '==', userId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as EarnedBadge));
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'badges_earned');
    return [];
  }
}

// ─── Award a badge ───────────────────────────────────────────────────────────

async function awardBadge(userId: string, badgeId: string): Promise<void> {
  try {
    const docId = `${userId}_${badgeId}`;
    const ref = doc(db, 'badges_earned', docId);
    await setDoc(ref, {
      userId,
      badgeId,
      earnedAt: Timestamp.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'badges_earned');
  }
}

// ─── Check if badge already earned ───────────────────────────────────────────

async function isBadgeEarned(userId: string, badgeId: string): Promise<boolean> {
  try {
    const docId = `${userId}_${badgeId}`;
    const snap = await getDoc(doc(db, 'badges_earned', docId));
    return snap.exists();
  } catch {
    return false;
  }
}

// ─── Get user stats for badge evaluation ─────────────────────────────────────

interface UserStats {
  totalWorkouts: number;
  currentStreak: number;
  bestStreak: number;
  goalCounts: Record<string, number>;
  completedChallengeIds: string[];
}

export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    const completionsRef = collection(db, 'workout_completions');
    const q = query(completionsRef, where('userId', '==', userId));
    const snap = await getDocs(q);

    const totalWorkouts = snap.size;

    // Collect unique dates and per-goal counts
    const dates = new Set<string>();
    const goalCounts: Record<string, number> = {};

    // We need workout goal info — fetch workouts for each completion
    const workoutGoalCache = new Map<string, string>();

    for (const d of snap.docs) {
      const data = d.data();
      dates.add(data.date);

      // Fetch workout goal if not cached
      if (!workoutGoalCache.has(data.workoutId)) {
        try {
          const workoutSnap = await getDoc(doc(db, 'workouts', data.workoutId));
          if (workoutSnap.exists()) {
            workoutGoalCache.set(data.workoutId, (workoutSnap.data().goal || '').toLowerCase().trim());
          }
        } catch {
          // Workout may not exist
        }
      }
      const goal = workoutGoalCache.get(data.workoutId) || '';
      if (goal) {
        goalCounts[goal] = (goalCounts[goal] || 0) + 1;
      }
    }

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date();
    const todayStr = format(checkDate, 'yyyy-MM-dd');
    if (!dates.has(todayStr)) {
      checkDate = subDays(checkDate, 1);
    }
    while (dates.has(format(checkDate, 'yyyy-MM-dd'))) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    }

    // Calculate best streak
    const sortedDates = Array.from(dates).sort();
    let bestStreak = 0;
    let tempStreak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      if (diffDays === 1) {
        tempStreak++;
      } else {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    bestStreak = Math.max(bestStreak, tempStreak);
    if (sortedDates.length === 0) bestStreak = 0;

    // Get completed challenges
    const completedChallengeIds: string[] = [];
    try {
      const cpRef = collection(db, 'challenge_participants');
      const cpQ = query(cpRef, where('userId', '==', userId), where('completed', '==', true));
      const cpSnap = await getDocs(cpQ);
      cpSnap.docs.forEach(d => completedChallengeIds.push(d.data().challengeId));
    } catch {
      // Collection may not exist yet
    }

    return { totalWorkouts, currentStreak, bestStreak, goalCounts, completedChallengeIds };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'workout_completions');
    return { totalWorkouts: 0, currentStreak: 0, bestStreak: 0, goalCounts: {}, completedChallengeIds: [] };
  }
}

// ─── Evaluate and award new badges ───────────────────────────────────────────

export interface NewlyEarnedBadge {
  definition: BadgeDefinition;
}

/**
 * Evaluate all badge criteria for a user and award any newly earned badges.
 * Returns a list of badges that were just earned (for celebration display).
 */
export async function evaluateAndAwardBadges(userId: string): Promise<NewlyEarnedBadge[]> {
  const stats = await getUserStats(userId);
  const earnedBadges = await fetchEarnedBadges(userId);
  const earnedSet = new Set(earnedBadges.map(b => b.badgeId));

  const newlyEarned: NewlyEarnedBadge[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    // Skip if already earned
    if (earnedSet.has(badge.id)) continue;

    let earned = false;

    switch (badge.criteria.type) {
      case 'total_workouts':
        earned = stats.totalWorkouts >= (badge.criteria.threshold || 0);
        break;
      case 'streak_days':
        // Award if current OR best streak meets threshold
        earned = Math.max(stats.currentStreak, stats.bestStreak) >= (badge.criteria.threshold || 0);
        break;
      case 'goal_workouts':
        const goalKey = (badge.criteria.goal || '').toLowerCase().trim();
        earned = (stats.goalCounts[goalKey] || 0) >= (badge.criteria.threshold || 0);
        break;
      case 'challenge_complete':
        earned = stats.completedChallengeIds.includes(badge.criteria.challengeId || '');
        break;
    }

    if (earned) {
      await awardBadge(userId, badge.id);
      newlyEarned.push({ definition: badge });
    }
  }

  return newlyEarned;
}

// ─── Get badge progress (for display) ────────────────────────────────────────

export interface BadgeProgress {
  definition: BadgeDefinition;
  earned: boolean;
  earnedAt?: any;
  /** Progress as 0-1 fraction, or null if already earned */
  progress: number | null;
  /** Display text like "3 / 10" */
  progressText: string;
}

export async function getBadgeProgress(userId: string): Promise<BadgeProgress[]> {
  const stats = await getUserStats(userId);
  const earnedBadges = await fetchEarnedBadges(userId);
  const earnedMap = new Map(earnedBadges.map(b => [b.badgeId, b]));

  // Also get any challenge-based badge definitions dynamically
  const allBadges = [...BADGE_DEFINITIONS];

  // Add challenge-based badges
  try {
    const challengesSnap = await getDocs(collection(db, 'challenges'));
    for (const cDoc of challengesSnap.docs) {
      const challenge = cDoc.data();
      if (challenge.badgeId) {
        // Create a dynamic badge definition for this challenge
        const dynamicBadge: BadgeDefinition = {
          id: challenge.badgeId,
          name: challenge.badgeName || challenge.title,
          description: `Complete the "${challenge.title}" challenge`,
          category: 'challenge',
          tier: challenge.badgeTier || 'silver',
          icon: Trophy,
          criteria: { type: 'challenge_complete', challengeId: cDoc.id },
          isMajor: true,
        };
        // Only add if not already in BADGE_DEFINITIONS
        if (!allBadges.find(b => b.id === dynamicBadge.id)) {
          allBadges.push(dynamicBadge);
        }
      }
    }
  } catch {
    // Challenges collection may not exist yet
  }

  return allBadges.map(badge => {
    const earned = earnedMap.get(badge.id);
    let progress: number | null = null;
    let progressText = '';

    if (earned) {
      progress = null;
      progressText = 'Earned!';
    } else {
      switch (badge.criteria.type) {
        case 'total_workouts': {
          const current = stats.totalWorkouts;
          const target = badge.criteria.threshold || 1;
          progress = Math.min(current / target, 1);
          progressText = `${current} / ${target}`;
          break;
        }
        case 'streak_days': {
          const current = Math.max(stats.currentStreak, stats.bestStreak);
          const target = badge.criteria.threshold || 1;
          progress = Math.min(current / target, 1);
          progressText = `${current} / ${target} days`;
          break;
        }
        case 'goal_workouts': {
          const goalKey = (badge.criteria.goal || '').toLowerCase().trim();
          const current = stats.goalCounts[goalKey] || 0;
          const target = badge.criteria.threshold || 1;
          progress = Math.min(current / target, 1);
          progressText = `${current} / ${target}`;
          break;
        }
        case 'challenge_complete': {
          const completed = stats.completedChallengeIds.includes(badge.criteria.challengeId || '');
          progress = completed ? 1 : 0;
          progressText = completed ? 'Completed' : 'In Progress';
          break;
        }
      }
    }

    return {
      definition: badge,
      earned: !!earned,
      earnedAt: earned?.earnedAt,
      progress,
      progressText,
    };
  });
}
