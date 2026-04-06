import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { Navigate } from 'react-router-dom';
import { Activity, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const { user, profile, isAuthReady, login, loginWithEmail, signupWithEmail } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthReady) {
    return (
      <div className="login-page">
        <div className="login-spinner" />
      </div>
    );
  }

  if (user) {
    if (profile && !profile.goal) {
      return <Navigate to="/onboarding" />;
    }
    return <Navigate to="/" />;
  }

  const getFirebaseErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'auth/popup-closed-by-user':
        return '';
      default:
        return 'Something went wrong. Please try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError('Please enter your name.');
          setLoading(false);
          return;
        }
        await signupWithEmail(email, password, name, rememberMe);
      } else {
        await loginWithEmail(email, password, rememberMe);
      }
    } catch (err: any) {
      const message = getFirebaseErrorMessage(err?.code || '');
      if (message) setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login(rememberMe);
    } catch (err: any) {
      const message = getFirebaseErrorMessage(err?.code || '');
      if (message) setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-page {
          min-height: 100vh;
          background: #09090b;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          position: relative;
          overflow: hidden;
        }

        .login-page::before {
          content: '';
          position: absolute;
          top: -40%;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .login-spinner {
          width: 2rem;
          height: 2rem;
          border: 2px solid transparent;
          border-bottom-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
        }

        .login-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          margin-bottom: 2rem;
        }

        .login-logo-icon {
          width: 2.5rem;
          height: 2.5rem;
          background: white;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-logo-text {
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
          letter-spacing: -0.02em;
        }

        .login-box {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 1.25rem;
          padding: 2rem;
          backdrop-filter: blur(20px);
        }

        .login-heading {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          text-align: center;
          margin: 0 0 0.375rem;
          letter-spacing: -0.02em;
        }

        .login-subheading {
          font-size: 0.875rem;
          color: #71717a;
          text-align: center;
          margin: 0 0 1.75rem;
        }

        .login-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.15);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          margin-bottom: 1.25rem;
          font-size: 0.8125rem;
          color: #fca5a5;
          text-align: center;
        }

        .login-field {
          margin-bottom: 1rem;
        }

        .login-label {
          display: block;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #a1a1aa;
          margin-bottom: 0.375rem;
        }

        .login-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .login-input-icon {
          position: absolute;
          left: 0.875rem;
          color: #52525b;
          pointer-events: none;
          width: 1.125rem;
          height: 1.125rem;
        }

        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 0.75rem;
          padding: 0.75rem 0.875rem 0.75rem 2.75rem;
          font-size: 0.875rem;
          color: white;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-family: inherit;
        }

        .login-input:focus {
          border-color: rgba(249,115,22,0.4);
          box-shadow: 0 0 0 3px rgba(249,115,22,0.08);
        }

        .login-input::placeholder {
          color: #3f3f46;
        }

        .login-toggle-pw {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          color: #52525b;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .login-toggle-pw:hover {
          color: #a1a1aa;
        }

        .login-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .login-remember {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          user-select: none;
        }

        .login-checkbox {
          width: 1rem;
          height: 1rem;
          border: 1.5px solid rgba(255,255,255,0.15);
          border-radius: 0.25rem;
          background: rgba(255,255,255,0.03);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
          cursor: pointer;
        }

        .login-checkbox.checked {
          background: #f97316;
          border-color: #f97316;
        }

        .login-checkbox-mark {
          width: 0.625rem;
          height: 0.625rem;
          color: white;
          opacity: 0;
          transform: scale(0.5);
          transition: all 0.15s;
        }

        .login-checkbox.checked .login-checkbox-mark {
          opacity: 1;
          transform: scale(1);
        }

        .login-remember-text {
          font-size: 0.8125rem;
          color: #a1a1aa;
        }

        .login-submit {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: white;
          color: #09090b;
          font-weight: 600;
          font-size: 0.875rem;
          padding: 0.8125rem 1rem;
          border-radius: 0.75rem;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          font-family: inherit;
        }

        .login-submit:hover {
          background: #e4e4e7;
        }

        .login-submit:active {
          transform: scale(0.98);
        }

        .login-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .login-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .login-divider-text {
          font-size: 0.75rem;
          color: #52525b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
        }

        .login-google {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #d4d4d8;
          font-weight: 500;
          font-size: 0.875rem;
          padding: 0.8125rem 1rem;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          font-family: inherit;
        }

        .login-google:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(255,255,255,0.12);
        }

        .login-google:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-google img {
          width: 1.125rem;
          height: 1.125rem;
        }

        .login-switch {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.8125rem;
          color: #71717a;
        }

        .login-switch-btn {
          background: none;
          border: none;
          color: #f97316;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          font-size: 0.8125rem;
          font-family: inherit;
          transition: color 0.2s;
        }

        .login-switch-btn:hover {
          color: #fb923c;
        }

        .login-loading-spinner {
          width: 1.125rem;
          height: 1.125rem;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @media (max-width: 480px) {
          .login-box {
            padding: 1.5rem;
          }
          .login-heading {
            font-size: 1.25rem;
          }
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo-icon">
              <Activity style={{ width: '1.25rem', height: '1.25rem', color: '#09090b' }} />
            </div>
            <span className="login-logo-text">Your Daily Fitness</span>
          </div>

          <div className="login-box">
            {/* Heading */}
            <h1 className="login-heading">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="login-subheading">
              {isSignUp
                ? 'Start your fitness journey today'
                : 'Sign in to continue your fitness journey'}
            </p>

            {/* Error */}
            {error && <div className="login-error">{error}</div>}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* Name (signup only) */}
              {isSignUp && (
                <div className="login-field">
                  <label className="login-label" htmlFor="login-name">Full Name</label>
                  <div className="login-input-wrap">
                    <User className="login-input-icon" />
                    <input
                      id="login-name"
                      className="login-input"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="login-field">
                <label className="login-label" htmlFor="login-email">Email</label>
                <div className="login-input-wrap">
                  <Mail className="login-input-icon" />
                  <input
                    id="login-email"
                    className="login-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-field">
                <label className="login-label" htmlFor="login-password">Password</label>
                <div className="login-input-wrap">
                  <Lock className="login-input-icon" />
                  <input
                    id="login-password"
                    className="login-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    style={{ paddingRight: '2.75rem' }}
                  />
                  <button
                    type="button"
                    className="login-toggle-pw"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword
                      ? <EyeOff style={{ width: '1.125rem', height: '1.125rem' }} />
                      : <Eye style={{ width: '1.125rem', height: '1.125rem' }} />
                    }
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="login-options">
                <label className="login-remember" onClick={() => setRememberMe(!rememberMe)}>
                  <div className={`login-checkbox ${rememberMe ? 'checked' : ''}`}>
                    <svg className="login-checkbox-mark" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="login-remember-text">Remember me</span>
                </label>
              </div>

              {/* Submit */}
              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? (
                  <div className="login-loading-spinner" />
                ) : (
                  <>
                    {isSignUp ? 'Create account' : 'Sign in'}
                    <ArrowRight style={{ width: '1rem', height: '1rem' }} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="login-divider">
              <div className="login-divider-line" />
              <span className="login-divider-text">or</span>
              <div className="login-divider-line" />
            </div>

            {/* Google */}
            <button
              type="button"
              className="login-google"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
              Continue with Google
            </button>
          </div>

          {/* Switch login / signup */}
          <div className="login-switch">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button className="login-switch-btn" onClick={() => { setIsSignUp(false); setError(''); }}>
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button className="login-switch-btn" onClick={() => { setIsSignUp(true); setError(''); }}>
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
