# Codebase walkthrough and application flow diagram request

**Session ID:** ses_2efd10821ffeCAOx2JZLWT1kuD
**Created:** 3/21/2026, 5:06:46 PM
**Updated:** 3/21/2026, 5:09:37 PM

---

## User

can you explain the whole codebase in detail , if possible also draw out the flow of the application in paper

---

## Assistant (Build · claude-opus-4.5 · 91.1s)

I'll start by exploring the codebase to understand its structure and then provide a detailed explanation.

**Tool: task**

**Input:**
```json
{
  "description": "Explore codebase structure",
  "prompt": "Explore the codebase at /Users/bilsonyumnam/Desktop/daily-fitness thoroughly. I need to understand:\n\n1. The overall project structure - all directories and key files\n2. What type of application this is (web app, mobile app, API, etc.)\n3. The main technologies/frameworks used\n4. Key configuration files (package.json, tsconfig, etc.)\n5. The main entry points of the application\n6. All major components/modules and their purposes\n\nPlease provide a comprehensive overview of the entire codebase structure. Read key files like package.json, main configuration files, and scan through the directory structure. Return a detailed summary of what you find.",
  "subagent_type": "explore"
}
```

**Output:**
```
task_id: ses_2efd0e1fbffeHHZ8Iu743odYZE (for resuming to continue this task if needed)

<task_result>
I now have a complete picture of the codebase. Here is the comprehensive overview:

---

# Daily Fitness - Codebase Overview

## 1. Project Summary

**Daily Fitness** is a personal fitness and wellness web application that provides users with AI-generated daily workouts tailored to their fitness goals. Users can select a goal (Build Muscle, Weight Loss, or Improve Mood), receive fresh daily workouts, complete them at their own pace, and track progress over time.

---

## 2. Application Type

**Single Page Application (SPA) / Web App**
- Built with React 19
- Client-side rendered with Vite as the build tool
- Created for Google AI Studio platform
- Progressive web app capabilities implied

---

## 3. Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.0.0 | UI framework |
| React Router DOM | 7.13.1 | Client-side routing |
| TypeScript | 5.8.2 | Type safety |
| Tailwind CSS | 4.1.14 | Styling framework |
| Vite | 6.2.0 | Build tool & dev server |
| Recharts | 3.8.0 | Data visualization (progress charts) |
| Lucide React | 0.546.0 | Icon library |
| Motion | 12.23.24 | Animations |
| date-fns | 4.1.0 | Date manipulation |

### Backend / Services
| Technology | Version | Purpose |
|------------|---------|---------|
| Firebase | 12.11.0 | Backend-as-a-Service |
| Firebase Auth | - | Google authentication |
| Cloud Firestore | - | NoSQL database |
| @google/genai | 1.29.0 | Gemini AI for workout generation |

### Utilities
| Technology | Purpose |
|------------|---------|
| clsx | Conditional class names |
| tailwind-merge | Merging Tailwind classes |
| dotenv | Environment variables |

---

## 4. Project Structure

```
/Users/bilsonyumnam/Desktop/daily-fitness/
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── firebase-applet-config.json   # Firebase project configuration
├── firebase-blueprint.json   # Database schema blueprint
├── firestore.rules           # Firestore security rules
├── index.html                # HTML entry point
├── metadata.json             # App metadata for AI Studio
├── package.json              # Dependencies and scripts
├── package-lock.json         # Dependency lock file
├── README.md                 # Project documentation
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
├── node_modules/             # Dependencies
└── src/                      # Source code
    ├── main.tsx              # Application entry point
    ├── App.tsx               # Root component with routing
    ├── index.css             # Global styles (Tailwind import)
    ├── firebase.ts           # Firebase initialization
    ├── components/           # Reusable components
    │   ├── AuthContext.tsx   # Authentication context provider
    │   └── ErrorBoundary.tsx # Error boundary component
    ├── pages/                # Page components
    │   ├── Home.tsx          # Main dashboard
    │   ├── Login.tsx         # Login page
    │   ├── Onboarding.tsx    # Goal selection page
    │   └── WorkoutDetail.tsx # Individual workout view
    ├── services/             # Business logic
    │   └── workoutService.ts # Workout generation & management
    └── utils/                # Utility functions
        └── errorHandling.ts  # Firestore error handling
