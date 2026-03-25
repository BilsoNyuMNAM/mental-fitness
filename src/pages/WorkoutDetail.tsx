import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Workout, markWorkoutComplete } from '../services/workoutService';
import { ArrowLeft, CheckCircle, Clock, PlayCircle } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';
import { format } from 'date-fns';

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!user || !id) return;

    const unsubWorkout = onSnapshot(doc(db, 'workouts', id), (docSnap) => {
      if (docSnap.exists()) {
        setWorkout({ id: docSnap.id, ...docSnap.data() } as Workout);
      } else {
        navigate('/');
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `workouts/${id}`);
      setLoading(false);
    });

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const unsubCompletion = onSnapshot(doc(db, 'workout_completions', `${user.uid}_${id}_${todayStr}`), (docSnap) => {
      setCompleted(docSnap.exists());
    });

    return () => {
      unsubWorkout();
      unsubCompletion();
    };
  }, [id, user, navigate]);

  const handleComplete = async () => {
    if (!id || !user) return;
    setCompleting(true);
    await markWorkoutComplete(id, user.uid);
    setCompleting(false);
    navigate('/');
  };

  if (loading || !workout) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    );
  }

  const getEmbedUrl = (url?: string) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="bg-white border-b border-zinc-200 px-4 py-4 sticky top-0 z-10 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-zinc-100 transition-colors">
          <ArrowLeft className="w-6 h-6 text-zinc-900" />
        </button>
        <h1 className="font-semibold text-zinc-900 flex-1 truncate">{workout.title}</h1>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full p-6 flex flex-col">
        <div className="bg-zinc-900 rounded-3xl aspect-video w-full flex items-center justify-center mb-8 relative overflow-hidden">
          {workout.videoUrl ? (
            <iframe
              src={getEmbedUrl(workout.videoUrl)}
              title={workout.title}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
            />
          ) : (
            <div className="text-center text-zinc-500">
              <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Video coming soon</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-zinc-200 text-zinc-800">
            <Clock className="w-4 h-4" />
            {workout.durationMinutes} minutes
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-zinc-200 text-zinc-800">
            Goal: {workout.goal}
          </span>
        </div>

        <h2 className="text-2xl font-bold text-zinc-900 mb-4">{workout.title}</h2>
        <p className="text-zinc-600 leading-relaxed mb-8 flex-1 whitespace-pre-wrap">
          {workout.description}
        </p>

        <div className="mt-auto pt-8">
          <button
            onClick={handleComplete}
            disabled={completed || completing}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-medium text-lg transition-all ${
              completed
                ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
                : 'bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]'
            }`}
          >
            {completed ? (
              <>
                <CheckCircle className="w-6 h-6" />
                Completed
              </>
            ) : completing ? (
              'Marking...'
            ) : (
              'Mark as Complete'
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
