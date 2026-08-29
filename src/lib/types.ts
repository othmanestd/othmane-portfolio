export type Locale = 'fr' | 'en' | 'ar'

export interface Localized { fr: string; en: string; ar: string }

export interface Profile {
  name: string
  headline: Localized
  bio: Localized
  long_bio: Localized
  location: string
  email: string
  phone: string
  photo_url: string
  cv_url_fr: string
  cv_url_en: string
  available: boolean
  availability_note: Localized
}

export interface Metric { label: string; value: string }

export interface Project {
  id?: string
  slug: string
  title: string
  tagline: Localized
  summary: Localized
  body: Localized
  role: Localized
  year: string
  category: string
  stack: string[]
  highlights: Localized[]
  metrics: Metric[]
  repo_url: string
  live_url: string
  featured: boolean
  published: boolean
  order: number
}

export interface Experience {
  id?: string
  company: string
  role: Localized
  location: string
  period: Localized
  start: string
  end: string
  bullets: Localized[]
  stack: string[]
  kind: 'work' | 'education'
  order: number
}

export interface SkillGroup {
  id?: string
  key: string
  label: Localized
  items: string[]
  order: number
}

export interface Award {
  id?: string
  title: string
  issuer: string
  year: string
  rank: string
  kind: 'award' | 'certification'
  url?: string
  order: number
}

export interface LinkItem {
  id?: string
  label: string
  url: string
  icon: string
  description: string
  primary: boolean
  order: number
}

export interface SiteContent {
  profile: Profile
  projects: Project[]
  experiences: Experience[]
  education: Experience[]
  skills: SkillGroup[]
  awards: Award[]
  certifications: Award[]
  links: LinkItem[]
  meta: { github: string; linkedin: string; generated_at: string }
}

export interface ChatSource { title: string; kind: string; score: number; excerpt: string }

export interface ChatCard {
  type: 'project' | 'experience'
  title: string
  subtitle: string
  year: string
  slug: string
  url: string
  repo_url: string
  tags: string[]
}

export interface ChatReply {
  reply: string
  sources: ChatSource[]
  cards: ChatCard[]
  provider: string
  degraded: boolean
  notice: string
}

export interface Message {
  id: string
  name: string
  email: string
  company: string
  subject: string
  message: string
  locale: string
  read: boolean
  archived: boolean
  replied: boolean
  created_at: string
}

export interface Appointment {
  id: string
  name: string
  email: string
  phone: string
  topic: string
  notes: string
  slot_start: string
  duration_minutes: number
  locale: string
  timezone: string
  status: 'pending' | 'confirmed' | 'declined' | 'completed'
  admin_note?: string
  created_at: string
}

export interface AdminStats {
  messages_total: number
  messages_unread: number
  appointments_total: number
  appointments_pending: number
  appointments_upcoming: number
  projects_total: number
  projects_published: number
  notifications_unread: number
  page_views_7d: number
  chat_messages_7d: number
  events_by_day: { date: string; count: number }[]
  top_paths: { path: string; count: number }[]
  health: { db: boolean; smtp: boolean; gemini: boolean; llm_fallback: boolean }
}

export interface Notification {
  id: string
  kind: string
  title: string
  body: string
  ref: string
  read: boolean
  created_at: string
}
