import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { fetchCompletedWorkouts, CompletedWorkout } from '../services/workoutService';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, Clock, Target, Calendar, Play,
  Link as LinkIcon, Activity, Trophy,
} from 'lucide-react';

/** Extract YouTube video ID from various URL formats */
function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function WorkoutHistory() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<CompletedWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const data = await fetchCompletedWorkouts(user.uid);
      setWorkouts(data);
      setLoading(false);
    };
    load();
  }, [user]);

  // Group by completion date
  const grouped = workouts.reduce<Record<string, CompletedWorkout[]>>((acc, w) => {
    if (!acc[w.completionDate]) acc[w.completionDate] = [];
    acc[w.completionDate].push(w);
    return acc;
  }, {});

  const totalMinutes = workouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-20 flex items-center gap-3">
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-zinc-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-600" />
        </Link>
        <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-zinc-900">Workout History</h1>
          <p className="text-xs text-zinc-500">{workouts.length} workout{workouts.length !== 1 ? 's' : ''} completed</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900" />
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-700">No workouts completed yet</h2>
            <p className="text-sm text-zinc-500 mt-1 mb-6">Complete your first workout to start building your history!</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors"
            >
              Find Workouts
            </Link>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-zinc-900">{workouts.length}</p>
                <p className="text-xs text-zinc-500 mt-1">Workouts Done</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-zinc-900">{totalMinutes}</p>
                <p className="text-xs text-zinc-500 mt-1">Total Mins</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-zinc-900">{Object.keys(grouped).length}</p>
                <p className="text-xs text-zinc-500 mt-1">Active Days</p>
              </div>
            </div>

            {/* History by date */}
            <div className="space-y-6">
              {Object.entries(grouped).map(([date, group]) => {
                const formattedDate = format(parseISO(date), 'EEEE, MMMM d, yyyy');
                return (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                      <h3 className="text-sm font-semibold text-zinc-600">{formattedDate}</h3>
                      <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        {group.length} completed
                      </span>
                    </div>
                    <div className="space-y-3">
                      {group.map((w, idx) => {
                        const ytId = getYouTubeId(w.videoUrl || '');
                        return (
                          <Link
                            key={`${w.completionId}-${idx}`}
                            to={`/workout/${w.id}`}
                            className="block bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-md transition-all"
                          >
                            <div className="flex flex-col sm:flex-row">
                              {/* Video thumbnail */}
                              {ytId && (
                                <div className="relative sm:w-48 w-full aspect-video sm:aspect-auto sm:min-h-[120px] bg-zinc-900 shrink-0 overflow-hidden">
                                  <img
                                    src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                                    alt={w.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                      <Play className="w-4 h-4 text-zinc-900 ml-0.5" />
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Content */}
                              <div className="flex-1 p-4 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
                                    <Clock className="w-3 h-3" />{w.durationMinutes} min
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                                    <Target className="w-3 h-3" />{w.goal}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                                    <CheckCircle className="w-3 h-3" /> Done
                                  </span>
                                </div>
                                <h3 className="font-semibold text-zinc-900 truncate">{w.title}</h3>
                                <p className="text-sm text-zinc-500 mt-0.5 line-clamp-2">{w.description}</p>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