```

---

## 5. Key Configuration Files

### package.json
- **Scripts:**
  - `dev`: Runs development server on port 3000
  - `build`: Production build with Vite
  - `preview`: Preview production build
  - `clean`: Remove dist folder
  - `lint`: TypeScript type checking

### tsconfig.json
- Target: ES2022
- Module: ESNext
- JSX: react-jsx
- Path alias: `@/*` maps to project root
- Bundler module resolution

### vite.config.ts
- Plugins: React, Tailwind CSS
- Exposes `GEMINI_API_KEY` environment variable
- HMR can be disabled via environment variable

### firestore.rules
- Comprehensive security rules for Firestore
- Users can only read/write their own data
- Strict validation for User and Workout entities
- Immutable fields protected (uid, createdAt, etc.)

---

## 6. Main Entry Points

| File | Purpose |
|------|---------|
| `/index.html` | HTML template with root div |
| `/src/main.tsx` | React application bootstrap |
| `/src/App.tsx` | Root component with routing setup |

---

## 7. Application Architecture

### Routing Structure
| Route | Component | Access |
|-------|-----------|--------|
| `/login` | Login.tsx | Public |
| `/onboarding` | Onboarding.tsx | Authenticated, no goal set |
| `/` | Home.tsx | Protected (authenticated + goal set) |
| `/workout/:id` | WorkoutDetail.tsx | Protected |

### Authentication Flow
1. User lands on `/login`
2. Signs in with Google (Firebase Auth)
3. If no profile exists, creates new user document in Firestore
4. If no goal set, redirects to `/onboarding`
5. After goal selection, redirects to home dashboard

---

## 8. Major Components & Modules

### Components

#### AuthContext.tsx (`/src/components/AuthContext.tsx`)
- **Purpose:** Global authentication state management
- **Features:**
  - Google Sign-in/Sign-out
  - User profile management
  - Goal update functionality
  - Last active date tracking
- **Exports:** `AuthProvider`, `useAuth` hook, `UserProfile` interface

#### ErrorBoundary.tsx (`/src/components/ErrorBoundary.tsx`)
- **Purpose:** Catches and displays React errors gracefully
- **Features:**
  - Parses Firestore errors
  - Shows reload button
  - User-friendly error messages

### Pages

#### Login.tsx (`/src/pages/Login.tsx`)
- **Purpose:** Authentication entry point
- **Features:**
  - Google OAuth sign-in button
  - Automatic redirects based on auth state

#### Onboarding.tsx (`/src/pages/Onboarding.tsx`)
- **Purpose:** New user goal selection
- **Goals Available:**
  - Build Muscle (strength training)
  - Weight Loss (cardio, HIIT)
  - Improve Mood (yoga, stretching)

#### Home.tsx (`/src/pages/Home.tsx`)
- **Purpose:** Main dashboard
- **Features:**
  - Today's workout cards
  - Yesterday's completion status
  - Missed day alerts
  - 7-day progress chart (Recharts)
  - Real-time updates via Firestore snapshots

#### WorkoutDetail.tsx (`/src/pages/WorkoutDetail.tsx`)
- **Purpose:** Individual workout view
- **Features:**
  - YouTube video embed
  - Workout description
  - Duration and goal tags
  - Mark as complete functionality

### Services

#### workoutService.ts (`/src/services/workoutService.ts`)
- **Purpose:** Workout business logic
- **Key Functions:**
  - `generateDailyWorkouts()`: Fetches existing workouts or generates new ones via Gemini AI
  - `markWorkoutComplete()`: Updates workout completion status
- **AI Integration:** Uses Gemini 3 Flash Preview model with structured JSON output

### Utilities

#### errorHandling.ts (`/src/utils/errorHandling.ts`)
- **Purpose:** Standardized Firestore error handling
- **Features:**
  - Operation type categorization (CREATE, UPDATE, DELETE, LIST, GET, WRITE)
  - Captures auth context for debugging
  - Throws structured error objects

---

## 9. Database Schema (Firestore)

### Collections

#### `/users/{userId}`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| uid | string | Yes | User's unique ID |
| email | string | Yes | Email address |
| displayName | string | No | Display name |
| photoURL | string | No | Profile picture URL |
| goal | string | No | Fitness goal (enum) |
| createdAt | timestamp | Yes | Account creation time |
| lastActiveDate | string | No | YYYY-MM-DD format |

#### `/workouts/{workoutId}`
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | Owner user ID |
| date | string | Yes | YYYY-MM-DD format |
| title | string | Yes | Workout title |
| description | string | Yes | Workout description |
| videoUrl | string | No | YouTube video URL |
| durationMinutes | number | Yes | Duration in minutes |
| completed | boolean | Yes | Completion status |
| completedAt | timestamp | No | Completion time |
| goal | string | Yes | Target goal |

---

## 10. Key Features Summary

1. **Google Authentication** - Secure sign-in via Firebase Auth
2. **AI-Generated Workouts** - Fresh daily workouts using Gemini AI
3. **Goal-Based Personalization** - Workouts tailored to user goals
4. **Progress Tracking** - 7-day completion chart
5. **Video Integration** - YouTube workout video embeds
6. **Real-time Updates** - Firestore real-time listeners
7. **Mobile-Responsive Design** - Tailwind CSS responsive styling
8. **Error Handling** - Comprehensive error boundaries and logging

---

## 11. File Paths (Absolute)

### Configuration Files
- `/Users/bilsonyumnam/Desktop/daily-fitness/package.json`
- `/Users/bilsonyumnam/Desktop/daily-fitness/tsconfig.json`
- `/Users/bilsonyumnam/Desktop/daily-fitness/vite.config.ts`
- `/Users/bilsonyumnam/Desktop/daily-fitness/firebase-applet-config.json`
- `/Users/bilsonyumnam/Desktop/daily-fitness/firebase-blueprint.json`
- `/Users/bilsonyumnam/Desktop/daily-fitness/firestore.rules`
- `/Users/bilsonyumnam/Desktop/daily-fitness/.env.example`
- `/Users/bilsonyumnam/Desktop/daily-fitness/.gitignore`

### Source Files
- `/Users/bilsonyumnam/Desktop/daily-fitness/src/main.tsx`
- `/Users/bilsonyumnam/Desktop/daily-fitness/src/App.tsx`
- `/Users/bilsonyumnam/Desktop/daily-fitness/src/firebase.ts`
- `/Users/bilsonyumnam/Desktop/daily-fitness/src/index.css`
- `/Users/bilsonyumnam/Desktop/daily-fitness/src/components/AuthContext.tsx`
- `/Users/bilsonyumnam/Desktop/daily-fitness/src/components/ErrorBoundary.tsx`
- `/Users/bilsonyumnam/Desktop/daily-fitness/src/pages/Home.tsx`
- `/Users/bilsonyumnam/Desktop/daily-fitness/src/pages/Login.tsx`
- `/Users/bilsonyumnam/Desktop/daily-fitness/src/pages/Onboarding.tsx`
- `/Users/bilsonyumnam/Desktop/daily-fitness/src/pages/WorkoutDetail.tsx`
- `/Users/bilsonyumnam/Desktop/daily-fitness/src/services/workoutService.ts`
- `/Users/bilsonyumnam/Desktop/daily-fitness/src/utils/errorHandling.ts`

### Other Files
- `/Users/bilsonyumnam/Desktop/daily-fitness/index.html`
- `/Users/bilsonyumnam/Desktop/daily-fitness/metadata.json`
- `/Users/bilsonyumnam/Desktop/daily-fitness/README.md`

---

This is a well-structured, modern React application built specifically for the Google AI Studio platform, integrating Firebase for authentication and data persistence with Gemini AI for intelligent workout generation.
</task_result>
```

---

## Assistant (Build · claude-opus-4.5 · 3.5s)

Now let me read a few key files to understand the detailed flow better:

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/bilsonyumnam/Desktop/daily-fitness/src/App.tsx"
}
```

**Output:**
```
<path>/Users/bilsonyumnam/Desktop/daily-fitness/src/App.tsx</path>
<type>file</type>
<content>1: /**
2:  * @license
3:  * SPDX-License-Identifier: Apache-2.0
4:  */
5: 
6: import React from 'react';
7: import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
8: import { AuthProvider, useAuth } from './components/AuthContext';
9: import { ErrorBoundary } from './components/ErrorBoundary';
10: import Login from './pages/Login';
11: import Onboarding from './pages/Onboarding';
12: import Home from './pages/Home';
13: import WorkoutDetail from './pages/WorkoutDetail';
14: 
15: function ProtectedRoute({ children }: { children: React.ReactNode }) {
16:   const { user, profile, isAuthReady } = useAuth();
17: 
18:   if (!isAuthReady) {
19:     return (
20:       <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
21:         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
22:       </div>
23:     );
24:   }
25: 
26:   if (!user) {
27:     return <Navigate to="/login" />;
28:   }
29: 
30:   if (profile && !profile.goal) {
31:     return <Navigate to="/onboarding" />;
32:   }
33: 
34:   return <>{children}</>;
35: }
36: 
37: export default function App() {
38:   return (
39:     <ErrorBoundary>
40:       <AuthProvider>
41:         <BrowserRouter>
42:           <Routes>
43:             <Route path="/login" element={<Login />} />
44:             <Route path="/onboarding" element={<Onboarding />} />
45:             <Route
46:               path="/"
47:               element={
48:                 <ProtectedRoute>
49:                   <Home />
50:                 </ProtectedRoute>
51:               }
52:             />
53:             <Route
54:               path="/workout/:id"
55:               element={
56:                 <ProtectedRoute>
57:                   <WorkoutDetail />
58:                 </ProtectedRoute>
59:               }
60:             />
61:           </Routes>
62:         </BrowserRouter>
63:       </AuthProvider>
64:     </ErrorBoundary>
65:   );
66: }

