import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, QrCode, Shield, Zap, Users, Store, ChevronRight, Star, Sparkles, CheckCircle2, Clock, MapPin, CreditCard, Smartphone } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import AnimatedCounter from '../components/AnimatedCounter';
import FAQ from '../components/FAQ';
import TestimonialCarousel from '../components/TestimonialCarousel';

const TESTIMONIALS = [
  { name: 'Ananya Sharma', college: 'BMSIT', text: 'I literally save ₹200+ every week just on coffee and food. The QR thing is genius — no fumbling with codes or screenshots.', savings: '₹8,400+' },
  { name: 'Rahul Menon', college: 'RVCE', text: 'As someone who eats out almost daily, Artha has been a game-changer. The 30-second QR makes it feel like magic.', savings: '₹12,000+' },
  { name: 'Priya Desai', college: 'PES University', text: 'Love how fast it is. Sign in, pick a vendor, show QR, done. No ads, no spam, just discounts. Clean and simple.', savings: '₹5,200+' },
  { name: 'Karthik Reddy', college: 'Christ University', text: 'The vendor near my hostel gives 20% off through Artha. That adds up fast when you eat there 4 times a week.', savings: '₹15,000+' },
];

const FAQ_ITEMS = [
  { question: 'How does verification work?', answer: 'We verify your student status through your college email domain. Just sign in with your institutional Google account, and our system automatically confirms your enrollment. No manual approval needed.' },
  { question: 'Is there a subscription fee?', answer: 'Artha is 100% free for students. We partner with local vendors who see value in reaching the student community. You just sign in and start saving.' },
  { question: 'How do QR codes prevent misuse?', answer: 'Each QR code expires in 30 seconds and can only be used once. It cannot be screenshotted, shared, or reused. The vendor must scan it within the window, ensuring only verified students get discounts.' },
  { question: 'What types of vendors are on the platform?', answer: 'Cafes, restaurants, stationery shops, laundry services, gyms, salons, pharmacies, and more. We focus on businesses near college campuses that students actually use.' },
  { question: 'Can vendors join from any city?', answer: 'Currently we operate in Bangalore with partner colleges like BMSIT, RVCE, PES, Christ, and Jain University. We\'re expanding to more cities soon.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [qrCountdown, setQrCountdown] = useState(28);

  useEffect(() => {
    const timer = setInterval(() => {
      setQrCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleGetStarted = () => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'vendor') navigate('/vendor-portal');
      else navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white" data-testid="landing-page">
      {/* ════════════════ NAVBAR ════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/50" data-testid="landing-navbar">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#0F172A] flex items-center justify-center" style={{ borderRadius: '2px' }}>
              <span className="text-white font-heading font-bold text-sm">A</span>
            </div>
            <span className="font-heading font-bold text-xl tracking-tighter text-[#0F172A]">Artha</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-500 hover:text-[#0F172A] transition-colors font-medium">Features</a>
            <a href="#how-it-works" className="text-sm text-slate-500 hover:text-[#0F172A] transition-colors font-medium">How it works</a>
            <a href="#for-vendors" className="text-sm text-slate-500 hover:text-[#0F172A] transition-colors font-medium">For Vendors</a>
            <a href="#testimonials" className="text-sm text-slate-500 hover:text-[#0F172A] transition-colors font-medium">Reviews</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              data-testid="nav-login-btn"
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-slate-600 hover:text-[#0F172A] transition-colors px-3 py-1.5"
            >
              Log in
            </button>
            <button
              data-testid="nav-get-started-btn"
              onClick={handleGetStarted}
              className="text-sm font-medium bg-[#002FA7] text-white px-5 py-2 hover:bg-[#001D6C] transition-all active:scale-[0.97] btn-primary"
              style={{ borderRadius: '2px' }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ════════════════ HERO ════════════════ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 overflow-hidden" data-testid="hero-section">
        {/* Background */}
        <div className="absolute inset-0 dot-bg-hero" />
        <div className="blob blob-1" style={{ opacity: 0.15 }} />
        <div className="blob blob-2" style={{ opacity: 0.1 }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-7 anim-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#002FA710] border border-[#002FA720] text-[#002FA7] text-xs font-bold tracking-widest uppercase mb-6" style={{ borderRadius: '2px' }}>
                <Shield className="w-3.5 h-3.5" strokeWidth={2} />
                Verified Student Network
              </div>
              <h1 className="font-heading font-black text-5xl sm:text-6xl md:text-7xl tracking-tighter leading-[0.9] text-[#0F172A]">
                Your student ID<br />
                is now your<br />
                <span className="gradient-text">discount card.</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-slate-500 leading-relaxed max-w-xl font-body">
                Artha connects verified college students with exclusive discounts at local vendors. One scan. Real savings. No coupons needed.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  data-testid="hero-get-started-btn"
                  onClick={handleGetStarted}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#0F172A] text-white font-medium text-sm hover:bg-slate-800 transition-all btn-primary"
                  style={{ borderRadius: '2px' }}
                >
                  Start saving today
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </button>
                <button
                  data-testid="hero-vendor-btn"
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-slate-200 text-slate-600 font-medium text-sm hover:border-slate-900 hover:text-[#0F172A] transition-all"
                  style={{ borderRadius: '2px' }}
                >
                  I'm a vendor
                  <ChevronRight className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />5+ partner vendors</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-[#002FA7] rounded-full" />30-sec QR verification</span>
                <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />100% free for students</span>
              </div>
            </div>

            {/* Animated QR Card */}
            <div className="md:col-span-5 anim-fade-up-d2">
              <div className="relative">
                <div className="bg-white border border-slate-200 p-6 md:p-8 shadow-xl shadow-brand/5 glow-card animate-pulse-glow" style={{ borderRadius: '2px' }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-[#002FA710] flex items-center justify-center" style={{ borderRadius: '2px' }}>
                      <QrCode className="w-5 h-5 text-[#002FA7]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs tracking-widest uppercase font-bold text-slate-400">Active Discount</p>
                      <p className="text-sm font-heading font-bold text-[#0F172A]">The Brew Room</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-8 flex items-center justify-center scan-line-container" style={{ borderRadius: '2px' }}>
                    <div className="w-40 h-40 bg-[#0F172A] grid grid-cols-5 gap-0.5 p-3" style={{ borderRadius: '2px' }}>
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className={`${[0,1,3,4,5,9,10,14,15,19,20,21,23,24].includes(i) ? 'bg-white' : 'bg-[#0F172A]'}`} style={{ borderRadius: '1px' }} />
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> 15% OFF
                    </span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" strokeWidth={2} /> Expires in {qrCountdown}s
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 w-full bg-slate-100 h-1 overflow-hidden" style={{ borderRadius: '1px' }}>
                    <div
                      className="h-full bg-brand transition-all duration-1000 ease-linear"
                      style={{ width: `${(qrCountdown / 30) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="absolute -bottom-3 -right-3 w-full h-full border border-slate-200/50 -z-10" style={{ borderRadius: '2px' }} />
                <div className="absolute -bottom-6 -right-6 w-full h-full border border-slate-100/30 -z-20" style={{ borderRadius: '2px' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ TRUST LOGOS ════════════════ */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs tracking-widest uppercase font-bold text-slate-400 mb-6">Trusted by students from</p>
          <div className="flex items-center justify-center gap-10 md:gap-16 flex-wrap">
            {['BMSIT', 'RVCE', 'PES University', 'Christ University', 'Jain University'].map((name) => (
              <span key={name} className="font-heading font-bold text-slate-300 text-lg tracking-tight hover:text-slate-500 transition-colors cursor-default">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ STATS ════════════════ */}
      <ScrollReveal>
        <section className="py-16 md:py-20 px-6" data-testid="stats-section">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                { value: 500, suffix: '+', label: 'Active Students', icon: Users },
                { value: 25, suffix: '+', label: 'Partner Vendors', icon: Store },
                { value: 50, prefix: '₹', suffix: 'K+', label: 'Total Savings', icon: CreditCard },
                { value: 30, suffix: 's', label: 'QR Verification', icon: Zap },
              ].map((stat, i) => (
                <div key={i} className="text-center group">
                  <div className="w-12 h-12 mx-auto mb-3 bg-slate-50 flex items-center justify-center group-hover:bg-brand-50 transition-colors" style={{ borderRadius: '2px' }}>
                    <stat.icon className="w-5 h-5 text-slate-400 group-hover:text-brand transition-colors" strokeWidth={1.5} />
                  </div>
                  <div className="font-heading font-black text-3xl md:text-4xl tracking-tighter text-[#0F172A]">
                    <AnimatedCounter target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                  </div>
                  <p className="text-xs tracking-widest uppercase font-bold text-slate-400 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ════════════════ FEATURES ════════════════ */}
      <section id="features" className="py-20 md:py-28 px-6 bg-white" data-testid="features-section">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="max-w-xl mb-14">
              <p className="text-xs tracking-widest uppercase font-bold text-[#002FA7] mb-3">Features</p>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl tracking-tighter text-[#0F172A]">
                Everything you need.<br />Nothing you don't.
              </h2>
              <p className="mt-3 text-slate-500 leading-relaxed">
                A dead-simple system that just works. Verify once, save everywhere.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200">
            {[
              { icon: QrCode, title: 'Instant QR Discounts', desc: 'Generate a time-limited QR code. Show it to the vendor. Discount applied instantly. No coupons, no codes, no friction.' },
              { icon: Shield, title: 'Verified Students Only', desc: 'Access is restricted to verified college email domains. This keeps the network exclusive and valuable for vendors.' },
              { icon: Zap, title: '30-Second Expiry', desc: 'QR codes self-destruct in 30 seconds. One-time use. Cannot be shared, screenshotted, or reused. Bulletproof.' },
              { icon: Store, title: 'Local Vendor Network', desc: 'Discover cafes, restaurants, gyms, and more near your campus. Every vendor is vetted and offers real discounts.' },
              { icon: Users, title: 'Zero Setup for Students', desc: 'Sign in with your college Google account. That\'s it. No forms, no verification delays, no approval queues.' },
              { icon: Smartphone, title: 'Real-time Tracking', desc: 'Both students and vendors get instant transaction records. Full transparency on every discount redeemed.' },
            ].map((f, i) => (
              <ScrollReveal key={i} delay={i * 0.08}>
                <div className="bg-white p-8 md:p-10 group hover:bg-slate-50 transition-all h-full">
                  <div className="w-10 h-10 bg-slate-100 flex items-center justify-center mb-5 group-hover:bg-[#002FA710] transition-colors" style={{ borderRadius: '2px' }}>
                    <f.icon className="w-5 h-5 text-slate-600 group-hover:text-[#002FA7] transition-colors" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-heading font-bold text-lg tracking-tight text-[#0F172A] mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section id="how-it-works" className="py-20 md:py-28 px-6 bg-[#0F172A] relative overflow-hidden" data-testid="how-it-works-section">
        <div className="absolute inset-0 grid-bg opacity-5" />
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <p className="text-xs tracking-widest uppercase font-bold text-[#002FA7] mb-3">How it works</p>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl tracking-tighter text-white mb-14">
              Three steps. That's it.
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Sign in', desc: 'Use your college Google account. We verify your email domain automatically. No forms, no delays.', icon: Users },
              { step: '02', title: 'Find a vendor', desc: 'Browse nearby partner vendors. See what discounts are available right now. Filter by category.', icon: MapPin },
              { step: '03', title: 'Show your QR', desc: 'Tap "Get Discount" to generate a 30-second QR. Vendor scans it. Discount applied. Done.', icon: QrCode },
            ].map((s, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <div className="group relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-brand/20 group-hover:border-brand/30 transition-all" style={{ borderRadius: '2px' }}>
                      <s.icon className="w-5 h-5 text-slate-400 group-hover:text-brand-300 transition-colors" strokeWidth={1.5} />
                    </div>
                    <span className="font-heading font-black text-5xl tracking-tighter text-white/10">{s.step}</span>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-white mb-2 tracking-tight">{s.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-sm">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FOR VENDORS ════════════════ */}
      <section id="for-vendors" className="py-20 md:py-28 px-6" data-testid="for-vendors-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <ScrollReveal direction="left" className="md:col-span-5">
              <div className="bg-slate-50 border border-slate-200 p-2 relative overflow-hidden" style={{ borderRadius: '2px' }}>
                <img
                  src="https://images.unsplash.com/photo-1646624867902-b970108e9137?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA0MTJ8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb2ZmZWUlMjBzaG9wJTIwaW50ZXJpb3IlMjBjaGVja291dHxlbnwwfHx8fDE3NzY4Nzk2MDF8MA&ixlib=rb-4.1.0&q=85"
                  alt="Modern vendor interior"
                  className="w-full h-72 object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  style={{ borderRadius: '2px' }}
                />
                {/* Overlay stat card */}
                <div className="absolute bottom-6 left-6 right-6 glass p-4" style={{ borderRadius: '2px' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] tracking-widest uppercase font-bold text-slate-500">Avg. increase</p>
                      <p className="font-heading font-bold text-2xl tracking-tighter text-[#0F172A]">+35%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] tracking-widest uppercase font-bold text-slate-500">Student visits</p>
                      <p className="font-heading font-bold text-2xl tracking-tighter text-emerald-600">↑ Daily</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" className="md:col-span-7">
              <p className="text-xs tracking-widest uppercase font-bold text-[#002FA7] mb-3">For vendors</p>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl tracking-tighter text-[#0F172A]">
                Drive student footfall<br />with zero overhead.
              </h2>
              <p className="mt-4 text-slate-500 leading-relaxed max-w-lg">
                No app installation. No hardware. Just open your vendor portal, scan the student's QR code with your phone, and the discount is verified instantly.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  'Real-time dashboard with scan analytics',
                  'Camera-based QR scanner built into the portal',
                  'Full transaction history and unique user tracking',
                  'Zero integration cost — works from any browser',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" strokeWidth={2} />
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
              <button
                data-testid="vendor-signup-btn"
                onClick={() => navigate('/login')}
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-[#002FA7] text-white font-medium text-sm hover:bg-[#001D6C] transition-all btn-primary"
                style={{ borderRadius: '2px' }}
              >
                Join as a vendor
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ════════════════ TESTIMONIALS ════════════════ */}
      <ScrollReveal>
        <section id="testimonials" className="py-20 md:py-28 px-6 bg-slate-50/70 border-y border-slate-100" data-testid="testimonials-section">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs tracking-widest uppercase font-bold text-[#002FA7] mb-3">What students say</p>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl tracking-tighter text-[#0F172A]">
                Real savings. Real students.
              </h2>
            </div>
            <TestimonialCarousel testimonials={TESTIMONIALS} />
          </div>
        </section>
      </ScrollReveal>

      {/* ════════════════ FAQ ════════════════ */}
      <ScrollReveal>
        <section id="faq" className="py-20 md:py-28 px-6" data-testid="faq-section">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs tracking-widest uppercase font-bold text-[#002FA7] mb-3">FAQ</p>
              <h2 className="font-heading font-bold text-3xl sm:text-4xl tracking-tighter text-[#0F172A]">
                Common questions
              </h2>
            </div>
            <FAQ items={FAQ_ITEMS} />
          </div>
        </section>
      </ScrollReveal>

      {/* ════════════════ CTA ════════════════ */}
      <ScrollReveal>
        <section className="py-20 md:py-28 px-6 bg-[#0F172A] relative overflow-hidden" data-testid="cta-section">
          <div className="blob blob-1" style={{ opacity: 0.08, top: '-50%', right: '-20%' }} />
          <div className="blob blob-3" style={{ opacity: 0.06, bottom: '-30%', left: '-10%' }} />
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 text-brand-300 text-xs font-bold tracking-widest uppercase mb-6" style={{ borderRadius: '2px' }}>
              <Star className="w-3.5 h-3.5" strokeWidth={2} />
              Free for students
            </div>
            <h2 className="font-heading font-bold text-3xl sm:text-5xl tracking-tighter text-white leading-tight">
              Stop paying full price.
            </h2>
            <p className="mt-4 text-slate-400 leading-relaxed max-w-md mx-auto">
              Your college email is the only membership you need. Start discovering exclusive student discounts near your campus.
            </p>
            <button
              data-testid="cta-get-started-btn"
              onClick={handleGetStarted}
              className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0F172A] font-bold hover:bg-slate-100 transition-all active:scale-[0.97]"
              style={{ borderRadius: '2px' }}
            >
              Get started for free
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </section>
      </ScrollReveal>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="py-12 px-6 border-t border-slate-200 bg-white" data-testid="landing-footer">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 bg-[#0F172A] flex items-center justify-center" style={{ borderRadius: '2px' }}>
                  <span className="text-white font-heading font-bold text-xs">A</span>
                </div>
                <span className="font-heading font-bold text-lg tracking-tighter text-[#0F172A]">Artha</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
                A verified student discount network. Connecting college students with local vendors through secure, one-time QR discounts.
              </p>
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase font-bold text-slate-400 mb-3">Platform</p>
              <div className="space-y-2">
                {['Features', 'How it works', 'For Vendors', 'FAQ'].map((link) => (
                  <a key={link} href={`#${link.toLowerCase().replace(/\s/g, '-')}`} className="block text-sm text-slate-500 hover:text-[#0F172A] transition-colors">{link}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase font-bold text-slate-400 mb-3">Access</p>
              <div className="space-y-2">
                <button onClick={() => navigate('/login')} className="block text-sm text-slate-500 hover:text-[#0F172A] transition-colors">Student Login</button>
                <button onClick={() => navigate('/login')} className="block text-sm text-slate-500 hover:text-[#0F172A] transition-colors">Vendor Portal</button>
                <button onClick={() => navigate('/login')} className="block text-sm text-slate-500 hover:text-[#0F172A] transition-colors">Admin Panel</button>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">© 2025 Artha. A verified student discount network.</p>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              <span className="text-[10px] text-slate-400 font-medium">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
