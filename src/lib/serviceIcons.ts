import {
  Briefcase,
  DollarSign,
  FileText,
  GraduationCap,
  Hammer,
  HeartHandshake,
  Leaf,
  ShieldCheck,
  Sprout,
  Stethoscope,
  Store,
  type LucideIcon,
} from 'lucide-react';

// Icon mapping by category slug (used in ServicesSidebar)
export const categoryIconsBySlug: Record<string, LucideIcon> = {
  'certificates-vital-records': FileText,
  'business-trade-investment': Briefcase,
  'taxation-payments': DollarSign,
  'infrastructure-public-works': Hammer,
  'social-services-assistance': HeartHandshake,
  'health-wellness': Stethoscope,
  'agriculture-economic-development': Sprout,
  'environment-natural-resources': Leaf,
  'education-scholarship': GraduationCap,
  'public-safety-security': ShieldCheck,
};

// Icon mapping by category name (used in Hero and ServicesSection)
export const categoryIconsByName: Record<string, LucideIcon> = {
  'Certificates & Vital Records': FileText,
  'Business, Trade & Investment': Store,
  'Taxation & Payments': DollarSign,
  'Infrastructure & Public Works': Hammer,
  'Social Services & Assistance': HeartHandshake,
  'Health & Wellness': Stethoscope,
  'Agriculture & Economic Development': Sprout,
  'Environment & Natural Resources': Leaf,
  'Education & Scholarship': GraduationCap,
  'Public Safety & Security': ShieldCheck,
};

// Helper function to get icon by category name
export function getCategoryIcon(categoryName: string): LucideIcon {
  return categoryIconsByName[categoryName] || FileText;
}

// Helper function to get icon by category slug
export function getCategoryIconBySlug(slug: string): LucideIcon {
  return categoryIconsBySlug[slug] || FileText;
}
