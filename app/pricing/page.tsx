"use client";
import Link from "next/link";
import { useState } from "react";
import { GraduationCap, CheckCircle2, X, ArrowRight, Zap, Shield, HeadphonesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Starter",
    tagline: "Perfect for small academies",
    monthlyPrice: 999,
    yearlyPrice: 799,
    color: "border-white/10",
    badge: null,
    features: [
      { text: "Up to 2 classes", included: true },
      { text: "Up to 50 students", included: true },
      { text: "Attendance tracking", included: true },
      { text: "Test & marks entry", included: true },
      { text: "Basic fee tracking", included: true },
      { text: "Monthly PDF reports", included: true },
      { text: "WhatsApp sharing", included: false },
      { text: "Fee Record (yearly)", included: false },
      { text: "Analytics & charts", included: false },
      { text: "Priority support", included: false },
    ],
    cta: "Get Started",
    ctaVariant: "secondary",
  },
  {
    name: "Academy",
    tagline: "For growing academies",
    monthlyPrice: 2499,
    yearlyPrice: 1999,
    color: "border-brand-500/40",
    badge: "Most Popular",
    highlight: true,
    features: [
      { text: "Unlimited classes", included: true },
      { text: "Up to 500 students", included: true },
      { text: "Attendance tracking", included: true },
      { text: "Test & marks entry", included: true },
      { text: "Full fee management", included: true },
      { text: "Monthly PDF reports", included: true },
      { text: "WhatsApp sharing", included: true },
      { text: "Fee Record (yearly)", included: true },
      { text: "Analytics & charts", included: true },
      { text: "Priority support", included: false },
    ],
    cta: "Start Free Trial",
    ctaVariant: "primary",
  },
  {
    name: "Institute",
    tagline: "For large institutes",
    monthlyPrice: 5999,
    yearlyPrice: 4799,
    color: "border-violet-500/30",
    badge: "Enterprise",
    features: [
      { text: "Unlimited classes", included: true },
      { text: "Unlimited students", included: true },
      { text: "Attendance tracking", included: true },
      { text: "Test & marks entry", included: true },
      { text: "Full fee management", included: true },
      { text: "Monthly PDF reports", included: true },
      { text: "WhatsApp sharing", included: true },
      { text: "Fee Record (yearly)", included: true },
      { text: "Analytics & charts", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Contact Sales",
    ctaVariant: "secondary",
  },
];

const faqs = [
  { q: "Is there a free trial?", a: "Yes! The Academy plan includes a 14-day free trial, no credit card required. You can also try the demo on our website any time." },
  { q: "Can I switch plans later?", a: "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle." },
  { q: "What payment methods do you accept?", a: "We accept bank transfers, EasyPaisa, JazzCash, and credit/debit cards. Monthly and yearly billing both available." },
  { q: "Is my data safe?", a: "Yes. All data is encrypted at rest and in transit. We host on secure Pakistani servers and never share your data with third parties." },
  { q: "Can multiple teachers use the same account?", a: "Yes. Each academy has one Admin login and one Teacher login shared among all teachers. Per-teacher accounts are on our roadmap." },
  { q: "What happens if I exceed my student limit?", a: "We'll notify you when you're at 90% capacity and give you time to upgrade before any restrictions apply." },
];

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="min-h-screen bg-surface text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 w-96 h-96 bg-brand-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-0 w-64 h-64 bg-violet-600/6 rounded-full blur-3xl" />
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
            <Link href="/pricing" className="text-white">Pricing</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
          </div>
          <Link href="/login" className="bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-glow">
            Get Started
          </Link>
        </div>
      </nav>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-20">

        {/* Header */}
        <section className="text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-xs text-emerald-400 font-medium mb-6">
            <Zap size={12} />Simple, transparent pricing in PKR
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
            Plans for every academy
          </h1>
          <p className="text-white/60 max-w-xl mx-auto mb-8">
            Start free, scale as you grow. No hidden fees, no setup costs, cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 bg-surface-2 p-1 rounded-xl">
            <button
              onClick={() => setBilling("monthly")}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all", billing === "monthly" ? "bg-brand-600 text-white shadow-glow" : "text-white/50 hover:text-white")}
            >Monthly</button>
            <button
              onClick={() => setBilling("yearly")}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2", billing === "yearly" ? "bg-brand-600 text-white shadow-glow" : "text-white/50 hover:text-white")}
            >
              Yearly
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-1.5 py-0.5 rounded-full font-semibold">Save 20%</span>
            </button>
          </div>
        </section>

        {/* Plans */}
        <section className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const price = billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            return (
              <div
                key={plan.name}
                className={cn(
                  "glass-card p-7 flex flex-col relative transition-all duration-300",
                  plan.highlight ? "border-brand-500/40 shadow-glow" : "hover:border-white/20",
                  plan.color
                )}
              >
                {plan.badge && (
                  <div className={cn(
                    "absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold",
                    plan.highlight ? "bg-brand-600 text-white shadow-glow" : "bg-violet-600/30 text-violet-400 border border-violet-500/30"
                  )}>
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-bold text-white text-lg font-display mb-1">{plan.name}</h3>
                  <p className="text-white/40 text-sm">{plan.tagline}</p>
                </div>

                <div className="mb-7">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold font-display text-white">Rs. {price.toLocaleString()}</span>
                    <span className="text-white/40 text-sm mb-1">/mo</span>
                  </div>
                  {billing === "yearly" && (
                    <p className="text-xs text-emerald-400 mt-1">Billed yearly · Save Rs. {((plan.monthlyPrice - plan.yearlyPrice) * 12).toLocaleString()}/yr</p>
                  )}
                </div>

                <ul className="space-y-3 flex-1 mb-7">
                  {plan.features.map(({ text, included }) => (
                    <li key={text} className="flex items-center gap-2.5 text-sm">
                      {included
                        ? <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                        : <X size={15} className="text-white/20 shrink-0" />}
                      <span className={included ? "text-white/80" : "text-white/30"}>{text}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/login" className={cn(
                  "w-full py-3 rounded-xl text-sm font-semibold text-center transition-all flex items-center justify-center gap-2",
                  plan.highlight
                    ? "bg-brand-600 hover:bg-brand-500 text-white shadow-glow hover:shadow-glow-lg"
                    : "bg-surface-3 hover:bg-surface-4 text-white border border-white/10"
                )}>
                  {plan.cta} <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </section>

        {/* Trust badges */}
        <section className="grid sm:grid-cols-3 gap-5">
          {[
            { icon: <Shield size={20} />, title: "Secure & Private", desc: "Bank-level encryption. Your data never leaves our Pakistani servers.", color: "text-emerald-400 bg-emerald-500/10" },
            { icon: <HeadphonesIcon size={20} />, title: "Local Support", desc: "Urdu & English support via WhatsApp, 9am–6pm PKT, Mon–Sat.", color: "text-brand-400 bg-brand-500/10" },
            { icon: <Zap size={20} />, title: "Instant Setup", desc: "Be up and running in under 10 minutes. No technical knowledge needed.", color: "text-amber-400 bg-amber-500/10" },
          ].map(({ icon, title, desc, color }) => (
            <div key={title} className="glass-card p-5 flex items-start gap-4">
              <div className={`p-2.5 rounded-xl shrink-0 ${color}`}>{icon}</div>
              <div>
                <p className="font-semibold text-white text-sm mb-1">{title}</p>
                <p className="text-xs text-white/50 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold font-display text-center mb-10">Frequently asked questions</h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {faqs.map(({ q, a }) => (
              <div key={q} className="glass-card p-5">
                <p className="font-semibold text-white text-sm mb-2">{q}</p>
                <p className="text-sm text-white/55 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="glass-card p-12 border-brand-500/20 bg-brand-500/5 relative overflow-hidden max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-600/8 to-violet-600/5" />
            <div className="relative">
              <h2 className="text-2xl font-bold font-display mb-3">Still have questions?</h2>
              <p className="text-white/60 mb-6 text-sm">Chat with us on WhatsApp or try the demo — no signup required.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-glow text-sm">
                  Try Free Demo <ArrowRight size={15} />
                </Link>
                <a href="https://wa.me/923001234567" className="inline-flex items-center justify-center gap-2 bg-surface-3 hover:bg-surface-4 text-white font-medium px-6 py-3 rounded-xl transition-all border border-white/10 text-sm">
                  WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/6 py-8 px-4 text-xs text-white/30 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Academy Management System © {new Date().getFullYear()}</span>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
            <Link href="/about" className="hover:text-white/60 transition-colors">About</Link>
            <Link href="/login" className="hover:text-white/60 transition-colors">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
