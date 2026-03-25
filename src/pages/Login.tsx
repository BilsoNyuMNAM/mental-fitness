import React from 'react';
import { useAuth } from '../components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Login() {
  const { user, profile, isAuthReady, login } = useAuth();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  if (user) {
    if (profile && !profile.goal) {
      return <Navigate to="/onboarding" />;
    }
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-zinc-200 p-8 text-center">
        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Activity className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-2">
          Your Daily Fitness
        </h1>
        <p className="text-zinc-500 mb-8">
          A simple, flexible, no-pressure fitness companion. Show up and workout at your own pace.
        </p>

        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-3 bg-white border border-zinc-200 text-zinc-900 font-medium py-3.5 px-4 rounded-xl hover:bg-zinc-50 transition-colors"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
