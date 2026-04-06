import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { motion } from 'motion/react';
import {
  Activity, ArrowRight, CheckCircle, Clock, Flame,
  Target, Trophy, Zap, Heart, BarChart3,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Target,
    title: 'Goal-Based Workouts',
    desc: 'Personalized routines matched to your fitness goals — muscle gain, weight loss, or general wellness.',
  },
  {
    icon: BarChart3,
    title: 'Track Progress',
    desc: 'Visual charts showing your 7-day streaks and workout completions at a glance.',
  },
  {
    icon: Clock,
    title: 'Time-Flexible',
    desc: 'Workouts from 10 to 60 minutes. No rigid schedules — move when it works for you.',
  },
  {
    icon: Heart,
    title: 'Zero Pressure',
    desc: 'Missed a day? No guilt trips. Just a gentle nudge to pick up where you left off.',
  },
];

const STEPS = [
  { num: '01', title: 'Sign up in seconds', desc: 'One-tap Google sign-in. No forms, no friction.' },
  { num: '02', title: 'Pick your goal', desc: 'Muscle gain, weight loss, or general fitness — your call.' },
  { num: '03', title: 'Get daily workouts', desc: 'Curated video workouts delivered every day, matched to your goal.' },
  { num: '04', title: 'Mark & track', desc: 'Tap complete, watch your progress graph climb.' },
];

export default function Landing() {
  const { user, profile, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
      </div>
    );
  }

  if (user) {
    if (profile && !profile.goal) return <Navigate to="/onboarding" />;
    return <Navigate to="/" />;
  }

  return (
    <div className="bg-zinc-950 text-white overflow-hidden">

      {/* ── Navigation ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-zinc-950/70 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-zinc-950" />
            </div>
            <span className="font-semibold text-sm tracking-tight">Your Daily Fitness</span>
          </div>
          <Link
            to="/login"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />

        {/* Accent glow — subtle, not a blob */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-orange-500/8 rounded-full blur-[120px] pointer-events-none" />

        <div
          className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
              <Zap className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-medium text-zinc-400">Free · No credit card required</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-[0.9] mb-6"
          >
            <span className="block">Show up.</span>
            <span className="block text-zinc-500">Move.</span>
            <span className="block">
              Feel <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">better</span>.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-zinc-500 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            A no-pressure fitness companion that meets you where you are.
            Daily video workouts tailored to your goals — no streaks to
            maintain, no guilt, just movement.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              to="/login"
              className="group flex items-center gap-2.5 bg-white text-zinc-950 font-semibold text-sm px-7 py-3.5 rounded-xl hover:bg-zinc-100 transition-all active:scale-[0.97]"
            >
              Start for free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-zinc-500 hover:text-white transition-colors px-5 py-3.5 rounded-xl hover:bg-white/5"
            >
              See how it works
            </a>
          </motion.div>

          {/* Social proof — subtle and real */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-16 flex items-center justify-center gap-6 text-xs text-zinc-600"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500/60" />
              <span>Google sign-in</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-700" />
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500/60" />
              <span>Video workouts</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-zinc-700" />
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500/60" />
              <span>Progress tracking</span>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border border-zinc-700 flex items-start justify-center p-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-zinc-500" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="py-32 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mb-20"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-400/80 mb-4">
              Why this app
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
              Built for people who want to move,<br />
              not perform.
            </h2>
            <p className="text-zinc-500 text-lg leading-relaxed">
              No leaderboards. No transformation photos. Just the tools you need
              to build a sustainable habit — on your own terms.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group bg-white/[0.02] border border-white/5 rounded-2xl p-7 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-5 group-hover:bg-orange-500/10 transition-colors duration-300">
                    <Icon className="w-5 h-5 text-zinc-400 group-hover:text-orange-400 transition-colors duration-300" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-32 relative">
        {/* Divider line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent to-zinc-800" />

        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-xl mx-auto mb-20"
          >
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-orange-400/80 mb-4">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Four steps. That's it.
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                <span className="text-[5rem] font-black text-white/[0.03] leading-none block -mb-6 select-none">
                  {s.num}
                </span>
                <h3 className="text-base font-semibold text-white mb-2 relative z-10">{s.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed relative z-10">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials / Trust ── */}
      <section className="py-32 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent to-zinc-800" />

        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-3xl p-10 sm:p-14 text-center"
          >
            <Flame className="w-8 h-8 text-orange-400/60 mx-auto mb-6" />
            <blockquote className="text-2xl sm:text-3xl font-semibold tracking-tight text-white leading-snug mb-6 max-w-2xl mx-auto">
              "The best workout is the one you actually do."
            </blockquote>
            <p className="text-sm text-zinc-500">
              This entire app is built around that idea. No judgment, no guilt — just
              consistency at your own pace.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Row ── */}
      <section className="py-20 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: '100%', label: 'Free to use' },
              { value: '<2 min', label: 'To get started' },
              { value: '∞', label: 'Workouts available' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-xs sm:text-sm text-zinc-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-32 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto px-6 text-center relative z-10"
        >
          <Trophy className="w-10 h-10 text-amber-400/40 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
            Ready to start?
          </h2>
          <p className="text-lg text-zinc-500 mb-10 max-w-md mx-auto leading-relaxed">
            No signup forms, no subscriptions.
            Just tap the button and begin.
          </p>
          <Link
            to="/login"
            className="group inline-flex items-center gap-2.5 bg-white text-zinc-950 font-semibold text-sm px-8 py-4 rounded-xl hover:bg-zinc-100 transition-all active:scale-[0.97]"
          >
            Get started — it's free
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/10 rounded-md flex items-center justify-center">
              <Activity className="w-3 h-3 text-white/60" />
            </div>
            <span className="text-xs text-zinc-600">Your Daily Fitness</span>
          </div>
          <p className="text-xs text-zinc-700">
            Built with care. No data sold. Ever.
          </p>
        </div>
      </footer>
    </div>
  );
}
