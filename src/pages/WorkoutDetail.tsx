import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Workout, markWorkoutComplete, isFavorited, addFavorite, removeFavorite } from '../services/workoutService';
import { ArrowLeft, CheckCircle, Clock, PlayCircle, Heart } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';
import { format } from 'date-fns';
import { evaluateAndAwardBadges } from '../services/badgeService';
import { updateChallengeProgress } from '../services/challengeService';
import { useBadgeNotification } from '../components/BadgeNotification';

export default function WorkoutDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showBadgeEarned, showNotification } = useBadgeNotification();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

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

    // Check favorite status
    isFavorited(user.uid, id).then(setIsFav);

    return () => {
      unsubWorkout();
      unsubCompletion();
    };
  }, [id, user, navigate]);

  const handleComplete = async () => {
    if (!id || !user) return;
    setCompleting(true);
    try {
      await markWorkoutComplete(id, user.uid);

      // Update challenge progress
      await updateChallengeProgress(user.uid);

      // Evaluate badges after completion
      const newBadges = await evaluateAndAwardBadges(user.uid);
      showNotification('Workout Completed!', 'Great job keeping up the consistency.');
      
      newBadges.forEach(b => showBadgeEarned(b.definition));

      navigate('/');
    } catch (error: any) {
      console.error('Completion Error:', error);
      alert('Error during completion: ' + error.message);
    } finally {
      setCompleting(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!id || !user) return;
    setFavLoading(true);
    try {
      if (isFav) {
        await removeFavorite(user.uid, id);
        setIsFav(false);
      } else {
        const source = workout?.userId === user.uid ? 'custom' : 'global';
        await addFavorite(user.uid, id, source);
        setIsFav(true);
      }
    } catch (err) {
      console.error('Favorite toggle error:', err);
    } finally {
      setFavLoading(false);
    }
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
        <button
          onClick={handleToggleFavorite}
          disabled={favLoading}
          className="p-2 rounded-full hover:bg-zinc-100 transition-colors"
          title={isFav ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className="w-5 h-5 transition-colors"
            style={{
              color: isFav ? '#ef4444' : '#a1a1aa',
              fill: isFav ? '#ef4444' : 'none',
            }}
          />
        </button>
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
