import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, QrCode, Shield, Zap, Users, Store, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

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
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 border-b border-slate-200/50" data-testid="landing-navbar">
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
              className="text-sm font-medium bg-[#002FA7] text-white px-5 py-2 hover:bg-[#001D6C] transition-all active:scale-[0.97]"
              style={{ borderRadius: '2px' }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-6" data-testid="hero-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-7 anim-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#002FA710] border border-[#002FA720] text-[#002FA7] text-xs font-bold tracking-widest uppercase mb-6" style={{ borderRadius: '2px' }}>
                <Shield className="w-3.5 h-3.5" strokeWidth={2} />
                Verified Student Network
              </div>
              <h1 className="font-heading font-black text-5xl sm:text-6xl md:text-7xl tracking-tighter leading-[0.9] text-[#0F172A]">
                Your student ID<br />
                is now your<br />
                <span className="text-[#002FA7]">discount card.</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-slate-500 leading-relaxed max-w-xl font-body">
                Artha connects verified college students with exclusive discounts at local vendors. One scan. Real savings. No coupons needed.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  data-testid="hero-get-started-btn"
                  onClick={handleGetStarted}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#0F172A] text-white font-medium text-sm hover:bg-slate-800 transition-all active:scale-[0.97]"
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
              </div>
            </div>
            <div className="md:col-span-5 anim-fade-up-d2">
              <div className="relative">
                <div className="bg-slate-50 border border-slate-200 p-6 md:p-8" style={{ borderRadius: '2px' }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-[#002FA710] flex items-center justify-center" style={{ borderRadius: '2px' }}>
                      <QrCode className="w-5 h-5 text-[#002FA7]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs tracking-widest uppercase font-bold text-slate-400">Active Discount</p>
                      <p className="text-sm font-heading font-bold text-[#0F172A]">The Brew Room</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 p-8 flex items-center justify-center" style={{ borderRadius: '2px' }}>
                    <div className="w-40 h-40 bg-[#0F172A] grid grid-cols-5 gap-0.5 p-3" style={{ borderRadius: '2px' }}>
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className={`${[0,1,3,4,5,9,10,14,15,19,20,21,23,24].includes(i) ? 'bg-white' : 'bg-[#0F172A]'}`} style={{ borderRadius: '1px' }} />
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 tracking-wider uppercase">15% OFF</span>
                    <span className="text-xs text-slate-400 font-mono">Expires in 28s</span>
                  </div>
                </div>
                <div className="absolute -bottom-3 -right-3 w-full h-full border border-slate-200 -z-10" style={{ borderRadius: '2px' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos / Trust */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs tracking-widest uppercase font-bold text-slate-400 mb-6">Trusted by students from</p>
          <div className="flex items-center justify-center gap-10 md:gap-16 flex-wrap">
            {['BMSIT', 'RVCE', 'PES University', 'Christ University', 'Jain University'].map((name) => (
              <span key={name} className="font-heading font-bold text-slate-300 text-lg tracking-tight">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28 px-6" data-testid="features-section">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-xl mb-14">
            <p className="text-xs tracking-widest uppercase font-bold text-[#002FA7] mb-3">Features</p>
            <h2 className="font-heading font-bold text-3xl sm:text-4xl tracking-tighter text-[#0F172A]">
              Everything you need.<br />Nothing you don't.
            </h2>
            <p className="mt-3 text-slate-500 leading-relaxed">
              A dead-simple system that just works. Verify once, save everywhere.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200">
            {[
              { icon: QrCode, title: 'Instant QR Discounts', desc: 'Generate a time-limited QR code. Show it to the vendor. Discount applied instantly. No coupons, no codes, no friction.' },
              { icon: Shield, title: 'Verified Students Only', desc: 'Access is restricted to verified college email domains. This keeps the network exclusive and valuable for vendors.' },
              { icon: Zap, title: '30-Second Expiry', desc: 'QR codes self-destruct in 30 seconds. One-time use. Cannot be shared, screenshotted, or reused. Bulletproof.' },
              { icon: Store, title: 'Local Vendor Network', desc: 'Discover cafes, restaurants, gyms, and more near your campus. Every vendor is vetted and offers real discounts.' },
              { icon: Users, title: 'Zero Setup for Students', desc: 'Sign in with your college Google account. That\'s it. No forms, no verification delays, no approval queues.' },
              { icon: ArrowRight, title: 'Real-time Tracking', desc: 'Both students and vendors get instant transaction records. Full transparency on every discount redeemed.' },
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 md:p-10 group hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 bg-slate-100 flex items-center justify-center mb-5 group-hover:bg-[#002FA710] transition-colors" style={{ borderRadius: '2px' }}>
                  <f.icon className="w-5 h-5 text-slate-600 group-hover:text-[#002FA7] transition-colors" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading font-bold text-lg tracking-tight text-[#0F172A] mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28 px-6 bg-[#0F172A]" data-testid="how-it-works-section">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs tracking-widest uppercase font-bold text-[#002FA7] mb-3">How it works</p>
          <h2 className="font-heading font-bold text-3xl sm:text-4xl tracking-tighter text-white mb-14">
            Three steps. That's it.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Sign in', desc: 'Use your college Google account. We verify your email domain automatically.' },
              { step: '02', title: 'Find a vendor', desc: 'Browse nearby partner vendors. See what discounts are available right now.' },
              { step: '03', title: 'Show your QR', desc: 'Tap "Get Discount" to generate a 30-second QR. Vendor scans it. Done.' },
            ].map((s, i) => (
              <div key={i} className="group">
                <span className="font-heading font-black text-6xl tracking-tighter text-slate-700/30 block mb-4">{s.step}</span>
                <h3 className="font-heading font-bold text-xl text-white mb-2 tracking-tight">{s.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Vendors */}
      <section id="for-vendors" className="py-20 md:py-28 px-6" data-testid="for-vendors-section">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5">
              <div className="bg-slate-50 border border-slate-200 p-6" style={{ borderRadius: '2px' }}>
                <img
                  src="https://images.unsplash.com/photo-1646624867902-b970108e9137?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA0MTJ8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb2ZmZWUlMjBzaG9wJTIwaW50ZXJpb3IlMjBjaGVja291dHxlbnwwfHx8fDE3NzY4Nzk2MDF8MA&ixlib=rb-4.1.0&q=85"
                  alt="Modern vendor interior"
                  className="w-full h-64 object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  style={{ borderRadius: '2px' }}
                />
              </div>
            </div>
            <div className="md:col-span-7">
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
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-emerald-50 flex items-center justify-center mt-0.5 shrink-0" style={{ borderRadius: '2px' }}>
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    </div>
                    <span className="text-sm text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
              <button
                data-testid="vendor-signup-btn"
                onClick={() => navigate('/login')}
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-[#002FA7] text-white font-medium text-sm hover:bg-[#001D6C] transition-all active:scale-[0.97]"
                style={{ borderRadius: '2px' }}
              >
                Join as a vendor
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 px-6 bg-slate-50 border-t border-slate-200" data-testid="cta-section">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading font-bold text-3xl sm:text-4xl tracking-tighter text-[#0F172A]">
            Stop paying full price.
          </h2>
          <p className="mt-4 text-slate-500 leading-relaxed max-w-md mx-auto">
            Your college email is the only membership you need. Start discovering exclusive student discounts near your campus.
          </p>
          <button
            data-testid="cta-get-started-btn"
            onClick={handleGetStarted}
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-[#0F172A] text-white font-medium hover:bg-slate-800 transition-all active:scale-[0.97]"
            style={{ borderRadius: '2px' }}
          >
            Get started for free
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-slate-200" data-testid="landing-footer">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-[#0F172A] flex items-center justify-center" style={{ borderRadius: '2px' }}>
              <span className="text-white font-heading font-bold text-xs">A</span>
            </div>
            <span className="font-heading font-bold text-sm tracking-tighter text-[#0F172A]">Artha</span>
          </div>
          <p className="text-xs text-slate-400">A verified student discount network.</p>
        </div>
      </footer>
    </div>
  );
}
