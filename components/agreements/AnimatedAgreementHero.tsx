'use client'

import React, { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Sparkles, ArrowRight, Languages, CheckCircle2, ShieldCheck, FileText } from 'lucide-react'
import Link from 'next/link'

const STEPS = [
  {
    stage: 'Input: Deal Parameters',
    en: 'Residential Rent: Flat 402, Lotus Boulevard, Noida. Rent: INR 28,000/mo. Deposit: INR 56,000. 11 Months.',
    hi: 'आवासीय किराया: फ्लैट 402, लोटस बुलेवार्ड, नोएडा। किराया: 28,000/- प्रतिमाह। अमानत: 56,000/-। 11 माह।',
    status: 'Interpreting deal terms...'
  },
  {
    stage: 'Compiling English Deed',
    en: '1. RENT & ESCALATION: The Tenant agrees to pay a monthly rent of INR 28,000 (Rupees Twenty-Eight Thousand Only) in advance by the 5th day of each English calendar month.',
    hi: '1. किराया एवं वृद्धि: किरायेदार प्रत्येक अंग्रेजी कैलेंडर माह की 5वीं तारीख तक अग्रिम रूप से 28,000/- रुपये (अट्ठाइस हज़ार रुपये मात्र) मासिक किराया अदा करने पर सहमत है।',
    status: 'Synthesizing Devanagari translation...'
  },
  {
    stage: 'Statutory Verification & IT Act E-Sign',
    en: 'IN WITNESS WHEREOF: Landlord (Rajesh Sharma) & Tenant (Rahul Verma) have electronically executed this deed under Section 17 Registration Act 1908.',
    hi: 'जिसके साक्ष्य स्वरूप: मकान मालिक (राजेश शर्मा) एवं किरायेदार (राहुल वर्मा) ने पंजीकरण अधिनियम 1908 की धारा 17 के तहत इस विलेख पर डिजिटल हस्ताक्षर किए।',
    status: 'Verified bilateral execution complete'
  }
]

export default function AnimatedAgreementHero() {
  const shouldReduceMotion = useReducedMotion()
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (shouldReduceMotion) return
    const interval = setInterval(() => {
      setCurrentStep(s => (s + 1) % STEPS.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [shouldReduceMotion])

  const step = STEPS[currentStep]

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-5 md:p-6 shadow-sm overflow-hidden relative">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 relative z-10">
        {/* Left Side: Pitch and Call to Action */}
        <div className="lg:max-w-md space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent font-medium text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Bilingual Drafting</span>
          </div>

          <h2 className="text-lg md:text-xl font-bold text-foreground font-serif leading-tight">
            Draft in English & Legal Hindi simultaneously.
          </h2>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Enter parties and deal terms once. CaseLine deterministically produces court-admissible agreements with automatic Devanagari transliteration, Indian stamp duty adaptation, and instant e-signatures.
          </p>

          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <Link
              href="/agreements/new"
              className="px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs inline-flex items-center gap-1.5 shadow-sm hover:bg-primary/90 transition-all active:scale-95"
            >
              Start Guided Generator <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/agreements/templates"
              className="px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs border border-border transition-all"
            >
              Browse 14 Templates
            </Link>
          </div>
        </div>

        {/* Right Side: Real-Time Live Mock Agreement Simulator */}
        <div className="flex-1 max-w-xl w-full">
          <div className="bg-background/80 backdrop-blur-md rounded-xl border border-border/80 shadow-md p-4 space-y-3">
            {/* Simulation Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[11px] font-bold text-foreground">
                  {step.stage}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                <Languages className="w-3.5 h-3.5 text-primary" />
                <span>EN ⇄ HI Real-Time Engine</span>
              </div>
            </div>

            {/* Simulated Live Text Box */}
            <motion.div
              key={currentStep}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              {/* English Mock Box */}
              <div className="p-3 rounded-lg bg-card border border-border/60 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  English Instrument
                </span>
                <p className="text-xs text-foreground font-serif leading-relaxed line-clamp-4">
                  {step.en}
                </p>
              </div>

              {/* Hindi Mock Box */}
              <div className="p-3 rounded-lg bg-card border border-border/60 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground font-hindi" lang="hi">
                  हिन्दी विलेख (Devanagari)
                </span>
                <p className="text-xs text-foreground font-hindi leading-relaxed line-clamp-4" lang="hi">
                  {step.hi}
                </p>
              </div>
            </motion.div>

            {/* Status Footer */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span className="flex items-center gap-1 text-primary font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                {step.status}
              </span>
              <div className="flex gap-1">
                {STEPS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentStep ? 'w-5 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                    }`}
                    aria-label={`Go to step ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
