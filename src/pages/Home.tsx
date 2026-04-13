import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useAuth } from '../components/AuthContext';
import { fetchTodayWorkouts, fetchProgressDataRange, fetchCustomWorkouts, Workout, CustomWorkout, DayStatus } from '../services/workoutService';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { format, subDays, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { Activity, CheckCircle, Clock, Flame, PlayCircle, AlertCircle, LayoutDashboard, Trophy, ChevronRight, Dumbbell, Star, ChevronDown, Check, UserCircle, Zap } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';
import { evaluateAndAwardBadges } from '../services/badgeService';
import { useBadgeNotification } from '../components/BadgeNotification';
import { fetchChallenges, fetchUserChallenges, Challenge, ChallengeParticipant, seedBuiltInChallenges } from '../services/challengeService';

export default function Home() {
  const { user, profile, logout } = useAuth();
  const { showBadgeEarned } = useBadgeNotification();
  const [todayWorkouts, setTodayWorkouts] = useState<Workout[]>([]);
  const [yesterdayWorkouts, setYesterdayWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressDays, setProgressDays] = useState<DayStatus[]>([]);
  const [streak, setStreak] = useState(0);
  const [progressRange, setProgressRange] = useState<'present_week' | 'last_week' | '30_days'>('present_week');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [customWorkouts, setCustomWorkouts] = useState<CustomWorkout[]>([]);
  const [activeChallenges, setActiveChallenges] = useState<{challenge: Challenge; participation: ChallengeParticipant}[]>([]);

  useEffect(() => {
    if (!user || !profile?.goal) return;

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');

    const fetchWorkouts = async () => {
      setLoading(true);
      try {
        // Fetch today's workouts
        const workouts = await fetchTodayWorkouts(user.uid, todayStr, profile.goal);
        setTodayWorkouts(workouts);

        // Fetch yesterday's workouts
        const yesWorkouts = await fetchTodayWorkouts(user.uid, yesterdayStr, profile.goal);
        setYesterdayWorkouts(yesWorkouts);

        // Fetch progress data based on selected range
        const { start, end } = getDateRange(progressRange);
        const progressResult = await fetchProgressDataRange(user.uid, start, end);
        setProgressDays(progressResult.days);
        setStreak(progressResult.streak);

        // Fetch user's custom workouts
        const customs = await fetchCustomWorkouts(user.uid);
        setCustomWorkouts(customs.filter(c => !profile.goal || c.goal?.toLowerCase().trim() === profile.goal.toLowerCase().trim()));

        // Evaluate badges (on page load)
        const newBadges = await evaluateAndAwardBadges(user.uid);
        newBadges.forEach(b => showBadgeEarned(b.definition));

        // Fetch active challenges
        await seedBuiltInChallenges();
        const [allChallenges, userParticipations] = await Promise.all([
          fetchChallenges(),
          fetchUserChallenges(user.uid),
        ]);
        const participationMap = new Map(userParticipations.map(p => [p.challengeId, p]));
        const active = allChallenges
          .filter(c => c.id && participationMap.has(c.id) && !participationMap.get(c.id)!.completed)
          .map(c => ({ challenge: c, participation: participationMap.get(c.id!)! }));
        setActiveChallenges(active);

      } catch (error: any) {
        console.error('Error fetching workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [user, profile, progressRange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function getDateRange(range: 'present_week' | 'last_week' | '30_days') {
    const today = new Date();
    if (range === 'present_week') {
      return { start: startOfWeek(today, { weekStartsOn: 0 }), end: endOfWeek(today, { weekStartsOn: 0 }) };
    } else if (range === 'last_week') {
      const lastWeekDay = subDays(startOfWeek(today, { weekStartsOn: 0 }), 1);
      return { start: startOfWeek(lastWeekDay, { weekStartsOn: 0 }), end: endOfWeek(lastWeekDay, { weekStartsOn: 0 }) };
    } else {
      return { start: subDays(today, 29), end: today };
    }
  }

  const rangeLabels: Record<string, string> = {
    present_week: 'Present week',
    last_week: 'Last week',
    '30_days': '30 days',
  };

  // Compute stats from progressDays
  const completedCount = progressDays.filter(d => d.hasWorkout).length;
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  // Only count past days (not future days) as rest days
  const pastDays = progressDays.filter(d => d.date <= todayStr);
  const restDayCount = pastDays.filter(d => !d.hasWorkout).length;
  const totalDaysInRange = pastDays.length;
  const completionPct = totalDaysInRange > 0 ? Math.round((completedCount / totalDaysInRange) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  const yesterdayCompleted = yesterdayWorkouts.filter(w => w.completed).length;
  const missedYesterday = yesterdayWorkouts.length > 0 && yesterdayCompleted === 0;

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-zinc-900">Hello, {profile?.displayName?.split(' ')[0] || 'Friend'}</h1>
            <p className="text-xs text-zinc-500">Goal: {profile?.goal}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {profile?.isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Link>
          )}
          <Link to="/profile" className="p-2 rounded-full hover:bg-zinc-100 transition-colors">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <UserCircle className="w-6 h-6 text-zinc-500" />
            )}
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        
        {/* Missed Day Alert */}
        {missedYesterday && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-orange-900">You missed yesterday's workout</h3>
              <p className="text-sm text-orange-700 mt-1">No pressure! Today is a fresh start. Pick a workout below and get moving.</p>
            </div>
          </div>
        )}

        {/* Yesterday's Summary */}
        {!missedYesterday && yesterdayWorkouts.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-sm font-medium text-emerald-900">Great job yesterday!</h3>
                <p className="text-sm text-emerald-700">You completed {yesterdayCompleted} workout{yesterdayCompleted !== 1 ? 's' : ''}.</p>
              </div>
            </div>
          </div>
        )}

        {/* Today's Workouts */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-zinc-900">Recommended for You</h2>
            <span className="text-sm font-medium text-zinc-500">{format(new Date(), 'EEEE, MMM d')}</span>
          </div>
          
          <div className="space-y-4">
            {todayWorkouts.length === 0 ? (
              <div className="bg-white border border-dashed border-zinc-200 rounded-2xl p-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-3">
                  <Activity className="w-6 h-6 text-zinc-400" />
                </div>
                <h3 className="text-zinc-900 font-medium mb-1">No recommended workouts</h3>
                <p className="text-sm text-zinc-500">Check back later or try updating your fitness goal.</p>
              </div>
            ) : (
              todayWorkouts.map((workout) => (
                <Link
                  key={workout.id}
                  to={`/workout/${workout.id}`}
                  className={`block bg-white border rounded-2xl p-5 transition-all hover:shadow-md ${
                    workout.completed ? 'border-emerald-200 bg-emerald-50/30' : 'border-zinc-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700">
                          <Clock className="w-3 h-3" />
                          {workout.durationMinutes} min
                        </span>
                        {workout.completed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                      </div>
                      <h3 className={`font-semibold text-lg mb-1 ${workout.completed ? 'text-zinc-500 line-through' : 'text-zinc-900'}`}>
                        {workout.title}
                      </h3>
                      <p className="text-sm text-zinc-500 line-clamp-2">{workout.description}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      workout.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-900 text-white'
                    }`}>
                      {workout.completed ? <CheckCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Custom Workouts */}
        {customWorkouts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                <h2 className="text-xl font-semibold text-zinc-900">Your Workouts</h2>
              </div>
              <Link to="/my-workouts" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                See all
              </Link>
            </div>

            <div className="space-y-4">
              {customWorkouts.slice(0, 3).map((workout) => (
                <div
                  key={workout.id}
                  className="block bg-white border border-zinc-200 rounded-2xl p-5 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700">
                          <Clock className="w-3 h-3" />
                          {workout.durationMinutes} min
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                          <Star className="w-3 h-3" />
                          Custom
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg mb-1 text-zinc-900">
                        {workout.title}
                      </h3>
                      <p className="text-sm text-zinc-500 line-clamp-2">{workout.description}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-amber-100 text-amber-600">
                      <Dumbbell className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Progress Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-semibold text-zinc-900">Progress</h2>
            </div>
            <div className="flex items-center gap-3">
              {/* Streak Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-200 bg-orange-50 text-orange-600 text-sm font-medium">
                <Flame className="w-3.5 h-3.5" />
                {streak} day streak
              </div>
              {/* Dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors"
                >
                  {rangeLabels[progressRange]}
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden z-20">
                    {(['present_week', 'last_week', '30_days'] as const).map(option => (
                      <button
                        key={option}
                        onClick={() => { setProgressRange(option); setDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center justify-between transition-colors ${
                          progressRange === option ? 'bg-zinc-50 text-zinc-900' : 'text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {rangeLabels[option]}
                        {progressRange === option && <Check className="w-4 h-4 text-orange-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#faf8f5] border border-zinc-200/60 rounded-2xl p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-white/80 rounded-xl p-4 text-center border border-zinc-100">
                <div className="text-2xl font-bold text-orange-500">{completedCount}</div>
                <div className="text-xs text-zinc-500 mt-1">completed</div>
              </div>
              <div className="bg-white/80 rounded-xl p-4 text-center border border-zinc-100">
                <div className="text-2xl font-bold text-zinc-400">{restDayCount}</div>
                <div className="text-xs text-zinc-500 mt-1">rest days</div>
              </div>
              <div className="bg-white/80 rounded-xl p-4 text-center border border-zinc-100">
                <div className="text-2xl font-bold text-zinc-400">{completionPct}%</div>
                <div className="text-xs text-zinc-500 mt-1">completion</div>
              </div>
            </div>

            {/* Workout Timeline */}
            <div className="relative">
              <div className="flex items-end gap-0 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {progressDays.map((day, idx) => {
                  const dayOfWeek = format(parseISO(day.date), 'EEE');
                  const isFuture = day.date > todayStr;
                  // For weekly views show day names, for 30 days show date labels at intervals
                  const showLabel = progressRange === '30_days'
                    ? (idx % 5 === 0 || day.isToday)
                    : true;
                  const label = progressRange === '30_days'
                    ? day.label
                    : dayOfWeek;

                  return (
                    <div
                      key={day.date}
                      className="flex flex-col items-center"
                      style={{ minWidth: progressRange === '30_days' ? '28px' : '0', flex: '1 1 0' }}
                    >
                      {/* Checkmark or dot */}
                      <div className="h-6 flex items-center justify-center mb-2">
                        {isFuture ? (
                          <span />
                        ) : day.hasWorkout ? (
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8.5L6.5 12L13 4" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-zinc-300" />
                        )}
                      </div>
                      {/* Label */}
                      {showLabel ? (
                        <span className={`text-[10px] leading-tight ${
                          day.isToday
                            ? 'text-orange-500 font-bold'
                            : 'text-zinc-400 font-medium'
                        }`}>
                          {day.isToday && progressRange !== '30_days' ? 'Today' : label}
                        </span>
                      ) : (
                        <span className="text-[10px] leading-tight">&nbsp;</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex items-center justify-end gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-orange-500" />
                  <span className="text-[11px] text-zinc-500">workout</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-zinc-300" />
                  <span className="text-[11px] text-zinc-500">rest day</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Active Challenges */}
        {activeChallenges.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                <h2 className="text-xl font-semibold text-zinc-900">Active Challenges</h2>
              </div>
              <Link to="/profile" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                See all
              </Link>
            </div>
            <div className="space-y-3">
              {activeChallenges.map(({ challenge, participation }) => {
                const progressPct = Math.min((participation.progress / challenge.target) * 100, 100);
                return (
                  <div key={challenge.id} className="bg-white border border-purple-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-zinc-900">{challenge.title}</h3>
                      <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                        {participation.progress}/{challenge.target}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500 mb-3">{challenge.description}</p>
                    <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <p className="text-xs text-zinc-400 mt-2">Ends {participation.endDate}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Workout History Link */}
        <section>
          <Link
            to="/history"
            className="flex items-center justify-between bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900">Workout History</h3>
                <p className="text-sm text-zinc-500">See all the workouts you've completed</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
          </Link>
        </section>

        {/* My Workouts Link */}
        <section>
          <Link
            to="/my-workouts"
            className="flex items-center justify-between bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900">My Workouts</h3>
                <p className="text-sm text-zinc-500">Create & manage your custom routines</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
          </Link>
        </section>

      </main>
    </div>
  );
}
