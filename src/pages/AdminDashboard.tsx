import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import {
  fetchAllWorkouts,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  Workout,
} from '../services/workoutService';
import { format } from 'date-fns';
import {
  LayoutDashboard, Plus, Pencil, Trash2, X, Save,
  Clock, Target, Calendar, Link as LinkIcon, ArrowLeft, Play,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const GOALS = ['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'General Fitness'];

const emptyForm = (): Omit<Workout, 'id' | 'completed' | 'completedAt'> => ({
  title: '',
  description: '',
  durationMinutes: 30,
  goal: 'General Fitness',
  date: format(new Date(), 'yyyy-MM-dd'),
  videoUrl: '',
  userId: 'global',
});

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

export default function AdminDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Guard — redirect non-admins
  useEffect(() => {
    if (profile && !profile.isAdmin) {
      navigate('/');
    }
  }, [profile, navigate]);

  const load = async () => {
    setLoading(true);
    const all = await fetchAllWorkouts();
    all.sort((a, b) => b.date.localeCompare(a.date));
    setWorkouts(all);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setError('');
    setShowForm(true);
  };

  const openEdit = (w: Workout) => {
    setEditingId(w.id!);
    setForm({
      title: w.title,
      description: w.description,
      durationMinutes: w.durationMinutes,
      goal: w.goal,
      date: w.date,
      videoUrl: w.videoUrl || '',
      userId: w.userId,
    });
    setError('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setError('');
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.description.trim()) { setError('Description is required.'); return; }
    if (form.durationMinutes < 1) { setError('Duration must be at least 1 minute.'); return; }

    setSaving(true);
    try {
      if (editingId) {
        await updateWorkout(editingId, { ...form });
      } else {
        await createWorkout({ ...form, completed: false });
      }
      await load();
      closeForm();
    } catch (err: any) {
      console.error('handleSave error:', err);
      setError(`Failed to save: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteWorkout(id);
      setWorkouts(prev => prev.filter(w => w.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  const field = (key: keyof typeof form, value: string | number) =>
    setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-zinc-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-zinc-600" />
          </Link>
          <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-zinc-900">Admin Dashboard</h1>
            <p className="text-xs text-zinc-500">{workouts.length} workout{workouts.length !== 1 ? 's' : ''} total</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-zinc-900 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-zinc-700 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Workout
        </button>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900" />
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard className="w-8 h-8 text-zinc-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-700">No workouts yet</h2>
            <p className="text-sm text-zinc-500 mt-1 mb-6">Create your first workout to get started.</p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-zinc-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Workout
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {workouts.map(w => {
              const ytId = getYouTubeId(w.videoUrl || '');
              const formattedDate = format(new Date(w.date + 'T00:00:00'), 'MMM d, yyyy');
              return (
                <div key={w.id} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row">
                    {/* Video thumbnail */}
                    {ytId ? (
                      <a
                        href={w.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative sm:w-64 w-full aspect-video sm:aspect-auto sm:min-h-[160px] bg-zinc-900 shrink-0 group overflow-hidden"
                      >
                        <img
                          src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                          alt={w.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 text-zinc-900 ml-0.5" />
                          </div>
                        </div>
                      </a>
                    ) : (
                      <div className="sm:w-64 w-full aspect-video sm:aspect-auto sm:min-h-[160px] bg-zinc-100 shrink-0 flex items-center justify-center">
                        <div className="text-center">
                          <LayoutDashboard className="w-8 h-8 text-zinc-300 mx-auto mb-1" />
                          <span className="text-xs text-zinc-400">No video</span>
                        </div>
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-xs font-medium bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
                            <Calendar className="w-3 h-3" />{formattedDate}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-medium bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" />{w.durationMinutes} min
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                            <Target className="w-3 h-3" />{w.goal}
                          </span>
                          {w.completed && (
                            <span className="text-xs font-medium bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                              ✓ Completed
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-zinc-900 text-base truncate">{w.title}</h3>
                        <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{w.description}</p>
                        {w.videoUrl && (
                          <a
                            href={w.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-2"
                          >
                            <LinkIcon className="w-3 h-3" /> {w.videoUrl}
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mt-3">
                        <button
                          onClick={() => openEdit(w)}
                          className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(w.id!)}
                          disabled={deletingId === w.id}
                          className="p-2 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors disabled:opacity-40"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Slide-over form panel */}
      {showForm && (
        <div className="fixed inset-0 z-30 flex">
          {/* Backdrop */}
          <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={closeForm} />

          {/* Panel */}
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200">
              <h2 className="font-semibold text-zinc-900 text-lg">
                {editingId ? 'Edit Workout' : 'New Workout'}
              </h2>
              <button onClick={closeForm} className="p-2 rounded-full hover:bg-zinc-100 transition-colors">
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            <div className="flex-1 px-6 py-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => field('title', e.target.value)}
                  placeholder="e.g. Morning HIIT Blast"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">Description <span className="text-red-500">*</span></label>
                <textarea
                  value={form.description}
                  onChange={e => field('description', e.target.value)}
                  placeholder="Describe the exercises, sets, reps, or instructions..."
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none"
                />
              </div>

              {/* Duration + Goal row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    <Clock className="w-3.5 h-3.5 inline mr-1" />Duration (min)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={300}
                    value={form.durationMinutes}
                    onChange={e => field('durationMinutes', Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    <Target className="w-3.5 h-3.5 inline mr-1" />Goal
                  </label>
                  <select
                    value={form.goal}
                    onChange={e => field('goal', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent bg-white"
                  >
                    {GOALS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />Scheduled Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => field('date', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  <LinkIcon className="w-3.5 h-3.5 inline mr-1" />YouTube Video URL <span className="text-zinc-400">(optional)</span>
                </label>
                <input
                  type="url"
                  value={form.videoUrl}
                  onChange={e => field('videoUrl', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-zinc-100 flex gap-3">
              <button
                onClick={closeForm}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Workout'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}

