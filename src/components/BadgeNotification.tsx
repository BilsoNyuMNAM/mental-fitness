import React, { createContext, useContext, useState, useCallback } from 'react';
import { BadgeDefinition, TIER_COLORS } from '../services/badgeDefinitions';
import { CheckCircle } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BadgeNotification {
  id: string;
  definition: BadgeDefinition;
  type: 'toast' | 'modal';
}

interface GenericNotification {
  id: string;
  title: string;
  message?: string;
  icon?: any;
}

interface BadgeNotificationContextType {
  showBadgeEarned: (definition: BadgeDefinition) => void;
  showNotification: (title: string, message?: string, icon?: any) => void;
}

const BadgeNotificationContext = createContext<BadgeNotificationContextType | undefined>(undefined);

export const useBadgeNotification = () => {
  const context = useContext(BadgeNotificationContext);
  if (!context) throw new Error('useBadgeNotification must be used within BadgeNotificationProvider');
  return context;
};

// ─── Provider ────────────────────────────────────────────────────────────────

export const BadgeNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<BadgeNotification[]>([]);
  const [genericToasts, setGenericToasts] = useState<GenericNotification[]>([]);
  const [modal, setModal] = useState<BadgeNotification | null>(null);

  const showNotification = useCallback((title: string, message?: string, icon?: any) => {
    const id = `generic_${Date.now()}_${Math.random()}`;
    setGenericToasts(prev => [...prev, { id, title, message, icon }]);
    setTimeout(() => {
      setGenericToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const showBadgeEarned = useCallback((definition: BadgeDefinition) => {
    const id = `${definition.id}_${Date.now()}`;
    const notification: BadgeNotification = {
      id,
      definition,
      type: definition.isMajor ? 'modal' : 'toast',
    };

    if (definition.isMajor) {
      setModal(notification);
    } else {
      setToasts(prev => [...prev, notification]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4000);
    }
  }, []);

  return (
    <BadgeNotificationContext.Provider value={{ showBadgeEarned, showNotification }}>
      {children}

      {/* Toast Notifications */}
      <div style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        pointerEvents: 'none',
      }}>
        {genericToasts.map((toast) => (
          <GenericToast key={toast.id} notification={toast} onDismiss={() => setGenericToasts(prev => prev.filter(t => t.id !== toast.id))} />
        ))}
        {toasts.map((toast) => (
          <BadgeToast key={toast.id} notification={toast} onDismiss={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} />
        ))}
      </div>

      {/* Modal Celebration */}
      {modal && (
        <BadgeModal notification={modal} onDismiss={() => setModal(null)} />
      )}
    </BadgeNotificationContext.Provider>
  );
};

// ─── Toast Component ─────────────────────────────────────────────────────────

function BadgeToast({ notification, onDismiss }: { notification: BadgeNotification; onDismiss: () => void }) {
  const { definition } = notification;
  const Icon = definition.icon;
  const tierColor = TIER_COLORS[definition.tier];

  return (
    <>
      <style>{`
        @keyframes badgeToastSlideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes badgeToastShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
      <div
        style={{
          animation: 'badgeToastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          background: '#18181b',
          border: `1px solid ${tierColor.border}`,
          borderRadius: '1rem',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${tierColor.glow}`,
          pointerEvents: 'auto',
          cursor: 'pointer',
          minWidth: '280px',
          maxWidth: '380px',
        }}
        onClick={onDismiss}
      >
        <div style={{
          width: '2.75rem',
          height: '2.75rem',
          borderRadius: '0.75rem',
          background: tierColor.bg,
          border: `2px solid ${tierColor.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon style={{ width: '1.25rem', height: '1.25rem', color: tierColor.text }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: tierColor.border, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.125rem' }}>
            🏆 Badge Unlocked
          </div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'white', lineHeight: 1.3 }}>
            {definition.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.125rem' }}>
            {definition.description}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Modal Component ─────────────────────────────────────────────────────────

function BadgeModal({ notification, onDismiss }: { notification: BadgeNotification; onDismiss: () => void }) {
  const { definition } = notification;
  const Icon = definition.icon;
  const tierColor = TIER_COLORS[definition.tier];

  return (
    <>
      <style>{`
        @keyframes badgeModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes badgeModalScaleIn {
          from { transform: scale(0.8) translateY(20px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes badgeModalPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 ${tierColor.glow}; }
          50% { transform: scale(1.05); box-shadow: 0 0 40px 10px ${tierColor.glow}; }
        }
        @keyframes badgeModalSparkle {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(5deg) scale(1.1); }
          50% { transform: rotate(0deg) scale(1); }
          75% { transform: rotate(-5deg) scale(1.1); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes confettiFloat {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(300px) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          animation: 'badgeModalFadeIn 0.3s ease',
        }}
        onClick={onDismiss}
      >
        {/* Backdrop */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
        }} />

        {/* Confetti particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '30%',
              left: `${15 + Math.random() * 70}%`,
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              background: ['#eab308', '#8b5cf6', '#ef4444', '#3b82f6', '#10b981', '#f97316'][i % 6],
              animation: `confettiFloat ${1.5 + Math.random() * 2}s ease-out ${Math.random() * 0.5}s forwards`,
              opacity: 0.9,
            }}
          />
        ))}

        {/* Modal Card */}
        <div
          style={{
            position: 'relative',
            background: '#18181b',
            borderRadius: '1.5rem',
            padding: '2.5rem 2rem 2rem',
            maxWidth: '340px',
            width: '100%',
            textAlign: 'center',
            border: `2px solid ${tierColor.border}`,
            boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 60px ${tierColor.glow}`,
            animation: 'badgeModalScaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Badge Icon */}
          <div style={{
            width: '5rem',
            height: '5rem',
            borderRadius: '1.25rem',
            background: tierColor.bg,
            border: `3px solid ${tierColor.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            animation: 'badgeModalPulse 2s ease-in-out infinite',
          }}>
            <Icon style={{
              width: '2.25rem',
              height: '2.25rem',
              color: tierColor.text,
              animation: 'badgeModalSparkle 3s ease-in-out infinite',
            }} />
          </div>

          {/* Tier label */}
          <div style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            color: tierColor.border,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '0.5rem',
          }}>
            {definition.tier} {definition.category === 'challenge' ? 'Challenge' : 'Achievement'}
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: 'white',
            margin: '0 0 0.5rem',
            letterSpacing: '-0.02em',
          }}>
            🎉 {definition.name}
          </h2>

          {/* Description */}
          <p style={{
            fontSize: '0.875rem',
            color: '#a1a1aa',
            margin: '0 0 1.75rem',
            lineHeight: 1.5,
          }}>
            {definition.description}
          </p>

          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            style={{
              width: '100%',
              padding: '0.875rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: 'white',
              color: '#18181b',
              fontSize: '0.9375rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.2s, transform 0.1s',
              fontFamily: 'inherit',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#e4e4e7')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'white')}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Awesome!
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Generic Toast Component ────────────────────────────────────────────────

function GenericToast({ notification, onDismiss }: { notification: GenericNotification; onDismiss: () => void }) {
  const Icon = notification.icon || CheckCircle;

  return (
    <>
      <style>{`
        @keyframes badgeToastSlideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      <div
        style={{
          animation: 'badgeToastSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          background: '#18181b',
          border: `1px solid #27272a`,
          borderRadius: '1rem',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.875rem',
          boxShadow: `0 8px 32px rgba(0,0,0,0.3)`,
          pointerEvents: 'auto',
          cursor: 'pointer',
          minWidth: '280px',
          maxWidth: '380px',
        }}
        onClick={onDismiss}
      >
        <div style={{
          width: '2.75rem',
          height: '2.75rem',
          borderRadius: '0.75rem',
          background: '#059669',
          border: `2px solid #34d399`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'white', lineHeight: 1.3 }}>
            {notification.title}
          </div>
          {notification.message && (
            <div style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.125rem' }}>
              {notification.message}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
