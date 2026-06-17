import Link from "next/link";
import { GraduationCap, Users, Calendar, DollarSign, BarChart3, BookOpen, CheckCircle2, ArrowRight, Menu, Star, Zap, Shield, Clock } from "lucide-react";

const features = [
  { icon: <Users size={22} />, title: "Student Management", desc: "Complete student profiles with attendance, test scores, and fee history in one place.", color: "text-brand-400 bg-brand-500/10" },
  { icon: <Calendar size={22} />, title: "Attendance Tracking", desc: "Mark daily attendance with P/A/L in seconds. Monthly PDF reports auto-generated.", color: "text-cyan-400 bg-cyan-500/10" },
  { icon: <DollarSign size={22} />, title: "Fee Management", desc: "Track monthly fees, mark payments, and view yearly fee records by class.", color: "text-emerald-400 bg-emerald-500/10" },
  { icon: <BookOpen size={22} />, title: "Tests & Results", desc: "Create tests, enter marks with live percentages, and rank students instantly.", color: "text-violet-400 bg-violet-500/10" },
  { icon: <BarChart3 size={22} />, title: "Analytics & Reports", desc: "Visual performance trends, subject-wise averages, and shareable WhatsApp reports.", color: "text-amber-400 bg-amber-500/10" },
  { icon: <Shield size={22} />, title: "Role-Based Access", desc: "Admin and Teacher roles with fine-grained permissions. Fee data stays admin-only.", color: "text-rose-400 bg-rose-500/10" },
];

const stats = [
  { label: "Academies using AMS", value: "50+" },
  { label: "Students managed", value: "12,000+" },
  { label: "Reports generated", value: "48,000+" },
  { label: "Uptime guarantee", value: "99.9%" },
];

