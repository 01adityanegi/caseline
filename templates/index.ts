import { AgreementTemplateDefinition, TemplateCategory } from './types'
import {
  residentialRentTemplate,
  commercialRentTemplate,
  propertySaleAgreementTemplate,
  saleDeedTemplate,
  rentReceiptTemplate,
  tenantNoticeTemplate
} from './rental-property'
import {
  freelanceServiceTemplate,
  employmentAgreementTemplate,
  ndaTemplate,
  partnershipDeedTemplate,
  consultancyAgreementTemplate,
  vendorSupplyTemplate
} from './business-work'
import {
  loanPromissoryTemplate,
  powerOfAttorneyTemplate,
  affidavitGeneralTemplate
} from './personal'

export * from './types'

export const ALL_TEMPLATES: AgreementTemplateDefinition[] = [
  // Rental & Property
  residentialRentTemplate,
  commercialRentTemplate,
  propertySaleAgreementTemplate,
  saleDeedTemplate,
  rentReceiptTemplate,
  tenantNoticeTemplate,

  // Business & Work
  freelanceServiceTemplate,
  employmentAgreementTemplate,
  ndaTemplate,
  partnershipDeedTemplate,
  consultancyAgreementTemplate,
  vendorSupplyTemplate,

  // Personal
  loanPromissoryTemplate,
  powerOfAttorneyTemplate,
  affidavitGeneralTemplate
]

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'Rental & Property',
  'Business & Work',
  'Personal'
]

export function getTemplateByCode(code: string): AgreementTemplateDefinition | undefined {
  return ALL_TEMPLATES.find(t => t.code === code)
}

export function searchTemplates(query: string, category?: string): AgreementTemplateDefinition[] {
  const q = query.toLowerCase().trim()
  return ALL_TEMPLATES.filter(t => {
    const matchesCategory = !category || category === 'All' || t.category === category
    const matchesQuery = !q ||
      t.titleEn.toLowerCase().includes(q) ||
      t.titleHi.toLowerCase().includes(q) ||
      t.descriptionEn.toLowerCase().includes(q) ||
      t.descriptionHi.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    return matchesCategory && matchesQuery
  })
}
