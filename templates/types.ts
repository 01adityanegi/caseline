export type TemplateCategory = 'Rental & Property' | 'Business & Work' | 'Personal'

export interface FormFieldSchema {
  id: string
  labelEn: string
  labelHi: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'currency' | 'phone' | 'email'
  placeholderEn?: string
  placeholderHi?: string
  helperEn?: string
  helperHi?: string
  required?: boolean
  options?: Array<{ labelEn: string; labelHi: string; value: string }>
  defaultValue?: any
  section: 'parties' | 'terms' | 'property' | 'payment' | 'legal'
}

export interface ClauseBlock {
  id: string
  clauseNumber?: number
  titleEn: string
  titleHi: string
  textEn: string
  textHi: string
  isOptional?: boolean
  conditionField?: string
  conditionValue?: any
  explanationEn?: string
  explanationHi?: string
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH'
  suggestedBalancedEn?: string
  suggestedBalancedHi?: string
}

export interface AgreementTemplateDefinition {
  code: string
  category: TemplateCategory
  titleEn: string
  titleHi: string
  descriptionEn: string
  descriptionHi: string
  estimatedMinutes: number
  iconName: string // Lucide icon name, e.g. Home, Building, Briefcase, Shield, UserCheck, Receipt, Landmark
  languages: Array<'EN' | 'HI'>
  fields: FormFieldSchema[]
  clauses: ClauseBlock[]
  sampleData: Record<string, any>
}