(End of file - total 66 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/bilsonyumnam/Desktop/daily-fitness/src/components/AuthContext.tsx"
}
```

**Output:**
```
<path>/Users/bilsonyumnam/Desktop/daily-fitness/src/components/AuthContext.tsx</path>
<type>file</type>
<content>1: import React, { createContext, useContext, useEffect, useState } from 'react';
2: import { auth, db } from '../firebase';
3: import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
4: import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
5: import { handleFirestoreError, OperationType } from '../utils/errorHandling';
6: 
7: export interface UserProfile {
8:   uid: string;
9:   email: string;
10:   displayName: string;
11:   photoURL: string;
12:   goal: string;
13:   createdAt: any;
14:   lastActiveDate?: string;
15:   isAdmin?: boolean;
16: }
17: 
18: interface AuthContextType {
19:   user: User | null;
20:   profile: UserProfile | null;
21:   isAuthReady: boolean;
22:   login: () => Promise<void>;
23:   logout: () => Promise<void>;
24:   updateGoal: (goal: string) => Promise<void>;
25: }
26: 
27: const AuthContext = createContext<AuthContextType | undefined>(undefined);
28: 
29: export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
30:   const [user, setUser] = useState<User | null>(null);
31:   const [profile, setProfile] = useState<UserProfile | null>(null);
32:   const [isAuthReady, setIsAuthReady] = useState(false);
33: 
34:   useEffect(() => {
35:     const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
36:       setUser(firebaseUser);
37:       if (firebaseUser) {
38:         try {
39:           const userRef = doc(db, 'users', firebaseUser.uid);
40:           const userSnap = await getDoc(userRef);
41:           
42:           if (userSnap.exists()) {
43:             setProfile(userSnap.data() as UserProfile);
44:             
45:             // Update last active date
46:             const today = new Date().toISOString().split('T')[0];
47:             if (userSnap.data().lastActiveDate !== today) {
48:               await setDoc(userRef, { lastActiveDate: today }, { merge: true });
49:             }
50:           } else {
51:             const newProfile: UserProfile = {
52:               uid: firebaseUser.uid,
53:               email: firebaseUser.email || '',
54:               displayName: firebaseUser.displayName || '',
55:               photoURL: firebaseUser.photoURL || '',
56:               goal: '',
57:               createdAt: serverTimestamp(),
58:               lastActiveDate: new Date().toISOString().split('T')[0],
59:             };
60:             await setDoc(userRef, newProfile);
61:             setProfile(newProfile);
62:           }
63:         } catch (error) {
64:           handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
65:         }
66:       } else {
67:         setProfile(null);
68:       }
69:       setIsAuthReady(true);
70:     });
71: 
72:     return () => unsubscribe();
73:   }, []);
74: 
75:   const login = async () => {
76:     const provider = new GoogleAuthProvider();
77:     try {
78:       await signInWithPopup(auth, provider);
79:     } catch (error) {
80:       console.error('Login error:', error);
81:     }
82:   };
83: 
84:   const logout = async () => {
85:     await signOut(auth);
86:   };
87: 
88:   const updateGoal = async (goal: string) => {
89:     if (!user || !profile) return;
90:     try {
91:       const userRef = doc(db, 'users', user.uid);
92:       await setDoc(userRef, { goal }, { merge: true });
93:       setProfile({ ...profile, goal });
94:     } catch (error) {
95:       handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
96:     }
97:   };
98: 
99:   return (
100:     <AuthContext.Provider value={{ user, profile, isAuthReady, login, logout, updateGoal }}>
101:       {children}
102:     </AuthContext.Provider>
103:   );
104: };
105: 
106: export const useAuth = () => {
107:   const context = useContext(AuthContext);
108:   if (context === undefined) {
109:     throw new Error('useAuth must be used within an AuthProvider');
110:   }
111:   return context;
112: };

(End of file - total 112 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/bilsonyumnam/Desktop/daily-fitness/src/services/workoutService.ts"
}
```

**Output:**
```
<path>/Users/bilsonyumnam/Desktop/daily-fitness/src/services/workoutService.ts</path>
<type>file</type>
<content>1: import { db } from '../firebase';
2: import {
3:   collection, doc, setDoc, getDocs, getDoc,
4:   query, where, Timestamp, deleteDoc, updateDoc, addDoc
5: } from 'firebase/firestore';
6: import { handleFirestoreError, OperationType } from '../utils/errorHandling';
7: 
8: export interface Workout {
9:   id?: string;
10:   date: string;
11:   title: string;
12:   description: string;
13:   videoUrl?: string;
14:   durationMinutes: number;
15:   completed: boolean;
16:   completedAt?: any;
17:   goal: string;
18:   userId: string;
19: }
20: 
21: /** Fetch today's workouts for a specific user */
22: export async function fetchTodayWorkouts(userId: string, date: string): Promise<Workout[]> {
23:   try {
24:     const workoutsRef = collection(db, 'workouts');
25:     const q = query(workoutsRef, where('userId', '==', userId), where('date', '==', date));
26:     const snapshot = await getDocs(q);
27:     return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Workout));
28:   } catch (error) {
29:     handleFirestoreError(error, OperationType.GET, 'workouts');
30:     return [];
31:   }
32: }
33: 
34: /** Mark a workout as complete */
35: export async function markWorkoutComplete(workoutId: string, userId: string): Promise<void> {
36:   try {
37:     const workoutRef = doc(db, 'workouts', workoutId);
38:     await setDoc(workoutRef, {
39:       completed: true,
40:       completedAt: Timestamp.now(),
41:     }, { merge: true });
42:   } catch (error) {
43:     handleFirestoreError(error, OperationType.UPDATE, `workouts/${workoutId}`);
44:   }
45: }
46: 
47: // ─── Admin-only functions ────────────────────────────────────────────────────
48: 
49: /** Create a new workout (admin only) */
50: export async function createWorkout(workout: Omit<Workout, 'id'>): Promise<string> {
51:   try {
52:     const ref = await addDoc(collection(db, 'workouts'), {
53:       ...workout,
54:       completed: false,
55:     });
56:     return ref.id;
57:   } catch (error) {
58:     handleFirestoreError(error, OperationType.CREATE, 'workouts');
59:     throw error;
60:   }
61: }
62: 
63: /** Update an existing workout (admin only) */
64: export async function updateWorkout(workoutId: string, data: Partial<Workout>): Promise<void> {
65:   try {
66:     const workoutRef = doc(db, 'workouts', workoutId);
67:     await updateDoc(workoutRef, { ...data });
68:   } catch (error) {
69:     handleFirestoreError(error, OperationType.UPDATE, `workouts/${workoutId}`);
70:     throw error;
71:   }
72: }
73: 
74: /** Delete a workout (admin only) */
75: export async function deleteWorkout(workoutId: string): Promise<void> {
76:   try {
77:     await deleteDoc(doc(db, 'workouts', workoutId));
78:   } catch (error) {
79:     handleFirestoreError(error, OperationType.DELETE, `workouts/${workoutId}`);
80:     throw error;
81:   }
82: }
83: 
84: /** Fetch all workouts (admin only) */
85: export async function fetchAllWorkouts(): Promise<Workout[]> {
86:   try {
87:     const snapshot = await getDocs(collection(db, 'workouts'));
88:     return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Workout));
89:   } catch (error) {
90:     handleFirestoreError(error, OperationType.GET, 'workouts');
91:     return [];
92:   }
93: }

