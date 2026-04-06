import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, Heart, Globe, Pencil, Trash2, X, Clock,
  Target, PlayCircle, Search, Dumbbell, Star,
} from 'lucide-react';
import {
  CustomWorkout, Workout,
  createCustomWorkout, fetchCustomWorkouts, updateCustomWorkout, deleteCustomWorkout,
  fetchAllGlobalWorkouts, fetchFavorites, addFavorite, removeFavorite, isFavorited,
} from '../services/workoutService';

type Tab = 'creations' | 'favorites' | 'browse';

const GOALS = ['Muscle Gain', 'Weight Loss', 'General Fitness'];

interface WorkoutForm {
  title: string;
  description: string;
  videoUrl: string;
  durationMinutes: number;
  goal: string;
}

const EMPTY_FORM: WorkoutForm = { title: '', description: '', videoUrl: '', durationMinutes: 15, goal: 'Muscle Gain' };

export default function MyWorkouts() {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState<Tab>('creations');
  const [customs, setCustoms] = useState<CustomWorkout[]>([]);
  const [favorites, setFavorites] = useState<(Workout | CustomWorkout)[]>([]);
  const [globalWorkouts, setGlobalWorkouts] = useState<Workout[]>([]);
  const [favoriteIdSet, setFavoriteIdSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WorkoutForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [goalFilter, setGoalFilter] = useState<string>('');

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [customData, favData, globalData] = await Promise.all([
        fetchCustomWorkouts(user.uid),
        fetchFavorites(user.uid),
        fetchAllGlobalWorkouts(),
      ]);
      setCustoms(customData);
      setFavorites(favData);
      setGlobalWorkouts(globalData);

      // Build favorite ID set
      const favIds = new Set<string>();
      for (const f of favData) {
        if (f.id) favIds.add(f.id);
      }
      setFavoriteIdSet(favIds);
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user]);

  const handleSave = async () => {
    if (!user || !form.title.trim() || !form.description.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateCustomWorkout(editingId, {
          title: form.title,
          description: form.description,
          videoUrl: form.videoUrl || undefined,
          durationMinutes: form.durationMinutes,
          goal: form.goal,
        });
      } else {
        await createCustomWorkout({
          userId: user.uid,
          title: form.title,
          description: form.description,
          videoUrl: form.videoUrl || undefined,
          durationMinutes: form.durationMinutes,
          goal: form.goal,
        });
      }
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      await loadData();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (w: CustomWorkout) => {
    setForm({
      title: w.title,
      description: w.description,
      videoUrl: w.videoUrl || '',
      durationMinutes: w.durationMinutes,
      goal: w.goal,
    });
    setEditingId(w.id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workout?')) return;
    try {
      await deleteCustomWorkout(id);
      await loadData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const toggleFavorite = async (workoutId: string, source: 'global' | 'custom') => {
    if (!user) return;
    try {
      if (favoriteIdSet.has(workoutId)) {
        await removeFavorite(user.uid, workoutId);
        setFavoriteIdSet(prev => { const n = new Set(prev); n.delete(workoutId); return n; });
        setFavorites(prev => prev.filter(f => f.id !== workoutId));
      } else {
        await addFavorite(user.uid, workoutId, source);
        setFavoriteIdSet(prev => new Set(prev).add(workoutId));
        await loadData();
      }
    } catch (err) {
      console.error('Favorite error:', err);
    }
  };

  const filteredGlobal = globalWorkouts.filter(w => {
    const matchesSearch = !searchQuery ||
      w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGoal = !goalFilter || w.goal?.toLowerCase() === goalFilter.toLowerCase();
    return matchesSearch && matchesGoal;
  });

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'creations', label: 'My Creations', icon: <Dumbbell className="w-4 h-4" />, count: customs.length },
    { id: 'favorites', label: 'Favorites', icon: <Heart className="w-4 h-4" />, count: favorites.length },
    { id: 'browse', label: 'Browse', icon: <Globe className="w-4 h-4" />, count: globalWorkouts.length },
  ];

  return (
    <>
      <style>{`
        .mw-page { min-height: 100vh; background: #fafafa; }
        .mw-header { background: white; border-bottom: 1px solid #e4e4e7; padding: 1rem 1.5rem; position: sticky; top: 0; z-index: 20; display: flex; align-items: center; gap: 0.75rem; }
        .mw-back { padding: 0.5rem; margin-left: -0.5rem; border-radius: 9999px; border: none; background: none; cursor: pointer; display: flex; color: #52525b; }
        .mw-back:hover { background: #f4f4f5; }
        .mw-header-icon { width: 2.5rem; height: 2.5rem; background: #18181b; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; }
        .mw-header-title { font-weight: 600; color: #18181b; }
        .mw-header-sub { font-size: 0.75rem; color: #71717a; }
        .mw-main { max-width: 48rem; margin: 0 auto; padding: 1.5rem; }

        .mw-tabs { display: flex; gap: 0.25rem; background: #f4f4f5; border-radius: 0.75rem; padding: 0.25rem; margin-bottom: 1.5rem; }
        .mw-tab { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.375rem; padding: 0.625rem 0.75rem; border-radius: 0.625rem; border: none; background: none; font-size: 0.8125rem; font-weight: 500; color: #71717a; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .mw-tab:hover { color: #18181b; }
        .mw-tab.active { background: white; color: #18181b; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .mw-tab-count { font-size: 0.6875rem; background: #e4e4e7; color: #52525b; padding: 0.125rem 0.375rem; border-radius: 9999px; font-weight: 600; }
        .mw-tab.active .mw-tab-count { background: #18181b; color: white; }

        .mw-create-btn { display: flex; align-items: center; gap: 0.5rem; background: #18181b; color: white; border: none; padding: 0.75rem 1.25rem; border-radius: 0.75rem; font-weight: 600; font-size: 0.875rem; cursor: pointer; transition: background 0.2s; font-family: inherit; margin-bottom: 1.5rem; }
        .mw-create-btn:hover { background: #27272a; }

        .mw-card { background: white; border: 1px solid #e4e4e7; border-radius: 1rem; padding: 1.25rem; margin-bottom: 0.75rem; transition: box-shadow 0.2s; }
        .mw-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .mw-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; }
        .mw-card-badges { display: flex; align-items: center; gap: 0.375rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
        .mw-badge { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 500; }
        .mw-badge-dur { background: #f4f4f5; color: #52525b; }
        .mw-badge-goal { background: #eef2ff; color: #4338ca; }
        .mw-badge-custom { background: #fef3c7; color: #92400e; }
        .mw-card-title { font-weight: 600; font-size: 1rem; color: #18181b; margin: 0 0 0.25rem; }
        .mw-card-desc { font-size: 0.8125rem; color: #71717a; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin: 0; }
        .mw-card-actions { display: flex; gap: 0.25rem; flex-shrink: 0; }
        .mw-card-btn { padding: 0.5rem; border-radius: 0.5rem; border: none; background: none; cursor: pointer; display: flex; color: #a1a1aa; transition: all 0.15s; }
        .mw-card-btn:hover { background: #f4f4f5; color: #18181b; }
        .mw-card-btn.fav { color: #a1a1aa; }
        .mw-card-btn.fav.active { color: #ef4444; }
        .mw-card-btn.fav:hover { color: #ef4444; background: #fef2f2; }
        .mw-card-btn.edit:hover { color: #2563eb; background: #eff6ff; }
        .mw-card-btn.del:hover { color: #dc2626; background: #fef2f2; }

        .mw-empty { text-align: center; padding: 4rem 1rem; }
        .mw-empty-icon { width: 3rem; height: 3rem; background: #f4f4f5; border-radius: 9999px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; }
        .mw-empty-title { font-weight: 600; color: #3f3f46; margin: 0 0 0.25rem; }
        .mw-empty-text { font-size: 0.8125rem; color: #a1a1aa; margin: 0; }

        .mw-search-bar { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
        .mw-search-input { flex: 1; background: white; border: 1px solid #e4e4e7; border-radius: 0.75rem; padding: 0.625rem 0.75rem 0.625rem 2.5rem; font-size: 0.875rem; color: #18181b; outline: none; transition: border-color 0.2s; font-family: inherit; position: relative; }
        .mw-search-input:focus { border-color: #a1a1aa; }
        .mw-search-wrap { position: relative; flex: 1; }
        .mw-search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #a1a1aa; pointer-events: none; }
        .mw-select { background: white; border: 1px solid #e4e4e7; border-radius: 0.75rem; padding: 0.625rem 0.75rem; font-size: 0.8125rem; color: #18181b; cursor: pointer; font-family: inherit; outline: none; }

        /* Modal overlay */
        .mw-overlay { position: fixed; inset: 0; z-index: 50; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .mw-modal { background: white; border-radius: 1.25rem; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
        .mw-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f4f4f5; }
        .mw-modal-title { font-weight: 700; font-size: 1.125rem; color: #18181b; margin: 0; }
        .mw-modal-close { padding: 0.375rem; border-radius: 0.5rem; border: none; background: none; cursor: pointer; color: #71717a; display: flex; }
        .mw-modal-close:hover { background: #f4f4f5; color: #18181b; }
        .mw-modal-body { padding: 1.5rem; }
        .mw-field { margin-bottom: 1.125rem; }
        .mw-field-label { display: block; font-size: 0.8125rem; font-weight: 500; color: #3f3f46; margin-bottom: 0.375rem; }
        .mw-field-input { width: 100%; background: #fafafa; border: 1px solid #e4e4e7; border-radius: 0.625rem; padding: 0.625rem 0.75rem; font-size: 0.875rem; color: #18181b; outline: none; transition: border-color 0.2s; font-family: inherit; box-sizing: border-box; }
        .mw-field-input:focus { border-color: #a1a1aa; background: white; }
        .mw-field-textarea { resize: vertical; min-height: 5rem; }
        .mw-modal-footer { padding: 1rem 1.5rem; border-top: 1px solid #f4f4f5; display: flex; gap: 0.5rem; justify-content: flex-end; }
        .mw-btn-cancel { padding: 0.625rem 1.25rem; border-radius: 0.625rem; border: 1px solid #e4e4e7; background: white; color: #3f3f46; font-weight: 500; font-size: 0.8125rem; cursor: pointer; font-family: inherit; }
        .mw-btn-cancel:hover { background: #f4f4f5; }
        .mw-btn-save { padding: 0.625rem 1.25rem; border-radius: 0.625rem; border: none; background: #18181b; color: white; font-weight: 600; font-size: 0.8125rem; cursor: pointer; font-family: inherit; transition: background 0.2s; }
        .mw-btn-save:hover { background: #27272a; }
        .mw-btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

        .mw-spinner { display: flex; align-items: center; justify-content: center; padding: 5rem 0; }
        .mw-spinner-el { width: 2rem; height: 2rem; border: 2px solid transparent; border-bottom-color: #18181b; border-radius: 50%; animation: mw-spin 0.8s linear infinite; }
        @keyframes mw-spin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .mw-tabs { flex-direction: column; }
          .mw-search-bar { flex-direction: column; }
        }
      `}</style>

      <div className="mw-page">
        {/* Header */}
        <header className="mw-header">
          <Link to="/" className="mw-back">
            <ArrowLeft style={{ width: '1.25rem', height: '1.25rem' }} />
          </Link>
          <div className="mw-header-icon">
            <Dumbbell style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
          </div>
          <div>
            <div className="mw-header-title">My Workouts</div>
            <div className="mw-header-sub">Create, save, and manage your routines</div>
          </div>
        </header>

        <main className="mw-main">
          {/* Tabs */}
          <div className="mw-tabs">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`mw-tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.icon}
                {t.label}
                <span className="mw-tab-count">{t.count}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="mw-spinner"><div className="mw-spinner-el" /></div>
          ) : (
            <>
              {/* ═══ MY CREATIONS ═══ */}
              {tab === 'creations' && (
                <>
                  <button className="mw-create-btn" onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }}>
                    <Plus style={{ width: '1.125rem', height: '1.125rem' }} />
                    Create New Workout
                  </button>

                  {customs.length === 0 ? (
                    <div className="mw-empty">
                      <div className="mw-empty-icon">
                        <Dumbbell style={{ width: '1.5rem', height: '1.5rem', color: '#a1a1aa' }} />
                      </div>
                      <h3 className="mw-empty-title">No custom workouts yet</h3>
                      <p className="mw-empty-text">Create your first workout to get started!</p>
                    </div>
                  ) : (
                    customs.map(w => (
                      <div key={w.id} className="mw-card">
                        <div className="mw-card-top">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="mw-card-badges">
                              <span className="mw-badge mw-badge-dur">
                                <Clock style={{ width: '0.75rem', height: '0.75rem' }} />
                                {w.durationMinutes} min
                              </span>
                              <span className="mw-badge mw-badge-goal">
                                <Target style={{ width: '0.75rem', height: '0.75rem' }} />
                                {w.goal}
                              </span>
                              <span className="mw-badge mw-badge-custom">
                                <Star style={{ width: '0.75rem', height: '0.75rem' }} />
                                Custom
                              </span>
                            </div>
                            <h3 className="mw-card-title">{w.title}</h3>
                            <p className="mw-card-desc">{w.description}</p>
                          </div>
                          <div className="mw-card-actions">
                            <button className="mw-card-btn fav" title="Favorite" onClick={() => toggleFavorite(w.id!, 'custom')}>
                              <Heart style={{ width: '1.125rem', height: '1.125rem', fill: favoriteIdSet.has(w.id!) ? 'currentColor' : 'none' }} className={favoriteIdSet.has(w.id!) ? 'active' : ''} />
                            </button>
                            <button className="mw-card-btn edit" title="Edit" onClick={() => handleEdit(w)}>
                              <Pencil style={{ width: '1.125rem', height: '1.125rem' }} />
                            </button>
                            <button className="mw-card-btn del" title="Delete" onClick={() => handleDelete(w.id!)}>
                              <Trash2 style={{ width: '1.125rem', height: '1.125rem' }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* ═══ FAVORITES ═══ */}
              {tab === 'favorites' && (
                <>
                  {favorites.length === 0 ? (
                    <div className="mw-empty">
                      <div className="mw-empty-icon">
                        <Heart style={{ width: '1.5rem', height: '1.5rem', color: '#a1a1aa' }} />
                      </div>
                      <h3 className="mw-empty-title">No favorites yet</h3>
                      <p className="mw-empty-text">Tap the heart icon on any workout to save it here.</p>
                    </div>
                  ) : (
                    favorites.map(w => (
                      <div key={w.id} className="mw-card">
                        <div className="mw-card-top">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="mw-card-badges">
                              <span className="mw-badge mw-badge-dur">
                                <Clock style={{ width: '0.75rem', height: '0.75rem' }} />
                                {w.durationMinutes} min
                              </span>
                              <span className="mw-badge mw-badge-goal">
                                <Target style={{ width: '0.75rem', height: '0.75rem' }} />
                                {w.goal}
                              </span>
                              {'userId' in w && w.userId !== 'global' && (
                                <span className="mw-badge mw-badge-custom">
                                  <Star style={{ width: '0.75rem', height: '0.75rem' }} />
                                  Custom
                                </span>
                              )}
                            </div>
                            <h3 className="mw-card-title">{w.title}</h3>
                            <p className="mw-card-desc">{w.description}</p>
                          </div>
                          <div className="mw-card-actions">
                            <button
                              className="mw-card-btn fav active"
                              title="Remove from favorites"
                              onClick={() => toggleFavorite(w.id!, 'global')}
                            >
                              <Heart style={{ width: '1.125rem', height: '1.125rem', fill: 'currentColor' }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {/* ═══ BROWSE ═══ */}
              {tab === 'browse' && (
                <>
                  <div className="mw-search-bar">
                    <div className="mw-search-wrap">
                      <Search className="mw-search-icon" style={{ width: '1rem', height: '1rem' }} />
                      <input
                        className="mw-search-input"
                        placeholder="Search workouts..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                      />
                    </div>
                    <select
                      className="mw-select"
                      value={goalFilter}
                      onChange={e => setGoalFilter(e.target.value)}
                    >
                      <option value="">All Goals</option>
                      {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  {filteredGlobal.length === 0 ? (
                    <div className="mw-empty">
                      <div className="mw-empty-icon">
                        <Globe style={{ width: '1.5rem', height: '1.5rem', color: '#a1a1aa' }} />
                      </div>
                      <h3 className="mw-empty-title">No workouts found</h3>
                      <p className="mw-empty-text">Try adjusting your search or filter.</p>
                    </div>
                  ) : (
                    filteredGlobal.map(w => (
                      <div key={w.id} className="mw-card">
                        <div className="mw-card-top">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="mw-card-badges">
                              <span className="mw-badge mw-badge-dur">
                                <Clock style={{ width: '0.75rem', height: '0.75rem' }} />
                                {w.durationMinutes} min
                              </span>
                              <span className="mw-badge mw-badge-goal">
                                <Target style={{ width: '0.75rem', height: '0.75rem' }} />
                                {w.goal}
                              </span>
                            </div>
                            <h3 className="mw-card-title">{w.title}</h3>
                            <p className="mw-card-desc">{w.description}</p>
                          </div>
                          <div className="mw-card-actions">
                            <button
                              className={`mw-card-btn fav ${favoriteIdSet.has(w.id!) ? 'active' : ''}`}
                              title={favoriteIdSet.has(w.id!) ? 'Remove from favorites' : 'Add to favorites'}
                              onClick={() => toggleFavorite(w.id!, 'global')}
                            >
                              <Heart style={{ width: '1.125rem', height: '1.125rem', fill: favoriteIdSet.has(w.id!) ? 'currentColor' : 'none' }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* ═══ CREATE/EDIT MODAL ═══ */}
      {showForm && (
        <div className="mw-overlay" onClick={() => setShowForm(false)}>
          <div className="mw-modal" onClick={e => e.stopPropagation()}>
            <div className="mw-modal-header">
              <h2 className="mw-modal-title">{editingId ? 'Edit Workout' : 'Create Workout'}</h2>
              <button className="mw-modal-close" onClick={() => setShowForm(false)}>
                <X style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>
            <div className="mw-modal-body">
              <div className="mw-field">
                <label className="mw-field-label">Workout Title *</label>
                <input
                  className="mw-field-input"
                  type="text"
                  placeholder="e.g., Upper Body Blast"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="mw-field">
                <label className="mw-field-label">Description *</label>
                <textarea
                  className="mw-field-input mw-field-textarea"
                  placeholder="Describe the exercises, sets, reps..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div className="mw-field" style={{ flex: 1 }}>
                  <label className="mw-field-label">Duration (minutes)</label>
                  <input
                    className="mw-field-input"
                    type="number"
                    min={1}
                    max={300}
                    value={form.durationMinutes}
                    onChange={e => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 15 })}
                  />
                </div>
                <div className="mw-field" style={{ flex: 1 }}>
                  <label className="mw-field-label">Goal</label>
                  <select
                    className="mw-field-input"
                    value={form.goal}
                    onChange={e => setForm({ ...form, goal: e.target.value })}
                  >
                    {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div className="mw-field">
                <label className="mw-field-label">YouTube Video URL (optional)</label>
                <input
                  className="mw-field-input"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={form.videoUrl}
                  onChange={e => setForm({ ...form, videoUrl: e.target.value })}
                />
              </div>
            </div>
            <div className="mw-modal-footer">
              <button className="mw-btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              <button
                className="mw-btn-save"
                disabled={saving || !form.title.trim() || !form.description.trim()}
                onClick={handleSave}
              >
                {saving ? 'Saving...' : editingId ? 'Update Workout' : 'Create Workout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
