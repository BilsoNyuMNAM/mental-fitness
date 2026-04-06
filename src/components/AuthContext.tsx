import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  goal: string;
  createdAt: any;
  lastActiveDate?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthReady: boolean;
  login: (rememberMe?: boolean) => Promise<void>;
  loginWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signupWithEmail: (email: string, password: string, displayName: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateGoal: (goal: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setProfile(userSnap.data() as UserProfile);

            // Update last active date
            const today = new Date().toISOString().split('T')[0];
            if (userSnap.data().lastActiveDate !== today) {
              await setDoc(userRef, { lastActiveDate: today }, { merge: true });
            }
          } else {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              goal: '',
              createdAt: serverTimestamp(),
              lastActiveDate: new Date().toISOString().split('T')[0],
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setProfile(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const login = async (rememberMe = false) => {
    const provider = new GoogleAuthProvider();
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string, rememberMe = false) => {
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Email login error:', error);
      throw error;
    }
  };

  const signupWithEmail = async (email: string, password: string, displayName: string, rememberMe = false) => {
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateGoal = async (goal: string) => {
    if (!user || !profile) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { goal }, { merge: true });
      setProfile({ ...profile, goal });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, isAuthReady, login, loginWithEmail, signupWithEmail, logout, updateGoal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
