import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date helpers
export function formatDate(date: Date | string | null, pattern = 'dd MMM yyyy'): string {
  if (!date) return '-'
  try {
    return format(new Date(date), pattern)
  } catch {
    return '-'
  }
}

export function formatRelative(date: Date | string | null): string {
  if (!date) return '-'
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  } catch {
    return '-'
  }
}

export function formatDateTime(date: Date | string | null): string {
  return formatDate(date, 'dd MMM yyyy, h:mm a')
}

// Currency
export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Case number generator
export function generateCaseNumber(seq: number): string {
  const year = new Date().getFullYear()
  const num = String(seq).padStart(5, '0')
  return `CL-${year}-${num}`
}

// Invoice number generator
export function generateInvoiceNumber(seq: number): string {
  const year = new Date().getFullYear()
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  const num = String(seq).padStart(4, '0')
  return `INV-${year}${month}-${num}`
}

// Deadline risk calculation
export function calculateDeadlineRisk(deadline: Date | string): {
  score: number
  label: string
  level: 'low' | 'medium' | 'high' | 'critical'
} {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const daysUntil = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntil < 0) {
    return { score: 100, label: 'Overdue', level: 'critical' }
  } else if (daysUntil === 0) {
    return { score: 95, label: 'Due today', level: 'critical' }
  } else if (daysUntil <= 2) {
    return { score: 85, label: `Due in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`, level: 'critical' }
  } else if (daysUntil <= 7) {
    return { score: 65, label: `Due in ${daysUntil} days`, level: 'high' }
  } else if (daysUntil <= 14) {
    return { score: 40, label: `Due in ${daysUntil} days`, level: 'medium' }
  } else if (daysUntil <= 30) {
    return { score: 20, label: `Due in ${daysUntil} days`, level: 'low' }
  } else {
    return { score: 5, label: `Due in ${daysUntil} days`, level: 'low' }
  }
}

// Status color helpers
export function getCaseStatusColor(status: string): string {
  const map: Record<string, string> = {
    INTAKE: 'badge-info',
    INVESTIGATION: 'badge-warning',
    FILING: 'badge-warning',
    HEARING: 'badge-muted',
    JUDGMENT: 'badge-muted',
    APPEAL: 'badge-warning',
    CLOSED: 'badge-success',
    ON_HOLD: 'badge-muted',
  }
  return map[status] || 'badge-muted'
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    CRITICAL: 'badge-danger',
    HIGH: 'badge-warning',
    MEDIUM: 'badge-info',
    LOW: 'badge-muted',
  }
  return map[priority] || 'badge-muted'
}

export function getRiskColor(score: number): string {
  if (score >= 80) return 'text-danger'
  if (score >= 60) return 'text-warning'
  if (score >= 40) return 'text-yellow-500'
  return 'text-success'
}

// File size formatter
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// Role labels
export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  PARTNER: 'Partner',
  ASSOCIATE: 'Associate',
  PARALEGAL: 'Paralegal',
  CLIENT: 'Client',
}

export const STATUS_LABELS: Record<string, string> = {
  INTAKE: 'Intake',
  INVESTIGATION: 'Investigation',
  FILING: 'Filing',
  HEARING: 'Hearing',
  JUDGMENT: 'Judgment',
  APPEAL: 'Appeal',
  CLOSED: 'Closed',
  ON_HOLD: 'On Hold',
}

export const PRACTICE_AREAS = [
  'Corporate & Commercial',
  'Family Law',
  'Property & Real Estate',
  'Criminal Defense',
  'Intellectual Property',
  'Labour & Employment',
  'Tax & Revenue',
  'Constitutional',
  'Consumer Protection',
  'Insolvency & Bankruptcy',
  'Environmental',
  'Civil Litigation',
  'Arbitration',
  'Immigration',
]

export const COURTS = [
  'Supreme Court of India',
  'High Court of Delhi',
  'High Court of Bombay',
  'High Court of Calcutta',
  'High Court of Madras',
  'High Court of Karnataka',
  'District Court, Delhi',
  'District Court, Mumbai',
  'National Company Law Tribunal',
  'Income Tax Appellate Tribunal',
  'Labour Court, Delhi',
  'Consumer Forum',
  'Arbitration Tribunal',
]

// Debounce
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}

// Parse JSON safely
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}

// Check if date is overdue
export function isOverdue(date: Date | string): boolean {
  return isBefore(new Date(date), new Date())
}

// Days until deadline
export function daysUntil(date: Date | string): number {
  const now = new Date()
  const target = new Date(date)
  return Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}
