import {
  Trophy, Flame, Target, Dumbbell, Zap, Award,
  Star, Crown, Medal, Shield, Heart, Sparkles,
  Sunrise, Mountain,
} from 'lucide-react';

export type BadgeCategory = 'milestone' | 'streak' | 'goal' | 'challenge';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: BadgeCategory;
  tier: BadgeTier;
  icon: any; // Lucide icon component
  criteria: BadgeCriteria;
  /** If true, show modal celebration instead of toast */
  isMajor: boolean;
}

export interface BadgeCriteria {
  type: 'total_workouts' | 'streak_days' | 'goal_workouts' | 'challenge_complete';
  /** For total_workouts / streak_days / goal_workouts */
  threshold?: number;
  /** For goal_workouts — which goal */
  goal?: string;
  /** For challenge_complete — which challenge id */
  challengeId?: string;
}

export interface EarnedBadge {
  id?: string;
  userId: string;
  badgeId: string;
  earnedAt: any;
}

// ─── Badge Definitions ────────────────────────────────────────────────────────

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // ── Milestone Badges ──────────────────────────────────────────────────────
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Complete your first workout',
    category: 'milestone',
    tier: 'bronze',
    icon: Sunrise,
    criteria: { type: 'total_workouts', threshold: 1 },
    isMajor: false,
  },
  {
    id: 'getting_started',
    name: 'Getting Started',
    description: 'Complete 5 workouts',
    category: 'milestone',
    tier: 'bronze',
    icon: Star,
    criteria: { type: 'total_workouts', threshold: 5 },
    isMajor: false,
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Complete 10 workouts',
    category: 'milestone',
    tier: 'silver',
    icon: Award,
    criteria: { type: 'total_workouts', threshold: 10 },
    isMajor: false,
  },
  {
    id: 'committed',
    name: 'Committed',
    description: 'Complete 25 workouts',
    category: 'milestone',
    tier: 'silver',
    icon: Shield,
    criteria: { type: 'total_workouts', threshold: 25 },
    isMajor: false,
  },
  {
    id: 'half_century',
    name: 'Half Century',
    description: 'Complete 50 workouts',
    category: 'milestone',
    tier: 'gold',
    icon: Trophy,
    criteria: { type: 'total_workouts', threshold: 50 },
    isMajor: true,
  },
  {
    id: 'hundred_club',
    name: '100 Club',
    description: 'Complete 100 workouts',
    category: 'milestone',
    tier: 'platinum',
    icon: Crown,
    criteria: { type: 'total_workouts', threshold: 100 },
    isMajor: true,
  },

  // ── Streak Badges ─────────────────────────────────────────────────────────
  {
    id: 'warming_up',
    name: 'Warming Up',
    description: '3-day workout streak',
    category: 'streak',
    tier: 'bronze',
    icon: Flame,
    criteria: { type: 'streak_days', threshold: 3 },
    isMajor: false,
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: '7-day workout streak',
    category: 'streak',
    tier: 'silver',
    icon: Flame,
    criteria: { type: 'streak_days', threshold: 7 },
    isMajor: false,
  },
  {
    id: 'two_week_titan',
    name: 'Two Week Titan',
    description: '14-day workout streak',
    category: 'streak',
    tier: 'gold',
    icon: Zap,
    criteria: { type: 'streak_days', threshold: 14 },
    isMajor: true,
  },
  {
    id: 'monthly_machine',
    name: 'Monthly Machine',
    description: '30-day workout streak',
    category: 'streak',
    tier: 'platinum',
    icon: Mountain,
    criteria: { type: 'streak_days', threshold: 30 },
    isMajor: true,
  },

  // ── Goal-Specific Badges ──────────────────────────────────────────────────
  {
    id: 'muscle_master',
    name: 'Muscle Master',
    description: 'Complete 20 Muscle Gain workouts',
    category: 'goal',
    tier: 'gold',
    icon: Dumbbell,
    criteria: { type: 'goal_workouts', threshold: 20, goal: 'muscle gain' },
    isMajor: true,
  },
  {
    id: 'cardio_king',
    name: 'Cardio King',
    description: 'Complete 20 Weight Loss workouts',
    category: 'goal',
    tier: 'gold',
    icon: Heart,
    criteria: { type: 'goal_workouts', threshold: 20, goal: 'weight loss' },
    isMajor: true,
  },
  {
    id: 'zen_mode',
    name: 'Zen Mode',
    description: 'Complete 20 General Fitness workouts',
    category: 'goal',
    tier: 'gold',
    icon: Sparkles,
    criteria: { type: 'goal_workouts', threshold: 20, goal: 'general fitness' },
    isMajor: true,
  },
];

export const TIER_COLORS: Record<BadgeTier, { bg: string; border: string; text: string; glow: string }> = {
  bronze: { bg: '#fef3c7', border: '#d97706', text: '#92400e', glow: 'rgba(217, 119, 6, 0.3)' },
  silver: { bg: '#f1f5f9', border: '#94a3b8', text: '#475569', glow: 'rgba(148, 163, 184, 0.3)' },
  gold: { bg: '#fef9c3', border: '#eab308', text: '#854d0e', glow: 'rgba(234, 179, 8, 0.4)' },
  platinum: { bg: '#ede9fe', border: '#8b5cf6', text: '#5b21b6', glow: 'rgba(139, 92, 246, 0.4)' },
};

export const CATEGORY_LABELS: Record<BadgeCategory, string> = {
  milestone: 'Milestones',
  streak: 'Streaks',
  goal: 'Goal Masters',
  challenge: 'Challenges',
};
