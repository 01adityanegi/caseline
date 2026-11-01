'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search, Clock, Languages, ArrowRight,
  Home, Building2, Building, FileCheck, Receipt, AlertCircle,
  Laptop, Briefcase, Lock, Users2, GraduationCap, Truck, Landmark, UserCheck, FileText
} from 'lucide-react'
import { AgreementTemplateDefinition, TemplateCategory } from '@/templates'

interface TemplatesClientProps {
  templates: AgreementTemplateDefinition[]
  categories: TemplateCategory[]
}

const ICON_MAP: Record<string, any> = {
  Home, Building2, Building, FileCheck, Receipt, AlertCircle,
  Laptop, Briefcase, Lock, Users2, GraduationCap, Truck, Landmark, UserCheck, FileText
}

export default function TemplatesClient({ templates, categories }: TemplatesClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [search, setSearch] = useState('')

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesCat = selectedCategory === 'All' || t.category === selectedCategory
      const q = search.toLowerCase().trim()
      const matchesSearch = !q ||
        t.titleEn.toLowerCase().includes(q) ||
        t.titleHi.toLowerCase().includes(q) ||
        t.descriptionEn.toLowerCase().includes(q) ||
        t.descriptionHi.toLowerCase().includes(q)
      return matchesCat && matchesSearch
    })
  }, [templates, selectedCategory, search])

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search templates (e.g., rent, freelance, nda, loan, sale deed)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Category Pills (Horizontal scroll on mobile) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`text-xs font-medium px-3.5 py-1.5 rounded-full border transition-all whitespace-nowrap min-h-[36px] ${
              selectedCategory === 'All'
                ? 'bg-primary text-white border-primary shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:border-primary/40'
            }`}
          >
            All Templates ({templates.length})
          </button>
          {categories.map(cat => {
            const count = templates.filter(t => t.category === cat).length
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-medium px-3.5 py-1.5 rounded-full border transition-all whitespace-nowrap min-h-[36px] ${
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                }`}
              >
                {cat} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map(t => {
          const Icon = ICON_MAP[t.iconName] || FileText
          return (
            <div
              key={t.code}
              className="bg-card rounded-xl border border-border p-5 shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {t.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                      EN + HI
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                    {t.titleEn}
                  </h3>
                  <p className="font-hindi text-xs text-muted-foreground font-medium mt-0.5" lang="hi">
                    {t.titleHi}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {t.descriptionEn}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-border/80 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>~{t.estimatedMinutes} mins</span>
                </div>

                <Link
                  href={`/agreements/new?template=${t.code}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors py-1 px-2 rounded-lg hover:bg-primary/5 min-h-[44px]"
                >
                  Create Agreement <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )
        })}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium">No templates match your search criteria.</p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('All') }}
              className="mt-3 text-xs font-semibold text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
