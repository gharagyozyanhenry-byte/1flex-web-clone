import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    question: "Do I need to create an account to watch?",
    answer: "No, absolutely not. 1flex allows you to stream movies and TV shows instantly without any registration or sign-up process."
  },
  {
    question: "Is 1flex really free?",
    answer: "Yes, 100% free. There are no hidden fees, subscriptions, or premium tiers. All content is available at no cost."
  },
  {
    question: "Can I watch 2026 movies in HD?",
    answer: "Yes, all movies and shows are available in high-definition 1080p quality. Some titles even support 4K streaming."
  },
  {
    question: "Do I need to download anything?",
    answer: "No downloads required. Everything streams directly in your browser on PC, phone, or tablet."
  },
  {
    question: "How often are new movies added?",
    answer: "We add new releases and episodes daily. Our library is updated constantly with fresh content."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-6 bg-[#0a0a0f] relative overflow-hidden">
      <div className="max-w-3xl mx-auto space-y-12 relative z-10">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="text-white/40 font-medium">Everything you need to know about 1flex streaming.</p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div
              key={index}
              className={cn(
                "group rounded-2xl border border-white/5 bg-[#14141f]/50 transition-all duration-300",
                openIndex === index && "border-primary/30 bg-[#14141f]"
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className={cn(
                  "font-bold text-lg transition-colors duration-300",
                  openIndex === index ? "text-primary" : "text-white/80 group-hover:text-white"
                )}>
                  {faq.question}
                </span>
                <ChevronDown className={cn(
                  "w-5 h-5 text-white/30 transition-transform duration-300",
                  openIndex === index && "rotate-180 text-primary"
                )} />
              </button>
              <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                openIndex === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              )}>
                <p className="px-6 pb-6 text-white/50 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
