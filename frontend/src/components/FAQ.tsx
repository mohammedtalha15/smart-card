import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

export default function FAQ({ items }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className={`bg-white border transition-all duration-200 ${
              isOpen ? 'border-slate-300 shadow-sm' : 'border-slate-200 hover:border-slate-300'
            }`}
            style={{ borderRadius: '2px' }}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left"
              data-testid={`faq-q-${i}`}
            >
              <span className="font-heading font-bold text-sm tracking-tight text-[#0F172A] pr-4">
                {item.question}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
                strokeWidth={2}
              />
            </button>
            <div className={`faq-content ${isOpen ? 'open' : ''}`}>
              <div className="px-5 pb-5 pt-0">
                <p className="text-sm text-slate-500 leading-relaxed">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
