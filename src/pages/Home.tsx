import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { fetchTodayWorkouts, fetchProgressData, fetchCustomWorkouts, Workout, CustomWorkout } from '../services/workoutService';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { format, subDays, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { Activity, CheckCircle, Clock, Flame, PlayCircle, AlertCircle, LayoutDashboard, Trophy, ChevronRight, Dumbbell, Star } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Home() {
  const { user, profile, logout } = useAuth();
  const [todayWorkouts, setTodayWorkouts] = useState<Workout[]>([]);
  const [yesterdayWorkouts, setYesterdayWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<{ date: string; completed: number }[]>([]);
  const [customWorkouts, setCustomWorkouts] = useState<CustomWorkout[]>([]);

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

        // Fetch last 7 days for progress chart
        const last7Days = format(subDays(new Date(), 6), 'yyyy-MM-dd');
        const chartData = await fetchProgressData(user.uid, last7Days);
        setProgressData(chartData);

        // Fetch user's custom workouts
        const customs = await fetchCustomWorkouts(user.uid);
        setCustomWorkouts(customs.filter(c => !profile.goal || c.goal?.toLowerCase().trim() === profile.goal.toLowerCase().trim()));

      } catch (error: any) {
        console.error('Error fetching workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [user, profile]);

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
          <button onClick={logout} className="text-sm font-medium text-zinc-500 hover:text-zinc-900">
            Sign out
          </button>
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

        {/* Progress Snapshot */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-semibold text-zinc-900">7-Day Progress</h2>
          </div>
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 h-64">
            {progressData.reduce((sum, d) => sum + d.completed, 0) === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center">
                <Flame className="w-8 h-8 text-zinc-200 mb-3" />
                <p className="text-sm text-zinc-500">No progress data available yet.</p>
                <p className="text-xs text-zinc-400 mt-1">Complete a workout to see your progress here.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a1a1aa' }} width={30} domain={[0, 'dataMax + 1']} />
                  <Tooltip 
                    cursor={{ stroke: '#e4e4e7', strokeWidth: 2 }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`${value} workout${value !== 1 ? 's' : ''}`, 'Completed']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#18181b" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#18181b', strokeWidth: 0 }} 
                    activeDot={{ r: 6, fill: '#18181b', stroke: '#fff', strokeWidth: 2 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

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
