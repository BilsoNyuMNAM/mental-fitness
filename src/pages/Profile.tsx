import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Settings, Trophy, Target, Flame, Calendar,
  Clock, Edit3, Check, X, ChevronRight, Shield, LogOut, Bell, Palette,
  Lock, Zap,
} from 'lucide-react';
import { getBadgeProgress, getUserStats, BadgeProgress } from '../services/badgeService';
import {
  fetchChallenges, fetchUserChallenges, joinChallenge, leaveChallenge,
  Challenge, ChallengeParticipant, seedBuiltInChallenges,
} from '../services/challengeService';
import { TIER_COLORS, CATEGORY_LABELS, BadgeCategory } from '../services/badgeDefinitions';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { format } from 'date-fns';

export default function Profile() {
  const { user, profile, logout, updateGoal } = useAuth();
  const navigate = useNavigate();

  // --- State ---
  const [badgeProgress, setBadgeProgress] = useState<BadgeProgress[]>([]);
  const [stats, setStats] = useState({ totalWorkouts: 0, currentStreak: 0, bestStreak: 0, goalCounts: {} as Record<string, number>, completedChallengeIds: [] as string[] });
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [participations, setParticipations] = useState<ChallengeParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingGoal, setEditingGoal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const [joiningChallenge, setJoiningChallenge] = useState<string | null>(null);

  // Badge filter
  const [badgeFilter, setBadgeFilter] = useState<BadgeCategory | 'all'>('all');

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        setLoading(true);

        // Seed built-in challenges if needed
        await seedBuiltInChallenges();

        const [bp, st, ch, cp] = await Promise.all([
          getBadgeProgress(user.uid),
          getUserStats(user.uid),
          fetchChallenges(),
          fetchUserChallenges(user.uid),
        ]);

        setBadgeProgress(bp);
        setStats(st as any);
        setChallenges(ch);
        setParticipations(cp);
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const handleSaveName = async () => {
    if (!user || !newName.trim()) return;
    setSavingName(true);
    try {
      await updateProfile(user, { displayName: newName.trim() });
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { displayName: newName.trim() }, { merge: true });
      setEditingName(false);
    } catch (err) {
      console.error('Error updating name:', err);
    }
    setSavingName(false);
  };

  const handleSaveGoal = async () => {
    if (!selectedGoal) return;
    setSavingGoal(true);
    await updateGoal(selectedGoal);
    setEditingGoal(false);
    setSavingGoal(false);
  };

  const handleJoinChallenge = async (challenge: Challenge) => {
    if (!user || !challenge.id) return;
    setJoiningChallenge(challenge.id);
    try {
      await joinChallenge(user.uid, challenge.id, challenge.durationDays);
      const cp = await fetchUserChallenges(user.uid);
      setParticipations(cp);
    } catch (err) {
      console.error('Error joining challenge:', err);
    }
    setJoiningChallenge(null);
  };

  const handleLeaveChallenge = async (challengeId: string) => {
    if (!user) return;
    try {
      await leaveChallenge(user.uid, challengeId);
      const cp = await fetchUserChallenges(user.uid);
      setParticipations(cp);
    } catch (err) {
      console.error('Error leaving challenge:', err);
    }
  };

  const memberSince = profile?.createdAt?.toDate
    ? format(profile.createdAt.toDate(), 'MMMM yyyy')
    : profile?.createdAt?.seconds
      ? format(new Date(profile.createdAt.seconds * 1000), 'MMMM yyyy')
      : 'Recently';

  const earnedCount = badgeProgress.filter(b => b.earned).length;
  const totalBadges = badgeProgress.length;
  const participationMap = new Map(participations.map(p => [p.challengeId, p]));

  const filteredBadges = badgeFilter === 'all'
    ? badgeProgress
    : badgeProgress.filter(b => b.definition.category === badgeFilter);

  const activeChallenges = challenges.filter(c => c.id && participationMap.has(c.id) && !participationMap.get(c.id)!.completed);
  const availableChallenges = challenges.filter(c => c.id && !participationMap.has(c.id));
  const completedChallenges = challenges.filter(c => c.id && participationMap.has(c.id) && participationMap.get(c.id)!.completed);

  const GOALS = ['Muscle Gain', 'Weight Loss', 'General Fitness'];

  if (loading) {
    return (
      <div className="pf-page">
        <style>{profileStyles}</style>
        <div className="pf-loader"><div className="pf-spinner" /></div>
      </div>
    );
  }

  return (
    <>
      <style>{profileStyles}</style>
      <div className="pf-page">
        {/* Header */}
        <header className="pf-header">
          <button onClick={() => navigate(-1)} className="pf-back-btn">
            <ArrowLeft style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
          <h1 className="pf-header-title">Profile</h1>
          <div style={{ width: '2.5rem' }} />
        </header>

        <main className="pf-main">
          {/* Profile Card */}
          <section className="pf-profile-card">
            <div className="pf-avatar">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt="" className="pf-avatar-img" />
              ) : (
                <User style={{ width: '2rem', height: '2rem', color: '#71717a' }} />
              )}
            </div>
            <div className="pf-profile-info">
              {editingName ? (
                <div className="pf-edit-row">
                  <input
                    className="pf-edit-input"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Your name"
                    autoFocus
                  />
                  <button className="pf-edit-confirm" onClick={handleSaveName} disabled={savingName}>
                    <Check style={{ width: '1rem', height: '1rem' }} />
                  </button>
                  <button className="pf-edit-cancel" onClick={() => setEditingName(false)}>
                    <X style={{ width: '1rem', height: '1rem' }} />
                  </button>
                </div>
              ) : (
                <div className="pf-name-row">
                  <h2 className="pf-name">{profile?.displayName || 'User'}</h2>
                  <button className="pf-edit-btn" onClick={() => { setNewName(profile?.displayName || ''); setEditingName(true); }}>
                    <Edit3 style={{ width: '0.875rem', height: '0.875rem' }} />
                  </button>
                </div>
              )}
              <p className="pf-email">{profile?.email}</p>
              <div className="pf-meta-row">
                <span className="pf-meta-badge">
                  <Calendar style={{ width: '0.75rem', height: '0.75rem' }} />
                  {memberSince}
                </span>
                {editingGoal ? (
                  <div className="pf-edit-row" style={{ marginTop: '0.5rem' }}>
                    <select
                      className="pf-edit-input"
                      value={selectedGoal}
                      onChange={(e) => setSelectedGoal(e.target.value)}
                    >
                      {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <button className="pf-edit-confirm" onClick={handleSaveGoal} disabled={savingGoal}>
                      <Check style={{ width: '1rem', height: '1rem' }} />
                    </button>
                    <button className="pf-edit-cancel" onClick={() => setEditingGoal(false)}>
                      <X style={{ width: '1rem', height: '1rem' }} />
                    </button>
                  </div>
                ) : (
                  <span className="pf-meta-badge pf-meta-goal" onClick={() => { setSelectedGoal(profile?.goal || GOALS[0]); setEditingGoal(true); }}>
                    <Target style={{ width: '0.75rem', height: '0.75rem' }} />
                    {profile?.goal}
                    <Edit3 style={{ width: '0.625rem', height: '0.625rem', opacity: 0.5 }} />
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <section className="pf-stats-grid">
            <div className="pf-stat-card">
              <Trophy style={{ width: '1.25rem', height: '1.25rem', color: '#eab308' }} />
              <span className="pf-stat-value">{stats.totalWorkouts}</span>
              <span className="pf-stat-label">Workouts</span>
            </div>
            <div className="pf-stat-card">
              <Flame style={{ width: '1.25rem', height: '1.25rem', color: '#f97316' }} />
              <span className="pf-stat-value">{stats.currentStreak}</span>
              <span className="pf-stat-label">Current Streak</span>
            </div>
            <div className="pf-stat-card">
              <Zap style={{ width: '1.25rem', height: '1.25rem', color: '#8b5cf6' }} />
              <span className="pf-stat-value">{stats.bestStreak}</span>
              <span className="pf-stat-label">Best Streak</span>
            </div>
            <div className="pf-stat-card">
              <Shield style={{ width: '1.25rem', height: '1.25rem', color: '#10b981' }} />
              <span className="pf-stat-value">{earnedCount}/{totalBadges}</span>
              <span className="pf-stat-label">Badges</span>
            </div>
          </section>

          {/* Badges Section */}
          <section className="pf-section">
            <div className="pf-section-header">
              <h3 className="pf-section-title">
                <Trophy style={{ width: '1.125rem', height: '1.125rem', color: '#eab308' }} />
                Badges
              </h3>
              <span className="pf-section-count">{earnedCount} earned</span>
            </div>

            {/* Filter tabs */}
            <div className="pf-badge-filters">
              <button
                className={`pf-filter-btn ${badgeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setBadgeFilter('all')}
              >All</button>
              {(['milestone', 'streak', 'goal', 'challenge'] as BadgeCategory[]).map(cat => (
                <button
                  key={cat}
                  className={`pf-filter-btn ${badgeFilter === cat ? 'active' : ''}`}
                  onClick={() => setBadgeFilter(cat)}
                >{CATEGORY_LABELS[cat]}</button>
              ))}
            </div>

            {/* Badge Grid */}
            <div className="pf-badge-grid">
              {filteredBadges.map(bp => {
                const Icon = bp.definition.icon;
                const tier = TIER_COLORS[bp.definition.tier];
                return (
                  <div
                    key={bp.definition.id}
                    className={`pf-badge-card ${bp.earned ? 'earned' : 'locked'}`}
                    style={bp.earned ? {
                      borderColor: tier.border,
                      boxShadow: `0 0 20px ${tier.glow}`,
                    } : {}}
                  >
                    <div
                      className="pf-badge-icon"
                      style={bp.earned ? {
                        background: tier.bg,
                        borderColor: tier.border,
                      } : {}}
                    >
                      <Icon style={{
                        width: '1.25rem',
                        height: '1.25rem',
                        color: bp.earned ? tier.text : '#a1a1aa',
                      }} />
                    </div>
                    <div className="pf-badge-name">{bp.definition.name}</div>
                    <div className="pf-badge-desc">{bp.definition.description}</div>
                    {bp.earned ? (
                      <div className="pf-badge-earned-label">✓ Earned</div>
                    ) : (
                      <>
                        <div className="pf-badge-progress-bar">
                          <div
                            className="pf-badge-progress-fill"
                            style={{ width: `${(bp.progress || 0) * 100}%` }}
                          />
                        </div>
                        <div className="pf-badge-progress-text">{bp.progressText}</div>
                      </>
                    )}
                    <div className="pf-badge-tier" style={{ color: bp.earned ? tier.border : '#a1a1aa' }}>
                      {bp.definition.tier}
                    </div>
                  </div>
                );
              })}
              {filteredBadges.length === 0 && (
                <div className="pf-empty-message">No badges in this category yet.</div>
              )}
            </div>
          </section>

          {/* Active Challenges */}
          {activeChallenges.length > 0 && (
            <section className="pf-section">
              <div className="pf-section-header">
                <h3 className="pf-section-title">
                  <Flame style={{ width: '1.125rem', height: '1.125rem', color: '#f97316' }} />
                  Active Challenges
                </h3>
              </div>
              <div className="pf-challenge-list">
                {activeChallenges.map(c => {
                  const participation = participationMap.get(c.id!)!;
                  const progressPct = Math.min((participation.progress / c.target) * 100, 100);
                  return (
                    <div key={c.id} className="pf-challenge-card active">
                      <div className="pf-challenge-info">
                        <h4 className="pf-challenge-name">{c.title}</h4>
                        <p className="pf-challenge-desc">{c.description}</p>
                        <div className="pf-challenge-meta">
                          <span className="pf-challenge-meta-item">
                            <Clock style={{ width: '0.75rem', height: '0.75rem' }} />
                            Ends {participation.endDate}
                          </span>
                          <span className="pf-challenge-meta-item">
                            <Target style={{ width: '0.75rem', height: '0.75rem' }} />
                            {participation.progress} / {c.target}
                          </span>
                        </div>
                        <div className="pf-challenge-progress-bar">
                          <div className="pf-challenge-progress-fill" style={{ width: `${progressPct}%` }} />
                        </div>
                      </div>
                      <button className="pf-challenge-leave" onClick={() => handleLeaveChallenge(c.id!)}>
                        Leave
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Available Challenges */}
          {availableChallenges.length > 0 && (
            <section className="pf-section">
              <div className="pf-section-header">
                <h3 className="pf-section-title">
                  <Zap style={{ width: '1.125rem', height: '1.125rem', color: '#8b5cf6' }} />
                  Available Challenges
                </h3>
              </div>
              <div className="pf-challenge-list">
                {availableChallenges.map(c => (
                  <div key={c.id} className="pf-challenge-card">
                    <div className="pf-challenge-info">
                      <h4 className="pf-challenge-name">{c.title}</h4>
                      <p className="pf-challenge-desc">{c.description}</p>
                      <div className="pf-challenge-meta">
                        <span className="pf-challenge-meta-item">
                          <Clock style={{ width: '0.75rem', height: '0.75rem' }} />
                          {c.durationDays} days
                        </span>
                        <span className="pf-challenge-badge-reward">
                          <Trophy style={{ width: '0.75rem', height: '0.75rem' }} />
                          {c.badgeName} badge
                        </span>
                      </div>
                    </div>
                    <button
                      className="pf-challenge-join"
                      onClick={() => handleJoinChallenge(c)}
                      disabled={joiningChallenge === c.id}
                    >
                      {joiningChallenge === c.id ? '...' : 'Join'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Completed Challenges */}
          {completedChallenges.length > 0 && (
            <section className="pf-section">
              <div className="pf-section-header">
                <h3 className="pf-section-title">
                  <Check style={{ width: '1.125rem', height: '1.125rem', color: '#10b981' }} />
                  Completed Challenges
                </h3>
              </div>
              <div className="pf-challenge-list">
                {completedChallenges.map(c => (
                  <div key={c.id} className="pf-challenge-card completed">
                    <div className="pf-challenge-info">
                      <h4 className="pf-challenge-name">{c.title}</h4>
                      <p className="pf-challenge-desc">{c.description}</p>
                    </div>
                    <div className="pf-challenge-done-badge">
                      <Check style={{ width: '1rem', height: '1rem' }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Preferences */}
          <section className="pf-section">
            <div className="pf-section-header">
              <h3 className="pf-section-title">
                <Settings style={{ width: '1.125rem', height: '1.125rem', color: '#71717a' }} />
                Preferences
              </h3>
            </div>
            <div className="pf-pref-list">
              <div className="pf-pref-item">
                <div className="pf-pref-icon"><Bell style={{ width: '1rem', height: '1rem' }} /></div>
                <div className="pf-pref-info">
                  <div className="pf-pref-title">Notifications</div>
                  <div className="pf-pref-subtitle">Workout reminders & achievements</div>
                </div>
                <span className="pf-pref-badge-soon">Soon</span>
              </div>
              <div className="pf-pref-item">
                <div className="pf-pref-icon"><Palette style={{ width: '1rem', height: '1rem' }} /></div>
                <div className="pf-pref-info">
                  <div className="pf-pref-title">Theme</div>
                  <div className="pf-pref-subtitle">Light mode</div>
                </div>
                <span className="pf-pref-badge-soon">Soon</span>
              </div>
            </div>
          </section>

          {/* Sign Out */}
          <button className="pf-signout-btn" onClick={async () => { await logout(); navigate('/login'); }}>
            <LogOut style={{ width: '1.125rem', height: '1.125rem' }} />
            Sign Out
          </button>
        </main>
      </div>
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const profileStyles = `
  .pf-page { min-height: 100vh; background: #fafafa; }
  .pf-loader { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .pf-spinner { width: 2rem; height: 2rem; border: 2px solid transparent; border-bottom-color: #18181b; border-radius: 50%; animation: pfSpin 0.8s linear infinite; }
  @keyframes pfSpin { to { transform: rotate(360deg); } }

  .pf-header { background: white; border-bottom: 1px solid #e4e4e7; padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
  .pf-header-title { font-size: 1.125rem; font-weight: 700; color: #18181b; }
  .pf-back-btn { width: 2.5rem; height: 2.5rem; border-radius: 0.75rem; border: none; background: #f4f4f5; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; color: #18181b; }
  .pf-back-btn:hover { background: #e4e4e7; }

  .pf-main { max-width: 640px; margin: 0 auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 4rem; }

  /* Profile Card */
  .pf-profile-card { display: flex; gap: 1.25rem; background: white; border: 1px solid #e4e4e7; border-radius: 1.25rem; padding: 1.5rem; }
  .pf-avatar { width: 4.5rem; height: 4.5rem; border-radius: 1rem; background: #f4f4f5; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
  .pf-avatar-img { width: 100%; height: 100%; object-fit: cover; }
  .pf-profile-info { flex: 1; min-width: 0; }
  .pf-name-row { display: flex; align-items: center; gap: 0.5rem; }
  .pf-name { font-size: 1.25rem; font-weight: 700; color: #18181b; margin: 0; }
  .pf-edit-btn { width: 1.75rem; height: 1.75rem; border-radius: 0.375rem; border: none; background: #f4f4f5; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #71717a; transition: all 0.2s; }
  .pf-edit-btn:hover { background: #e4e4e7; color: #18181b; }
  .pf-email { font-size: 0.8125rem; color: #71717a; margin: 0.25rem 0 0.75rem; }
  .pf-meta-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
  .pf-meta-badge { display: inline-flex; align-items: center; gap: 0.375rem; font-size: 0.6875rem; font-weight: 500; color: #52525b; background: #f4f4f5; padding: 0.25rem 0.625rem; border-radius: 9999px; }
  .pf-meta-goal { cursor: pointer; transition: background 0.2s; }
  .pf-meta-goal:hover { background: #e4e4e7; }

  .pf-edit-row { display: flex; align-items: center; gap: 0.375rem; }
  .pf-edit-input { flex: 1; padding: 0.5rem 0.75rem; border: 1px solid #e4e4e7; border-radius: 0.5rem; font-size: 0.875rem; font-family: inherit; outline: none; }
  .pf-edit-input:focus { border-color: #18181b; }
  .pf-edit-confirm { width: 2rem; height: 2rem; border-radius: 0.5rem; border: none; background: #18181b; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .pf-edit-cancel { width: 2rem; height: 2rem; border-radius: 0.5rem; border: 1px solid #e4e4e7; background: white; color: #71717a; display: flex; align-items: center; justify-content: center; cursor: pointer; }

  /* Stats Grid */
  .pf-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
  .pf-stat-card { background: white; border: 1px solid #e4e4e7; border-radius: 1rem; padding: 1rem 0.75rem; display: flex; flex-direction: column; align-items: center; gap: 0.375rem; }
  .pf-stat-value { font-size: 1.25rem; font-weight: 800; color: #18181b; }
  .pf-stat-label { font-size: 0.625rem; font-weight: 500; color: #71717a; text-align: center; }

  /* Sections */
  .pf-section { background: white; border: 1px solid #e4e4e7; border-radius: 1.25rem; padding: 1.25rem; }
  .pf-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
  .pf-section-title { display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; font-weight: 700; color: #18181b; margin: 0; }
  .pf-section-count { font-size: 0.75rem; font-weight: 600; color: #71717a; background: #f4f4f5; padding: 0.25rem 0.625rem; border-radius: 9999px; }

  /* Badge Filters */
  .pf-badge-filters { display: flex; gap: 0.375rem; overflow-x: auto; padding-bottom: 0.75rem; scrollbar-width: none; }
  .pf-badge-filters::-webkit-scrollbar { display: none; }
  .pf-filter-btn { padding: 0.375rem 0.875rem; border-radius: 9999px; border: 1px solid #e4e4e7; background: white; font-size: 0.75rem; font-weight: 500; color: #71717a; cursor: pointer; white-space: nowrap; transition: all 0.2s; font-family: inherit; }
  .pf-filter-btn.active { background: #18181b; color: white; border-color: #18181b; }
  .pf-filter-btn:hover:not(.active) { background: #f4f4f5; }

  /* Badge Grid */
  .pf-badge-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.75rem; }
  .pf-badge-card { border: 1px solid #e4e4e7; border-radius: 1rem; padding: 1rem; text-align: center; transition: all 0.3s; position: relative; }
  .pf-badge-card.locked { opacity: 0.55; filter: grayscale(0.5); }
  .pf-badge-card.earned { background: #fefce8; }
  .pf-badge-card.earned:hover { transform: translateY(-2px); }
  .pf-badge-icon { width: 2.75rem; height: 2.75rem; border-radius: 0.75rem; border: 2px solid #e4e4e7; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.625rem; background: #f4f4f5; }
  .pf-badge-name { font-size: 0.8125rem; font-weight: 700; color: #18181b; margin-bottom: 0.25rem; }
  .pf-badge-desc { font-size: 0.625rem; color: #71717a; line-height: 1.4; margin-bottom: 0.5rem; }
  .pf-badge-earned-label { font-size: 0.6875rem; font-weight: 600; color: #16a34a; }
  .pf-badge-progress-bar { height: 4px; background: #e4e4e7; border-radius: 2px; overflow: hidden; margin-bottom: 0.25rem; }
  .pf-badge-progress-fill { height: 100%; background: #f97316; border-radius: 2px; transition: width 0.5s ease; }
  .pf-badge-progress-text { font-size: 0.625rem; color: #a1a1aa; }
  .pf-badge-tier { font-size: 0.5625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.375rem; }

  /* Challenges */
  .pf-challenge-list { display: flex; flex-direction: column; gap: 0.75rem; }
  .pf-challenge-card { display: flex; align-items: center; gap: 1rem; border: 1px solid #e4e4e7; border-radius: 1rem; padding: 1rem 1.25rem; transition: all 0.2s; }
  .pf-challenge-card.active { border-color: #f97316; background: #fff7ed; }
  .pf-challenge-card.completed { border-color: #10b981; background: #ecfdf5; }
  .pf-challenge-info { flex: 1; min-width: 0; }
  .pf-challenge-name { font-size: 0.9375rem; font-weight: 700; color: #18181b; margin: 0 0 0.25rem; }
  .pf-challenge-desc { font-size: 0.75rem; color: #71717a; margin: 0 0 0.5rem; line-height: 1.4; }
  .pf-challenge-meta { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem; }
  .pf-challenge-meta-item { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.6875rem; color: #52525b; }
  .pf-challenge-badge-reward { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.6875rem; color: #eab308; font-weight: 600; }
  .pf-challenge-progress-bar { height: 6px; background: #fed7aa; border-radius: 3px; overflow: hidden; }
  .pf-challenge-progress-fill { height: 100%; background: #f97316; border-radius: 3px; transition: width 0.5s ease; }
  .pf-challenge-join { padding: 0.5rem 1.25rem; border-radius: 0.625rem; border: none; background: #18181b; color: white; font-size: 0.8125rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: background 0.2s; white-space: nowrap; }
  .pf-challenge-join:hover { background: #27272a; }
  .pf-challenge-join:disabled { opacity: 0.5; cursor: not-allowed; }
  .pf-challenge-leave { padding: 0.5rem 1rem; border-radius: 0.625rem; border: 1px solid #fca5a5; background: #fef2f2; color: #dc2626; font-size: 0.75rem; font-weight: 500; cursor: pointer; font-family: inherit; transition: all 0.2s; white-space: nowrap; }
  .pf-challenge-leave:hover { background: #fee2e2; }
  .pf-challenge-done-badge { width: 2.5rem; height: 2.5rem; border-radius: 9999px; background: #10b981; color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

  /* Preferences */
  .pf-pref-list { display: flex; flex-direction: column; }
  .pf-pref-item { display: flex; align-items: center; gap: 0.875rem; padding: 0.875rem 0; border-bottom: 1px solid #f4f4f5; }
  .pf-pref-item:last-child { border-bottom: none; }
  .pf-pref-icon { width: 2.25rem; height: 2.25rem; border-radius: 0.625rem; background: #f4f4f5; display: flex; align-items: center; justify-content: center; color: #52525b; flex-shrink: 0; }
  .pf-pref-info { flex: 1; }
  .pf-pref-title { font-size: 0.875rem; font-weight: 600; color: #18181b; }
  .pf-pref-subtitle { font-size: 0.75rem; color: #a1a1aa; }
  .pf-pref-badge-soon { font-size: 0.625rem; font-weight: 600; color: #a1a1aa; background: #f4f4f5; padding: 0.25rem 0.5rem; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; }

  /* Sign Out */
  .pf-signout-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%; padding: 0.875rem; border-radius: 0.75rem; border: 1px solid #fca5a5; background: white; color: #dc2626; font-size: 0.875rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: all 0.2s; }
  .pf-signout-btn:hover { background: #fef2f2; }

  .pf-empty-message { grid-column: 1 / -1; text-align: center; padding: 2rem; color: #a1a1aa; font-size: 0.8125rem; }

  @media (max-width: 480px) {
    .pf-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .pf-badge-grid { grid-template-columns: repeat(2, 1fr); }
    .pf-profile-card { flex-direction: column; align-items: center; text-align: center; }
    .pf-meta-row { justify-content: center; }
    .pf-name-row { justify-content: center; }
  }
`;