(End of file - total 93 lines)
</content>
```

---

## Assistant (Build · claude-opus-4.5 · 4.0s)

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/bilsonyumnam/Desktop/daily-fitness/src/pages/Home.tsx"
}
```

**Output:**
```
<path>/Users/bilsonyumnam/Desktop/daily-fitness/src/pages/Home.tsx</path>
<type>file</type>
<content>1: import React, { useEffect, useState } from 'react';
2: import { useAuth } from '../components/AuthContext';
3: import { fetchTodayWorkouts, Workout } from '../services/workoutService';
4: import { db } from '../firebase';
5: import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
6: import { format, subDays, parseISO } from 'date-fns';
7: import { Link } from 'react-router-dom';
8: import { Activity, CheckCircle, Clock, Flame, PlayCircle, AlertCircle, LayoutDashboard } from 'lucide-react';
9: import { handleFirestoreError, OperationType } from '../utils/errorHandling';
10: import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
11: 
12: export default function Home() {
13:   const { user, profile, logout } = useAuth();
14:   const [todayWorkouts, setTodayWorkouts] = useState<Workout[]>([]);
15:   const [yesterdayWorkouts, setYesterdayWorkouts] = useState<Workout[]>([]);
16:   const [loading, setLoading] = useState(true);
17:   const [progressData, setProgressData] = useState<{ date: string; completed: number }[]>([]);
18: 
19:   useEffect(() => {
20:     if (!user || !profile?.goal) return;
21: 
22:     const todayStr = format(new Date(), 'yyyy-MM-dd');
23:     const yesterdayStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
24: 
25:     const fetchWorkouts = async () => {
26:       setLoading(true);
27:       try {
28:         // Fetch today's workouts from Firestore
29:         const workouts = await fetchTodayWorkouts(user.uid, todayStr);
30:         setTodayWorkouts(workouts);
31: 
32:         // Fetch yesterday's workouts
33:         const workoutsRef = collection(db, 'workouts');
34:         const qYesterday = query(workoutsRef, where('userId', '==', user.uid), where('date', '==', yesterdayStr));
35:         const yesterdaySnap = await getDocs(qYesterday);
36:         setYesterdayWorkouts(yesterdaySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout)));
37: 
38:         // Fetch last 7 days for progress chart
39:         const last7Days = format(subDays(new Date(), 7), 'yyyy-MM-dd');
40:         const qProgress = query(workoutsRef, where('userId', '==', user.uid), where('date', '>=', last7Days));
41:         const progressSnap = await getDocs(qProgress);
42:         const allWorkouts = progressSnap.docs.map(doc => doc.data() as Workout);
43:         
44:         const chartData = [];
45:         for (let i = 6; i >= 0; i--) {
46:           const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
47:           const completedCount = allWorkouts.filter(w => w.date === d && w.completed).length;
48:           chartData.push({ date: format(parseISO(d), 'MMM d'), completed: completedCount });
49:         }
50:         setProgressData(chartData);
51: 
52:       } catch (error) {
53:         console.error('Error fetching workouts:', error);
54:       } finally {
55:         setLoading(false);
56:       }
57:     };
58: 
59:     fetchWorkouts();
60: 
61:     // Listen to today's workouts for real-time completion updates
62:     const qToday = query(collection(db, 'workouts'), where('userId', '==', user.uid), where('date', '==', todayStr));
63:     const unsubscribe = onSnapshot(qToday, (snapshot) => {
64:       if (!snapshot.empty) {
65:         setTodayWorkouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workout)));
66:       }
67:     }, (error) => {
68:       handleFirestoreError(error, OperationType.GET, 'workouts');
69:     });
70: 
71:     return () => unsubscribe();
72:   }, [user, profile]);
73: 
74:   if (loading) {
75:     return (
76:       <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
77:         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
78:       </div>
79:     );
80:   }
81: 
82:   const yesterdayCompleted = yesterdayWorkouts.filter(w => w.completed).length;
83:   const missedYesterday = yesterdayWorkouts.length > 0 && yesterdayCompleted === 0;
84: 
85:   return (
86:     <div className="min-h-screen bg-zinc-50 pb-20">
87:       <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
88:         <div className="flex items-center gap-3">
89:           <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
90:             <Activity className="w-5 h-5 text-white" />
91:           </div>
92:           <div>
93:             <h1 className="font-semibold text-zinc-900">Hello, {profile?.displayName?.split(' ')[0] || 'Friend'}</h1>
94:             <p className="text-xs text-zinc-500">Goal: {profile?.goal}</p>
95:           </div>
96:         </div>
97:         <div className="flex items-center gap-3">
98:           {profile?.isAdmin && (
99:             <Link
100:               to="/admin"
101:               className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg transition-colors"
102:             >
103:               <LayoutDashboard className="w-4 h-4" />
104:               Admin
105:             </Link>
106:           )}
107:           <button onClick={logout} className="text-sm font-medium text-zinc-500 hover:text-zinc-900">
108:             Sign out
109:           </button>
110:         </div>
111:       </header>
112: 
113:       <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
114:         
115:         {/* Missed Day Alert */}
116:         {missedYesterday && (
117:           <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3">
118:             <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
119:             <div>
120:               <h3 className="text-sm font-medium text-orange-900">You missed yesterday's workout</h3>
121:               <p className="text-sm text-orange-700 mt-1">No pressure! Today is a fresh start. Pick a workout below and get moving.</p>
122:             </div>
123:           </div>
124:         )}
125: 
126:         {/* Yesterday's Summary */}
127:         {!missedYesterday && yesterdayWorkouts.length > 0 && (
128:           <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
129:             <div className="flex items-center gap-3">
130:               <CheckCircle className="w-5 h-5 text-emerald-600" />
131:               <div>
132:                 <h3 className="text-sm font-medium text-emerald-900">Great job yesterday!</h3>
133:                 <p className="text-sm text-emerald-700">You completed {yesterdayCompleted} workout{yesterdayCompleted !== 1 ? 's' : ''}.</p>
134:               </div>
135:             </div>
136:           </div>
137:         )}
138: 
139:         {/* Today's Workouts */}
140:         <section>
141:           <div className="flex items-center justify-between mb-4">
142:             <h2 className="text-xl font-semibold text-zinc-900">Today's Plan</h2>
143:             <span className="text-sm font-medium text-zinc-500">{format(new Date(), 'EEEE, MMM d')}</span>
144:           </div>
145:           
146:           <div className="space-y-4">
147:             {todayWorkouts.map((workout) => (
148:               <Link
149:                 key={workout.id}
150:                 to={`/workout/${workout.id}`}
151:                 className={`block bg-white border rounded-2xl p-5 transition-all hover:shadow-md ${
152:                   workout.completed ? 'border-emerald-200 bg-emerald-50/30' : 'border-zinc-200'
153:                 }`}
154:               >
155:                 <div className="flex items-start justify-between">
156:                   <div className="flex-1 pr-4">
157:                     <div className="flex items-center gap-2 mb-2">
158:                       <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700">
159:                         <Clock className="w-3 h-3" />
160:                         {workout.durationMinutes} min
161:                       </span>
162:                       {workout.completed && (
163:                         <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
164:                           <CheckCircle className="w-3 h-3" />
165:                           Completed
166:                         </span>
167:                       )}
168:                     </div>
169:                     <h3 className={`font-semibold text-lg mb-1 ${workout.completed ? 'text-zinc-500 line-through' : 'text-zinc-900'}`}>
170:                       {workout.title}
171:                     </h3>
172:                     <p className="text-sm text-zinc-500 line-clamp-2">{workout.description}</p>
173:                   </div>
174:                   <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
175:                     workout.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-900 text-white'
176:                   }`}>
177:                     {workout.completed ? <CheckCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
178:                   </div>
179:                 </div>
180:               </Link>
181:             ))}
182:           </div>
183:         </section>
184: 
185:         {/* Progress Snapshot */}
186:         <section>
187:           <div className="flex items-center gap-2 mb-4">
188:             <Flame className="w-5 h-5 text-orange-500" />
189:             <h2 className="text-xl font-semibold text-zinc-900">7-Day Progress</h2>
190:           </div>
191:           <div className="bg-white border border-zinc-200 rounded-2xl p-6 h-64">
192:             <ResponsiveContainer width="100%" height="100%">
193:               <LineChart data={progressData}>
194:                 <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
195:                 <YAxis hide domain={[0, 'dataMax + 1']} />
196:                 <Tooltip 
197:                   cursor={{ stroke: '#e4e4e7', strokeWidth: 2 }}
198:                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
199:                 />
200:                 <Line 
201:                   type="monotone" 
202:                   dataKey="completed" 
203:                   stroke="#18181b" 
204:                   strokeWidth={3} 
205:                   dot={{ r: 4, fill: '#18181b', strokeWidth: 0 }} 
206:                   activeDot={{ r: 6, fill: '#18181b', stroke: '#fff', strokeWidth: 2 }} 
207:                 />
208:               </LineChart>
209:             </ResponsiveContainer>
210:           </div>
211:         </section>
212: 
213:       </main>
214:     </div>
215:   );
216: }

