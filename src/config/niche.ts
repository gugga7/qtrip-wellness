/* ════════════════════════════════════════════════════════════════
   Niche Configuration System

   Each niche is a config object that controls:
   - Theme (colors, gradients, branding)
   - Feature flags (which modules are enabled)
   - Destinations (which cities this niche serves)
   - Categories (activity categories for this niche)
   - Supported languages
   - Default settings
   ════════════════════════════════════════════════════════════════ */

export interface NicheFeatures {
  groupBooking: boolean;
  votingSystem: boolean;
  countdownTimer: boolean;
  expenseSplitting: boolean;
  guestList: boolean;
  profilePage: boolean;
  aiSchedule: boolean;
}

export interface NicheTheme {
  /** Tailwind color prefix, e.g. 'pink' → bg-pink-500, text-pink-700 */
  primary: string;
  /** Secondary accent color prefix */
  accent: string;
  /** Gradient classes for hero sections */
  heroGradient: string;
  /** Gradient for buttons and CTAs */
  ctaGradient: string;
  /** App name displayed in the UI */
  appName: string;
  /** Tagline shown on landing/header */
  tagline: Record<string, string>;
  /** Description for SEO / meta */
  description: Record<string, string>;
}

export interface CategoryColor {
  bg: string;
  border: string;
  text: string;
  badge: string;
  dot: string;
  light: string;
}

export interface NicheConfig {
  /** Unique niche identifier */
  id: string;
  /** Display name for the niche */
  name: Record<string, string>;
  /** Which destinations are available */
  destinations: string[];
  /** Enabled features */
  features: NicheFeatures;
  /** Visual theme */
  theme: NicheTheme;
  /** Activity categories for this niche */
  categories: string[];
  /** Color scheme per activity category (key = category name) */
  categoryColors: Record<string, CategoryColor>;
  /** Default currency */
  defaultCurrency: string;
  /** Supported languages (ISO codes) */
  supportedLanguages: string[];
  /** Default language */
  defaultLanguage: string;
  /** Minimum group size */
  minGroupSize: number;
  /** Default group size */
  defaultGroupSize: number;
}

/* ── Wellness Retreats niche ── */

export const wellnessConfig: NicheConfig = {
  id: 'wellness',
  name: {
    en: 'Wellness Retreats',
    fr: 'Retraites Bien-Être',
  },
  destinations: ['essaouira', 'marrakech', 'agadir'],
  features: {
    groupBooking: true,
    votingSystem: false,
    countdownTimer: true,
    expenseSplitting: true,
    guestList: false,
    profilePage: true,
    aiSchedule: true,
  },
  theme: {
    primary: 'teal',
    accent: 'emerald',
    heroGradient: 'from-teal-400 via-emerald-500 to-cyan-500',
    ctaGradient: 'from-teal-400 to-emerald-500',
    appName: 'QTRIP',
    tagline: {
      en: 'Restore your balance',
      fr: 'Retrouvez votre équilibre',
    },
    description: {
      en: 'Plan transformative wellness retreats in Morocco. Yoga, hammam, surf therapy, and mindful experiences in Essaouira, Marrakech, and Agadir.',
      fr: 'Organisez des retraites bien-être au Maroc. Yoga, hammam, surf thérapie et expériences zen à Essaouira, Marrakech et Agadir.',
    },
  },
  categories: [
    'Yoga & Meditation',
    'Spa & Hammam',
    'Active Wellness',
    'Healthy Eating',
    'Nature & Mindfulness',
    'Creative Therapy',
  ],
  categoryColors: {
    'Yoga & Meditation':    { bg: 'bg-teal-50',    border: 'border-teal-300',    text: 'text-teal-700',    badge: 'bg-teal-100 text-teal-700',       dot: 'bg-teal-400',    light: 'bg-teal-50/60' },
    'Spa & Hammam':         { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400', light: 'bg-emerald-50/60' },
    'Active Wellness':      { bg: 'bg-cyan-50',    border: 'border-cyan-300',    text: 'text-cyan-700',    badge: 'bg-cyan-100 text-cyan-700',       dot: 'bg-cyan-400',    light: 'bg-cyan-50/60' },
    'Healthy Eating':       { bg: 'bg-lime-50',    border: 'border-lime-300',    text: 'text-lime-700',    badge: 'bg-lime-100 text-lime-700',       dot: 'bg-lime-400',    light: 'bg-lime-50/60' },
    'Nature & Mindfulness': { bg: 'bg-green-50',   border: 'border-green-300',   text: 'text-green-700',   badge: 'bg-green-100 text-green-700',     dot: 'bg-green-400',   light: 'bg-green-50/60' },
    'Creative Therapy':     { bg: 'bg-violet-50',  border: 'border-violet-300',  text: 'text-violet-700',  badge: 'bg-violet-100 text-violet-700',   dot: 'bg-violet-400',  light: 'bg-violet-50/60' },
  },
  defaultCurrency: 'EUR',
  supportedLanguages: ['en', 'fr'],
  defaultLanguage: 'en',
  minGroupSize: 1,
  defaultGroupSize: 2,
};

/* ── Active niche ── */
// Change this to switch niches. In the future this could come from
// an env variable, subdomain detection, or a database lookup.
export const activeNiche: NicheConfig = wellnessConfig;
