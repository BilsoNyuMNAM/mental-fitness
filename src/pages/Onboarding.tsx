import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Dumbbell, Scale, Smile } from 'lucide-react';

const goals = [
  { id: 'Muscle Gain', title: 'Muscle Gain', icon: Dumbbell, desc: 'Strength training and resistance' },
  { id: 'Weight Loss', title: 'Weight Loss', icon: Scale, desc: 'Cardio, HIIT, and calorie burn' },
  { id: 'General Fitness', title: 'General Fitness', icon: Smile, desc: 'Yoga, stretching, and light movement' },
];

export default function Onboarding() {
  const { user, profile, isAuthReady, updateGoal, logout } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (profile?.goal) {
    return <Navigate to="/" />;
  }

  const handleSave = async () => {
    if (!selected) return;
    setLoading(true);
    await updateGoal(selected);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-zinc-200 p-8">
        <h1 className="text-2xl font-semibold text-zinc-900 mb-2 text-center">
          What's your main goal?
        </h1>
        <p className="text-zinc-500 text-center mb-8">
          This will tailor your daily workouts. You can change it later.
        </p>

        <div className="space-y-4 mb-8">
          {goals.map((g) => {
            const Icon = g.icon;
            const isSelected = selected === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelected(g.id)}
                className={`w-full flex items-center p-4 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? 'border-zinc-900 bg-zinc-50'
                    : 'border-zinc-100 hover:border-zinc-200 bg-white'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                    isSelected ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className={`font-medium ${isSelected ? 'text-zinc-900' : 'text-zinc-700'}`}>
                    {g.title}
                  </h3>
                  <p className="text-sm text-zinc-500">{g.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleSave}
          disabled={!selected || loading}
          className="w-full bg-zinc-900 text-white py-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
        >
          {loading ? 'Saving...' : 'Get Started'}
        </button>
        
        <button
          onClick={async () => {
             await logout();
             navigate('/login');
          }}
          className="w-full mt-4 bg-transparent text-zinc-500 py-2 rounded-xl text-sm font-medium hover:text-zinc-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