(End of file - total 216 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/bilsonyumnam/Desktop/daily-fitness/src/pages/Login.tsx"
}
```

**Output:**
```
<path>/Users/bilsonyumnam/Desktop/daily-fitness/src/pages/Login.tsx</path>
<type>file</type>
<content>1: import React from 'react';
2: import { useAuth } from '../components/AuthContext';
3: import { Navigate } from 'react-router-dom';
4: import { Activity } from 'lucide-react';
5: 
6: export default function Login() {
7:   const { user, profile, isAuthReady, login } = useAuth();
8: 
9:   if (!isAuthReady) {
10:     return (
11:       <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
12:         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
13:       </div>
14:     );
15:   }
16: 
17:   if (user) {
18:     if (profile && !profile.goal) {
19:       return <Navigate to="/onboarding" />;
20:     }
21:     return <Navigate to="/" />;
22:   }
23: 
24:   return (
25:     <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
26:       <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-zinc-200 p-8 text-center">
27:         <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
28:           <Activity className="w-8 h-8 text-white" />
29:         </div>
30:         <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-2">
31:           Your Daily Fitness
32:         </h1>
33:         <p className="text-zinc-500 mb-8">
34:           A simple, flexible, no-pressure fitness companion. Show up and workout at your own pace.
35:         </p>
36:         
37:         <button
38:           onClick={login}
39:           className="w-full flex items-center justify-center gap-3 bg-white border border-zinc-200 text-zinc-900 font-medium py-3.5 px-4 rounded-xl hover:bg-zinc-50 transition-colors"
40:         >
41:           <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
42:           Continue with Google
43:         </button>
44:       </div>
45:     </div>
46:   );
47: }

