# Badges, Achievements & Profile Page Design

## Summary

Add a gamification system with 4 badge categories and a full user profile/settings page to the Daily Fitness app.

## Badge Categories

### 1. Milestone Badges (automatic)
- **First Step** — Complete your first workout
- **Getting Started** — Complete 5 workouts
- **Dedicated** — Complete 10 workouts
- **Committed** — Complete 25 workouts
- **Half Century** — Complete 50 workouts
- **100 Club** — Complete 100 workouts

### 2. Streak Badges (automatic)
- **Warming Up** — 3-day streak
- **Week Warrior** — 7-day streak
- **Two Week Titan** — 14-day streak
- **Monthly Machine** — 30-day streak

### 3. Goal-Specific Badges (automatic)
- **Muscle Master** — Complete 20 Muscle Gain workouts
- **Cardio King** — Complete 20 Weight Loss workouts
- **Zen Mode** — Complete 20 General Fitness workouts

### 4. Challenge Badges (opt-in)
- Pre-defined + admin-created challenges
- User must "Join" a challenge first
- Progress tracked against challenge criteria
- Badge awarded on completion
- Example built-in challenges:
  - "7-Day Kickstart" — Complete a workout every day for 7 days
  - "Weekend Warrior" — Complete workouts on 4 consecutive weekends
  - "Volume Week" — Complete 10 workouts in a single week

## User Profile Page (`/profile`)

### Sections:
1. **Profile Header** — Photo, display name, member since, current goal
2. **Edit Profile** — Change display name, photo URL, fitness goal
3. **Stats Overview** — Total workouts, best streak, active days, total minutes
4. **Badges Showcase** — Grid of earned badges (glowing) + locked badges (greyed out) with progress indicators
5. **Active Challenges** — Currently joined challenges with progress bars
6. **Available Challenges** — Challenges user can join
7. **Preferences** — Theme toggle (future), notification settings (future, placeholder)
8. **Sign Out**

## Badge Unlock Celebrations
- **Major badges** (milestone 50+, streak 14+, challenge completions) → Modal popup with badge icon, confetti effect, and "Nice!" button
- **Minor badges** (first few milestones, short streaks) → Toast notification sliding in from top

## Data Architecture (Firestore)

### Collections:
- `badges_earned/{odIdUserId_badgeId}` — Records of which user earned which badge and when
- `challenges/{challengeId}` — Challenge definitions (admin-created or system)
- `challenge_participants/{odIdUserId_challengeId}` — User's join date + progress

### Badge evaluation:
- Runs client-side on workout completion and on profile page load
- Checks criteria against existing `workout_completions` data
- Awards new badges by writing to `badges_earned`

## Navigation
- Add profile icon to Home header (links to `/profile`)
- Add "Challenges" section on Home page below progress
- Profile page accessible from all pages via header

## Tech Stack
- No new dependencies needed (pure React + Firestore)
- Badge icons via Lucide (already installed)
- Charts: Not in scope for this feature (separate task)