const testimonials = [
  { name: "Usman Khalid", role: "Principal, Beacon Academy", text: "AMS transformed how we manage our 3 branches. Fee tracking alone saves us hours every month.", stars: 5 },
  { name: "Fareeha Malik", role: "Director, Intellect Tuition", text: "The WhatsApp sharing feature is a game-changer. Parents love receiving instant result updates.", stars: 5 },
  { name: "Tariq Mehmood", role: "Admin, Star Institute", text: "Finally a system built for Pakistani academies. The Rupee-based fee module is perfect.", stars: 5 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface text-white overflow-x-hidden">
      {/* Background ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-brand-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-violet-600/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-50 border-b border-white/6 bg-surface/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-glow">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-bold text-white font-display">AMS</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-white/60">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors hidden sm:block">Sign In</Link>
            <Link href="/login" className="bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-glow hover:shadow-glow-lg">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 text-center overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 text-xs text-brand-400 font-medium mb-6">
            <Zap size={12} />Mobile-First · Multi-Class · Built for Pakistan
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display leading-tight mb-6">
            Manage Your Academy{" "}
            <span className="text-gradient">Smarter & Faster</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            A complete management system for private academies and tuition centers. Handle students, attendance, fees, and test results — all from your phone.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login" className="bg-brand-600 hover:bg-brand-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all shadow-glow hover:shadow-glow-lg flex items-center justify-center gap-2 text-sm">
              Start Free Demo <ArrowRight size={16} />
            </Link>
            <Link href="#features" className="bg-surface-3 hover:bg-surface-4 text-white font-medium px-7 py-3.5 rounded-xl transition-all border border-white/10 text-sm flex items-center justify-center gap-2">
              See Features
            </Link>
          </div>

          {/* Hero image mockup */}
          <div className="mt-16 relative">
            <div className="bg-surface-1 border border-white/10 rounded-2xl p-1 shadow-2xl max-w-3xl mx-auto">
              <div className="bg-surface-2 rounded-xl p-6">
                {/* Mock Dashboard */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="h-4 w-24 bg-white/10 rounded mb-1.5" />
                    <div className="h-3 w-16 bg-white/5 rounded" />
                  </div>
                  <div className="h-8 w-28 bg-brand-600/40 rounded-lg" />
                </div>
                <div className="grid grid-cols-5 gap-3 mb-5">
                  {[["Active Students", "132", "text-brand-400"], ["Classes", "5", "text-violet-400"], ["Tests", "24", "text-cyan-400"], ["Collected", "Rs. 486K", "text-emerald-400"], ["Due", "Rs. 42K", "text-rose-400"]].map(([label, val, color]) => (
                    <div key={label} className="bg-surface-3 rounded-xl p-3 text-center">
                      <div className={`text-sm font-bold font-display ${color}`}>{val}</div>
                      <div className="text-white/30 text-xs mt-0.5 truncate">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {["Take Attendance", "Add Student", "Manage Fees"].map(a => (
                    <div key={a} className="bg-surface-3 rounded-xl p-3 text-center text-xs text-white/40">{a}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -inset-px bg-gradient-to-t from-surface via-transparent to-transparent rounded-2xl pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-y border-white/6 bg-surface-1/50">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map(({ label, value }) => (
            <div key={label}>
              <div className="text-2xl font-bold font-display text-gradient">{value}</div>
              <div className="text-sm text-white/40 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">Everything your academy needs</h2>
            <p className="text-white/50 max-w-xl mx-auto">One system, all modules, zero spreadsheets.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon, title, desc, color }) => (
              <div key={title} className="glass-card p-6 hover:border-white/20 hover:shadow-card-hover transition-all duration-300 group">
                <div className={`inline-flex p-3 rounded-xl mb-4 ${color}`}>{icon}</div>
                <h3 className="font-bold text-white mb-2 font-display">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile-first highlight */}
      <section className="py-20 px-4 sm:px-6 bg-surface-1/40 border-y border-white/6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-3 py-1 text-xs text-cyan-400 mb-4">
              <Clock size={11} />Designed for mobile-first use
            </div>
            <h2 className="text-3xl font-bold font-display mb-4">Your phone is your office</h2>
            <p className="text-white/60 mb-6 leading-relaxed">AMS is built for teachers and admins who manage everything on their smartphones. Every screen is optimized for one-handed use with large touch targets and fast workflows.</p>
            <ul className="space-y-3">
              {["Mark attendance for 30 students in under 60 seconds", "Enter test marks with Tab/Enter keyboard flow", "WhatsApp results directly to parents from the app", "Works perfectly on any screen size"].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-white/70">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />{item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-56 h-96 bg-surface-1 border border-white/10 rounded-3xl p-3 shadow-2xl">
                <div className="bg-surface-2 rounded-2xl h-full p-4 space-y-3">
                  <div className="h-4 w-3/4 bg-white/10 rounded" />
                  <div className="grid grid-cols-2 gap-2">
                    {[["132", "Students", "text-brand-400"], ["5", "Classes", "text-violet-400"], ["24", "Tests", "text-cyan-400"], ["92%", "Attend.", "text-emerald-400"]].map(([v, l, c]) => (
                      <div key={l} className="bg-surface-3 rounded-xl p-2.5 text-center">
                        <div className={`text-base font-bold font-display ${c}`}>{v}</div>
                        <div className="text-white/30 text-xs">{l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {["Ahmad Irfan · Paid", "Ali Haider · Unpaid", "Zainab Malik · Paid"].map(s => (
                      <div key={s} className="bg-surface-3 rounded-lg px-3 py-2 text-xs text-white/50">{s}</div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -inset-4 bg-brand-500/5 rounded-3xl blur-xl -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold font-display text-center mb-12">Loved by academy administrators</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map(({ name, role, text, stars }) => (
              <div key={name} className="glass-card p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array(stars).fill(0).map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-white/70 leading-relaxed mb-4">&ldquo;{text}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-white">{name}</p>
                  <p className="text-xs text-white/40">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-2xl mx-auto glass-card p-12 border-brand-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-violet-600/10" />
          <div className="relative">
            <h2 className="text-3xl font-bold font-display mb-4">Ready to transform your academy?</h2>
            <p className="text-white/60 mb-8">Try the full demo with sample data — no account needed.</p>
            <Link href="/login" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-glow hover:shadow-glow-lg text-sm">
              Launch Demo <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/6 py-8 px-4 text-center text-xs text-white/30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-600/50 rounded-lg flex items-center justify-center"><GraduationCap size={12} /></div>
            <span>Academy Management System © {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-white/60 transition-colors">About</Link>
            <Link href="/pricing" className="hover:text-white/60 transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-white/60 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
