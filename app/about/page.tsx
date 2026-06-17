import Link from "next/link";
import { GraduationCap, ArrowRight, Users, Target, Heart, Zap, Globe, Award } from "lucide-react";

const team = [
  { name: "Ahmad Raza", role: "Founder & CEO", bg: "from-brand-500 to-brand-700" },
  { name: "Sara Nawaz", role: "Product Lead", bg: "from-violet-500 to-purple-700" },
  { name: "Hassan Ali", role: "Lead Engineer", bg: "from-cyan-500 to-blue-600" },
  { name: "Fatima Zahra", role: "UX Designer", bg: "from-rose-500 to-pink-700" },
];

const values = [
  { icon: <Target size={20} />, title: "Built for Pakistan", desc: "Every feature is designed for the specific workflows of Pakistani private academies and tuition centers.", color: "text-brand-400 bg-brand-500/10" },
  { icon: <Zap size={20} />, title: "Speed First", desc: "We obsess over performance. Teachers should mark attendance for a whole class in under a minute.", color: "text-amber-400 bg-amber-500/10" },
  { icon: <Heart size={20} />, title: "Teacher-Centric", desc: "We work closely with real teachers and admins to build tools they actually want to use every day.", color: "text-rose-400 bg-rose-500/10" },
  { icon: <Globe size={20} />, title: "Privacy First", desc: "Student data stays yours. We never sell data, run ads, or access your academy without permission.", color: "text-emerald-400 bg-emerald-500/10" },
];

const milestones = [
  { year: "2022", label: "Founded in Lahore, Pakistan" },
  { year: "2023", label: "First 10 academies onboarded" },
  { year: "2024", label: "Launched multi-class & role-based access" },
  { year: "2025", label: "50+ academies, 12,000+ students managed" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-brand-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-violet-600/6 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-50 border-b border-white/6 bg-surface/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-glow">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-bold text-white font-display">AMS</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
            <Link href="/#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/about" className="text-white">About</Link>
          </div>
          <Link href="/login" className="bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-glow">
            Get Started
          </Link>
        </div>
      </nav>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-24">

        {/* Hero */}
        <section className="text-center">
          <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-full px-4 py-1.5 text-xs text-rose-400 font-medium mb-6">
            <Heart size={12} />Made with care in Pakistan
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
            We build tools that make<br /><span className="text-gradient">teaching easier</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            AMS was born out of frustration with spreadsheets and paper registers. We set out to build the management system we wish existed — one that actually fits how Pakistani academies work.
          </p>
        </section>

        {/* Mission */}
        <section className="glass-card p-10 border-brand-500/20 bg-brand-500/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/5 to-transparent" />
          <div className="relative flex items-start gap-6">
            <div className="p-4 bg-brand-500/15 rounded-2xl text-brand-400 shrink-0">
              <Target size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display mb-3">Our Mission</h2>
              <p className="text-white/70 leading-relaxed text-lg">
                To give every private academy in Pakistan — regardless of size — access to professional-grade management software that saves time, reduces errors, and helps educators focus on what matters most: teaching.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-2xl font-bold font-display text-center mb-10">What we stand for</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {values.map(({ icon, title, desc, color }) => (
              <div key={title} className="glass-card p-6 hover:border-white/20 transition-all duration-300">
                <div className={`inline-flex p-3 rounded-xl mb-4 ${color}`}>{icon}</div>
                <h3 className="font-bold text-white mb-2 font-display">{title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-2xl font-bold font-display text-center mb-10">Our journey</h2>
          <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
            {milestones.map(({ year, label }, i) => (
              <div key={year} className="relative flex items-start gap-5">
                <div className="absolute -left-5 w-4 h-4 bg-brand-600 rounded-full border-2 border-surface shadow-glow shrink-0 mt-0.5" />
                <div className="text-xs font-bold text-brand-400 w-10 pt-0.5 shrink-0">{year}</div>
                <div className="glass-card px-4 py-3 flex-1">
                  <p className="text-sm font-medium text-white/80">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Team */}
        <section>
          <h2 className="text-2xl font-bold font-display text-center mb-10">The team behind AMS</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {team.map(({ name, role, bg }) => (
              <div key={name} className="glass-card p-5 text-center hover:border-white/20 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${bg} flex items-center justify-center font-bold text-lg mx-auto mb-3`}>
                  {name.split(" ").map(n => n[0]).join("")}
                </div>
                <p className="font-semibold text-white text-sm">{name}</p>
                <p className="text-xs text-white/40 mt-0.5">{role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="glass-card p-8 text-center">
          <h2 className="text-2xl font-bold font-display mb-8">By the numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[["50+", "Academies"], ["12K+", "Students"], ["48K+", "Reports"], ["99.9%", "Uptime"]].map(([val, label]) => (
              <div key={label}>
                <div className="text-3xl font-bold font-display text-gradient mb-1">{val}</div>
                <div className="text-sm text-white/40">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-bold font-display mb-4">Join the AMS community</h2>
          <p className="text-white/60 mb-6">Give your academy the system it deserves.</p>
          <Link href="/login" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-glow hover:shadow-glow-lg text-sm">
            Try Free Demo <ArrowRight size={16} />
          </Link>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/6 py-8 px-4 text-center text-xs text-white/30 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Academy Management System © {new Date().getFullYear()}</span>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
            <Link href="/pricing" className="hover:text-white/60 transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-white/60 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
