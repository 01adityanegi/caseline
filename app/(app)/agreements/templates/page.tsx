import { auth } from '@/lib/auth'
import Link from 'next/link'
import {
  Search, Filter, Clock, Languages, ArrowRight, Sparkles, Scale,
  Home, Building2, Building, FileCheck, Receipt, AlertCircle,
  Laptop, Briefcase, Lock, Users2, GraduationCap, Truck, Landmark, UserCheck, FileText
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { ALL_TEMPLATES, TEMPLATE_CATEGORIES } from '@/templates'
import TemplatesClient from '@/components/agreements/TemplatesClient'
import { PageTransition } from '@/components/ui/motion'

export default async function TemplatesPage() {
  const session = await auth()
  if (!session) return null
  if (session.user.role === 'CLIENT') redirect('/agreements')

  return (
    <PageTransition>
      <div className="space-y-6 max-w-[1400px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                Agreement Template Library
              </h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                Bilingual (EN + HI)
              </span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-2xl">
              Choose from 14 verified legal agreement schemas for Indian jurisdiction. Structured for deterministic assembly and judicial AI refinement.
            </p>
          </div>

          <Link
            href="/agreements/new"
            className="btn-primary text-xs whitespace-nowrap self-start sm:self-auto shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Describe-to-Agreement
          </Link>
        </div>

        <TemplatesClient templates={ALL_TEMPLATES} categories={TEMPLATE_CATEGORIES} />
      </div>
    </PageTransition>
  )
}
