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
  Clock, Target, Calendar, Link as LinkIcon, ChevronDown, ChevronUp, ArrowLeft,
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
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
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

  // Group workouts by date
  const grouped = workouts.reduce<Record<string, Workout[]>>((acc, w) => {
    if (!acc[w.date]) acc[w.date] = [];
    acc[w.date].push(w);
    return acc;
  }, {});

  const toggleGroup = (date: string) =>
    setExpandedGroups(prev => ({ ...prev, [date]: !prev[date] }));

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
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
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
          Object.entries(grouped).map(([date, group]) => {
            const isOpen = expandedGroups[date] !== false; // default open
            const formatted = format(new Date(date + 'T00:00:00'), 'EEEE, MMMM d, yyyy');
            const completed = group.filter(w => w.completed).length;
            return (
              <div key={date} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
                {/* Group header */}
                <button
                  onClick={() => toggleGroup(date)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span className="font-semibold text-zinc-900">{formatted}</span>
                    <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
                      {group.length} workout{group.length !== 1 ? 's' : ''} · {completed} done
                    </span>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                </button>

                {/* Workout cards */}
                {isOpen && (
                  <div className="divide-y divide-zinc-100">
                    {group.map(w => (
                      <div key={w.id} className="flex items-start gap-4 px-5 py-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
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
                          <h3 className="font-semibold text-zinc-900 truncate">{w.title}</h3>
                          <p className="text-sm text-zinc-500 mt-0.5 line-clamp-2">{w.description}</p>
                          {w.videoUrl && (
                            <a
                              href={w.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-1"
                            >
                              <LinkIcon className="w-3 h-3" /> Video link
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
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
                    ))}
                  </div>
                )}
              </div>
            );
          })
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
