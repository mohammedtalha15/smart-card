import React, { useState, useEffect, useCallback } from 'react';
import { Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  college: string;
  text: string;
  savings: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoPlayInterval?: number;
}

export default function TestimonialCarousel({ testimonials, autoPlayInterval = 4000 }: TestimonialCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning]);

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % testimonials.length);
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [current, testimonials.length, autoPlayInterval, goTo]);

  const t = testimonials[current];

  return (
    <div className="relative" data-testid="testimonial-carousel">
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
        <div className="bg-white border border-slate-200 p-8 md:p-10 relative" style={{ borderRadius: '2px' }}>
          <Quote className="w-8 h-8 text-brand-200 mb-4" strokeWidth={1.5} />
          <p className="text-lg md:text-xl text-[#0F172A] font-heading font-medium leading-relaxed tracking-tight">
            "{t.text}"
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand to-brand-400 flex items-center justify-center text-white font-heading font-bold text-sm" style={{ borderRadius: '2px' }}>
              {t.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-bold text-[#0F172A]">{t.name}</p>
              <p className="text-xs text-slate-400">{t.college} · Saved {t.savings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            data-testid={`testimonial-dot-${i}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-6 bg-brand' : 'w-1.5 bg-slate-200 hover:bg-slate-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