(End of file - total 47 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/bilsonyumnam/Desktop/daily-fitness/src/pages/Onboarding.tsx"
}
```

**Output:**
```
<path>/Users/bilsonyumnam/Desktop/daily-fitness/src/pages/Onboarding.tsx</path>
<type>file</type>
<content>1: import React, { useState } from 'react';
2: import { useAuth } from '../components/AuthContext';
3: import { Navigate, useNavigate } from 'react-router-dom';
4: import { Dumbbell, Scale, Smile } from 'lucide-react';
5: 
6: const goals = [
7:   { id: 'Build Muscle', title: 'Build Muscle', icon: Dumbbell, desc: 'Strength training and resistance' },
8:   { id: 'Weight Loss', title: 'Weight Loss', icon: Scale, desc: 'Cardio, HIIT, and calorie burn' },
9:   { id: 'Improve Mood', title: 'Improve Mood', icon: Smile, desc: 'Yoga, stretching, and light movement' },
10: ];
11: 
12: export default function Onboarding() {
13:   const { user, profile, isAuthReady, updateGoal } = useAuth();
14:   const navigate = useNavigate();
15:   const [selected, setSelected] = useState<string | null>(null);
16:   const [loading, setLoading] = useState(false);
17: 
18:   if (!isAuthReady) {
19:     return (
20:       <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
21:         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
22:       </div>
23:     );
24:   }
25: 
26:   if (!user) {
27:     return <Navigate to="/login" />;
28:   }
29: 
30:   if (profile?.goal) {
31:     return <Navigate to="/" />;
32:   }
33: 
34:   const handleSave = async () => {
35:     if (!selected) return;
36:     setLoading(true);
37:     await updateGoal(selected);
38:     navigate('/');
39:   };
40: 
41:   return (
42:     <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
43:       <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-zinc-200 p-8">
44:         <h1 className="text-2xl font-semibold text-zinc-900 mb-2 text-center">
45:           What's your main goal?
46:         </h1>
47:         <p className="text-zinc-500 text-center mb-8">
48:           This will tailor your daily workouts. You can change it later.
49:         </p>
50: 
51:         <div className="space-y-4 mb-8">
52:           {goals.map((g) => {
53:             const Icon = g.icon;
54:             const isSelected = selected === g.id;
55:             return (
56:               <button
57:                 key={g.id}
58:                 onClick={() => setSelected(g.id)}
59:                 className={`w-full flex items-center p-4 rounded-2xl border-2 transition-all ${
60:                   isSelected
61:                     ? 'border-zinc-900 bg-zinc-50'
62:                     : 'border-zinc-100 hover:border-zinc-200 bg-white'
63:                 }`}
64:               >
65:                 <div
66:                   className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
67:                     isSelected ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'
68:                   }`}
69:                 >
70:                   <Icon className="w-6 h-6" />
71:                 </div>
72:                 <div className="text-left">
73:                   <h3 className={`font-medium ${isSelected ? 'text-zinc-900' : 'text-zinc-700'}`}>
74:                     {g.title}
75:                   </h3>
76:                   <p className="text-sm text-zinc-500">{g.desc}</p>
77:                 </div>
78:               </button>
79:             );
80:           })}
81:         </div>
82: 
83:         <button
84:           onClick={handleSave}
85:           disabled={!selected || loading}
86:           className="w-full bg-zinc-900 text-white py-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-800 transition-colors"
87:         >
88:           {loading ? 'Saving...' : 'Get Started'}
89:         </button>
90:       </div>
91:     </div>
92:   );
93: }

(End of file - total 93 lines)
</content>
```

**Tool: read**

**Input:**
```json
{
  "filePath": "/Users/bilsonyumnam/Desktop/daily-fitness/src/pages/WorkoutDetail.tsx"
}
```

**Output:**
```
<path>/Users/bilsonyumnam/Desktop/daily-fitness/src/pages/WorkoutDetail.tsx</path>
<type>file</type>
<content>1: import React, { useEffect, useState } from 'react';
2: import { useParams, useNavigate } from 'react-router-dom';
3: import { useAuth } from '../components/AuthContext';
4: import { db } from '../firebase';
5: import { doc, getDoc, onSnapshot } from 'firebase/firestore';
6: import { Workout, markWorkoutComplete } from '../services/workoutService';
7: import { ArrowLeft, CheckCircle, Clock, PlayCircle } from 'lucide-react';
8: import { handleFirestoreError, OperationType } from '../utils/errorHandling';
9: 
10: export default function WorkoutDetail() {
11:   const { id } = useParams<{ id: string }>();
12:   const { user } = useAuth();
13:   const navigate = useNavigate();
14:   const [workout, setWorkout] = useState<Workout | null>(null);
15:   const [loading, setLoading] = useState(true);
16:   const [completing, setCompleting] = useState(false);
17: 
18:   useEffect(() => {
19:     if (!user || !id) return;
20: 
21:     const fetchWorkout = async () => {
22:       try {
23:         const docRef = doc(db, 'workouts', id);
24:         const docSnap = await getDoc(docRef);
25:         if (docSnap.exists()) {
26:           setWorkout({ id: docSnap.id, ...docSnap.data() } as Workout);
27:         } else {
28:           navigate('/');
29:         }
30:       } catch (error) {
31:         handleFirestoreError(error, OperationType.GET, `workouts/${id}`);
32:       } finally {
33:         setLoading(false);
34:       }
35:     };
36: 
37:     fetchWorkout();
38: 
39:     const unsubscribe = onSnapshot(doc(db, 'workouts', id), (docSnap) => {
40:       if (docSnap.exists()) {
41:         setWorkout({ id: docSnap.id, ...docSnap.data() } as Workout);
42:       }
43:     }, (error) => {
44:       handleFirestoreError(error, OperationType.GET, `workouts/${id}`);
45:     });
46: 
47:     return () => unsubscribe();
48:   }, [id, user, navigate]);
49: 
50:   const handleComplete = async () => {
51:     if (!id || !user) return;
52:     setCompleting(true);
53:     await markWorkoutComplete(id, user.uid);
54:     setCompleting(false);
55:     navigate('/');
56:   };
57: 
58:   if (loading || !workout) {
59:     return (
60:       <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
61:         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
62:       </div>
63:     );
64:   }
65: 
66:   const getEmbedUrl = (url?: string) => {
67:     if (!url) return '';
68:     const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
69:     const match = url.match(regExp);
70:     return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
71:   };
72: 
73:   return (
74:     <div className="min-h-screen bg-zinc-50 flex flex-col">
75:       <header className="bg-white border-b border-zinc-200 px-4 py-4 sticky top-0 z-10 flex items-center gap-4">
76:         <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-zinc-100 transition-colors">
77:           <ArrowLeft className="w-6 h-6 text-zinc-900" />
78:         </button>
79:         <h1 className="font-semibold text-zinc-900 flex-1 truncate">{workout.title}</h1>
80:       </header>
81: 
82:       <main className="flex-1 max-w-2xl mx-auto w-full p-6 flex flex-col">
83:         <div className="bg-zinc-900 rounded-3xl aspect-video w-full flex items-center justify-center mb-8 relative overflow-hidden">
84:           {workout.videoUrl ? (
85:             <iframe
86:               src={getEmbedUrl(workout.videoUrl)}
87:               title={workout.title}
88:               className="absolute inset-0 w-full h-full"
89:               allowFullScreen
90:             />
91:           ) : (
92:             <div className="text-center text-zinc-500">
93:               <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
94:               <p>Video coming soon</p>
95:             </div>
96:           )}
97:         </div>
98: 
99:         <div className="flex items-center gap-3 mb-6">
100:           <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-zinc-200 text-zinc-800">
101:             <Clock className="w-4 h-4" />
102:             {workout.durationMinutes} minutes
103:           </span>
104:           <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-zinc-200 text-zinc-800">
105:             Goal: {workout.goal}
106:           </span>
107:         </div>
108: 
109:         <h2 className="text-2xl font-bold text-zinc-900 mb-4">{workout.title}</h2>
110:         <p className="text-zinc-600 leading-relaxed mb-8 flex-1 whitespace-pre-wrap">
111:           {workout.description}
112:         </p>
113: 
114:         <div className="mt-auto pt-8">
115:           <button
116:             onClick={handleComplete}
117:             disabled={workout.completed || completing}
118:             className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-medium text-lg transition-all ${
119:               workout.completed
120:                 ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed'
121:                 : 'bg-zinc-900 text-white hover:bg-zinc-800 active:scale-[0.98]'
122:             }`}
123:           >
124:             {workout.completed ? (
125:               <>
126:                 <CheckCircle className="w-6 h-6" />
127:                 Completed
128:               </>
129:             ) : completing ? (
130:               'Marking...'
131:             ) : (
132:               'Mark as Complete'
133:             )}
134:           </button>
135:         </div>
136:       </main>
137:     </div>
138:   );
139: }

(End of file - total 139 lines)
</content>
```

---

## Assistant (Build · claude-opus-4.5 · 72.1s)

Now I have a comprehensive understanding of the codebase. Let me provide you with a detailed explanation and draw out the application flow.

---

# Daily Fitness - Complete Codebase Explanation

## Overview

**Daily Fitness** is a React-based single-page application (SPA) that provides users with personalized daily workout recommendations. It uses Firebase for authentication and data storage, and is styled with Tailwind CSS.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Tailwind CSS |
| **Routing** | React Router DOM 7.x |
| **Backend** | Firebase (Auth + Firestore) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Build Tool** | Vite |

---

## Project Structure

```
daily-fitness/
├── src/
│   ├── main.tsx              # Entry point - renders App
│   ├── App.tsx               # Root component with routing
│   ├── firebase.ts           # Firebase initialization
│   ├── index.css             # Tailwind CSS imports
│   │
│   ├── components/
│   │   ├── AuthContext.tsx   # Authentication state & logic
│   │   └── ErrorBoundary.tsx # Global error handler
│   │
│   ├── pages/
│   │   ├── Login.tsx         # Google sign-in page
│   │   ├── Onboarding.tsx    # Goal selection (new users)
│   │   ├── Home.tsx          # Main dashboard
│   │   └── WorkoutDetail.tsx # Individual workout view
│   │
│   ├── services/
│   │   └── workoutService.ts # Workout CRUD operations
│   │
│   └── utils/
│       └── errorHandling.ts  # Firestore error utilities
│
├── firestore.rules           # Database security rules
├── package.json              # Dependencies
└── vite.config.ts            # Build configuration
```

---

## Application Flow Diagram (ASCII Art)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           APPLICATION FLOW DIAGRAM                               │
└─────────────────────────────────────────────────────────────────────────────────┘

                                    ┌──────────────┐
                                    │   User Opens │
                                    │     App      │
                                    └──────┬───────┘
                                           │
                                           ▼
                              ┌────────────────────────┐
                              │      main.tsx          │
                              │  (React Entry Point)   │
                              └───────────┬────────────┘
                                          │
                                          ▼
                    ┌─────────────────────────────────────────┐
                    │                App.tsx                   │
                    │  ┌─────────────────────────────────────┐│
                    │  │         ErrorBoundary               ││
                    │  │  ┌────────────────────────────────┐ ││
                    │  │  │        AuthProvider            │ ││
                    │  │  │  ┌──────────────────────────┐  │ ││
                    │  │  │  │     BrowserRouter        │  │ ││
                    │  │  │  │         Routes           │  │ ││
                    │  │  │  └──────────────────────────┘  │ ││
                    │  │  └────────────────────────────────┘ ││
                    │  └─────────────────────────────────────┘│
                    └────────────────────┬────────────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
           ┌────────────────┐   ┌────────────────┐   ┌────────────────┐
           │   /login       │   │  /onboarding   │   │  / (home)      │
           │   Login.tsx    │   │  Onboarding.tsx│   │  Home.tsx      │
           └───────┬────────┘   └───────┬────────┘   └───────┬────────┘
                   │                    │                    │
                   │                    │                    │
                   └──────────┬─────────┴────────────────────┤
                              │                              │
                              ▼                              ▼
                    ┌──────────────────┐          ┌──────────────────┐
                    │  Firebase Auth   │          │  /workout/:id    │
                    │  (Google OAuth)  │          │ WorkoutDetail.tsx│
                    └──────────────────┘          └──────────────────┘


═══════════════════════════════════════════════════════════════════════════════════

                              AUTHENTICATION FLOW

═══════════════════════════════════════════════════════════════════════════════════

    ┌─────────────┐         ┌─────────────┐         ┌─────────────────┐
    │    User     │────────▶│  /login     │────────▶│ Google Sign-In  │
    │   (Guest)   │         │             │         │    Popup        │
    └─────────────┘         └─────────────┘         └────────┬────────┘
                                                             │
                     ┌───────────────────────────────────────┘
                     │
                     ▼
         ┌────────────────────────┐
         │   Firebase Auth        │
         │   onAuthStateChanged   │
         └───────────┬────────────┘
                     │
                     ▼
         ┌────────────────────────┐      ┌──────────────────┐
         │  Check Firestore       │──NO──▶│ Create New User  │
         │  User Document Exists? │      │ Document         │
         └───────────┬────────────┘      └─────────┬────────┘
                     │ YES                         │
                     ▼                             │
         ┌────────────────────────┐                │
         │  Load User Profile     │◀───────────────┘
         └───────────┬────────────┘
                     │
                     ▼
         ┌────────────────────────┐
         │  User has Goal set?    │
         └───────────┬────────────┘
                     │
           ┌─────────┴─────────┐
           │ NO                │ YES
           ▼                   ▼
    ┌──────────────┐    ┌──────────────┐
    │ /onboarding  │    │   / (Home)   │
    └──────────────┘    └──────────────┘


═══════════════════════════════════════════════════════════════════════════════════

                              DATA FLOW DIAGRAM

═══════════════════════════════════════════════════════════════════════════════════

                           ┌──────────────────┐
                           │    FIRESTORE     │
                           │    DATABASE      │
                           └────────┬─────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
    ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
    │  /users/{uid}   │   │ /workouts/{id}  │   │  (future)       │
    │                 │   │                 │   │                 │
    │ • uid           │   │ • userId        │   │                 │
    │ • email         │   │ • date          │   │                 │
    │ • displayName   │   │ • title         │   │                 │
    │ • photoURL      │   │ • description   │   │                 │
    │ • goal          │   │ • videoUrl      │   │                 │
    │ • createdAt     │   │ • durationMins  │   │                 │
    │ • lastActiveDate│   │ • completed     │   │                 │
    │ • isAdmin       │   │ • completedAt   │   │                 │
    │                 │   │ • goal          │   │                 │
    └────────┬────────┘   └────────┬────────┘   └─────────────────┘
             │                     │
             │                     │
             ▼                     ▼
    ┌─────────────────┐   ┌─────────────────┐
    │  AuthContext    │   │ workoutService  │
    │                 │   │                 │
    │ • login()       │   │ • fetchToday()  │
    │ • logout()      │   │ • markComplete()│
    │ • updateGoal()  │   │ • createWorkout │
    │ • profile state │   │ • updateWorkout │
    └─────────────────┘   │ • deleteWorkout │
                          └─────────────────┘


═══════════════════════════════════════════════════════════════════════════════════

                           PAGE NAVIGATION FLOW

═══════════════════════════════════════════════════════════════════════════════════

                                                     ┌─────────────┐
                                              ┌──────│   LOGOUT    │
                                              │      └─────────────┘
                                              │
    ┌─────────┐      ┌─────────────┐      ┌───┴───────────┐      ┌─────────────────┐
    │  LOGIN  │─────▶│  ONBOARDING │─────▶│     HOME      │─────▶│  WORKOUT DETAIL │
    │         │      │             │      │               │      │                 │
    │ Google  │      │ Select Goal:│      │ • Today's     │      │ • Video Player  │
    │ Sign-In │      │ • Muscle    │      │   Workouts    │      │ • Description   │
    │         │      │ • Weight    │      │ • Yesterday   │      │ • Duration      │
    │         │      │ • Mood      │      │   Summary     │      │ • Mark Complete │
    │         │      │             │      │ • 7-Day Chart │      │                 │
    └─────────┘      └─────────────┘      └───────────────┘      └────────┬────────┘
         ▲                                        ▲                       │
         │                                        │                       │
         │                                        └───────────────────────┘
         │                                           (After completing)
         │
    ┌────┴────┐
    │  Not    │
    │  Authed │
    └─────────┘


═══════════════════════════════════════════════════════════════════════════════════

                              COMPONENT HIERARCHY

═══════════════════════════════════════════════════════════════════════════════════

    App.tsx
    │
    ├── ErrorBoundary ─────────────────── Catches React errors globally
    │   │
    │   └── AuthProvider ──────────────── Provides auth state to all children
    │       │
    │       └── BrowserRouter ─────────── Client-side routing
    │           │
    │           └── Routes
    │               │
    │               ├── /login ─────────── Login.tsx
    │               │   └── Google Sign-In Button
    │               │
    │               ├── /onboarding ────── Onboarding.tsx
    │               │   └── Goal Selection Cards (3 options)
    │               │
    │               ├── / ──────────────── ProtectedRoute → Home.tsx
    │               │   ├── Header (User info, Logout)
    │               │   ├── Yesterday Alert (if missed)
    │               │   ├── Today's Workouts (cards)
    │               │   └── 7-Day Progress Chart (Recharts)
    │               │
    │               └── /workout/:id ───── ProtectedRoute → WorkoutDetail.tsx
    │                   ├── Header (Back button, Title)
    │                   ├── Video Player (YouTube embed)
    │                   ├── Tags (Duration, Goal)
    │                   ├── Description
    │                   └── Mark Complete Button


═══════════════════════════════════════════════════════════════════════════════════

                              WORKOUT LIFECYCLE

═══════════════════════════════════════════════════════════════════════════════════

    ┌──────────────────┐
    │  Admin Creates   │
    │  Workout in DB   │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │ Workout stored   │
    │ with:            │
    │ • date           │
    │ • userId         │
    │ • completed:false│
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  User opens      │◀──────────────┐
    │  Home page       │               │
    └────────┬─────────┘               │
             │                         │
             ▼                         │
    ┌──────────────────┐               │
    │ fetchTodayWorkouts()             │
    │ Query: userId +  │               │
    │        date      │               │
    └────────┬─────────┘               │
             │                         │
             ▼                         │
    ┌──────────────────┐               │
    │  Display         │               │
    │  Workout Cards   │               │
    └────────┬─────────┘               │
             │                         │
             ▼                         │
    ┌──────────────────┐               │
    │  User clicks     │               │
    │  workout card    │               │
    └────────┬─────────┘               │
             │                         │
             ▼                         │
    ┌──────────────────┐               │
    │  WorkoutDetail   │               │
    │  • Watch video   │               │
    │  • Read desc     │               │
    └────────┬─────────┘               │
             │                         │
             ▼                         │
    ┌──────────────────┐               │
    │  Click "Mark     │               │
    │  as Complete"    │               │
    └────────┬─────────┘               │
             │                         │
             ▼                         │
    ┌──────────────────┐               │
    │ markWorkoutComplete()            │
    │ • completed:true │               │
    │ • completedAt    │               │
    └────────┬─────────┘               │
             │                         │
             ▼                         │
    ┌──────────────────┐               │
    │  Redirect to     │───────────────┘
    │  Home            │
    └──────────────────┘

```

---

## Detailed Component Breakdown

### 1. Entry Point (`main.tsx`)
- Bootstraps the React application
- Renders `<App />` into the DOM root element

### 2. App Component (`App.tsx`)
- Wraps everything in `ErrorBoundary` for global error handling
- Provides authentication context via `AuthProvider`
- Sets up routing with 4 routes:
  - `/login` - Public login page
  - `/onboarding` - Goal selection (requires auth)
  - `/` - Home dashboard (protected)
  - `/workout/:id` - Workout details (protected)

### 3. ProtectedRoute Component
- Guards routes that require authentication
- Shows loading spinner while auth state resolves
- Redirects to `/login` if not authenticated
- Redirects to `/onboarding` if no goal is set

### 4. AuthContext (`AuthContext.tsx`)
**State:**
- `user` - Firebase User object
- `profile` - User's Firestore profile
- `isAuthReady` - Whether auth state has been determined

**Functions:**
- `login()` - Opens Google sign-in popup
- `logout()` - Signs out the user
- `updateGoal()` - Updates user's fitness goal

**Lifecycle:**
1. Listens to `onAuthStateChanged`
2. When user authenticates, fetches/creates profile in Firestore
3. Updates `lastActiveDate` daily
4. Makes auth state available to all components via `useAuth()` hook

### 5. Login Page (`Login.tsx`)
- Simple UI with Google sign-in button
- Automatic redirects based on auth state:
  - Has user + no goal → `/onboarding`
  - Has user + goal → `/`

### 6. Onboarding Page (`Onboarding.tsx`)
- Displays 3 fitness goal options:
  - **Build Muscle** - Strength training
  - **Weight Loss** - Cardio/HIIT
  - **Improve Mood** - Yoga/stretching
- Saves selected goal to user profile
- Redirects to home after selection

### 7. Home Page (`Home.tsx`)
**Features:**
- Header with user info and logout
- Admin link (if user is admin)
- Yesterday's workout summary or missed alert
- Today's workout cards
- 7-day progress line chart

**Data Fetching:**
- Fetches today's workouts from Firestore
- Fetches yesterday's workouts for summary
- Fetches last 7 days for progress chart
- Sets up real-time listener for completion updates

### 8. WorkoutDetail Page (`WorkoutDetail.tsx`)
**Features:**
- YouTube video embed (extracts video ID from URL)
- Workout title and description
- Duration and goal tags
- "Mark as Complete" button

**Real-time Updates:**
- Listens for changes to the workout document
- UI updates instantly when marked complete

### 9. Workout Service (`workoutService.ts`)
**User Functions:**
- `fetchTodayWorkouts(userId, date)` - Gets workouts for a specific date
- `markWorkoutComplete(workoutId, userId)` - Marks workout as done

**Admin Functions:**
- `createWorkout()` - Creates new workout
- `updateWorkout()` - Modifies existing workout
- `deleteWorkout()` - Removes workout
- `fetchAllWorkouts()` - Gets all workouts (admin view)

---

## Database Schema

### Users Collection (`/users/{userId}`)
| Field | Type | Description |
|-------|------|-------------|
| uid | string | User's unique ID |
| email | string | Email address |
| displayName | string | Display name |
| photoURL | string | Profile picture URL |
| goal | string | "Build Muscle" / "Weight Loss" / "Improve Mood" |
| createdAt | timestamp | Account creation time |
| lastActiveDate | string | YYYY-MM-DD format |
| isAdmin | boolean | Admin access flag |

### Workouts Collection (`/workouts/{workoutId}`)
| Field | Type | Description |
|-------|------|-------------|
| userId | string | Owner user ID |
| date | string | YYYY-MM-DD format |
| title | string | Workout title |
| description | string | Instructions/details |
| videoUrl | string | YouTube video URL |
| durationMinutes | number | Duration in minutes |
| completed | boolean | Completion status |
| completedAt | timestamp | When completed |
| goal | string | Target fitness goal |

---

## Security (Firestore Rules)

The app uses Firestore security rules to ensure:
- Users can only read/write their own data
- Required fields are validated
- Immutable fields (uid, createdAt) cannot be changed after creation
- Admin users have additional permissions

---

This is a well-architected fitness application with clean separation of concerns, proper authentication flow, and real-time data synchronization. The codebase follows modern React patterns with hooks, context, and TypeScript for type safety.

---

