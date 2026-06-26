import fs from 'fs';
import path from 'path';

export const LEAD_GEN_DOCS = {
  'landing-page-integration': {
    title: 'Landing Page Integration',
    filename: 'landing-page-integration.md',
  },
} as const;

export type LeadGenDocSlug = keyof typeof LEAD_GEN_DOCS;

const DOC_LINK_MAP: Record<string, LeadGenDocSlug> = {
  './landingPageIntegration.md': 'landing-page-integration',
  'landingPageIntegration.md': 'landing-page-integration',
  './landing-page-integration.md': 'landing-page-integration',
  'landing-page-integration.md': 'landing-page-integration',
};

export function isLeadGenDocSlug(slug: string): slug is LeadGenDocSlug {
  return slug in LEAD_GEN_DOCS;
}

export function getLeadGenDoc(slug: LeadGenDocSlug): {
  title: string;
  content: string;
} {
  const doc = LEAD_GEN_DOCS[slug];
  const filePath = path.join(
    process.cwd(),
    'content',
    'lead-gen',
    doc.filename
  );
  const content = fs.readFileSync(filePath, 'utf-8');
  return { title: doc.title, content };
}

export function resolveDocLink(href: string | undefined): string | undefined {
  if (!href) return href;

  const mapped = DOC_LINK_MAP[href];
  if (mapped) {
    return `/lead-gen/docs/${mapped}`;
  }

  if (href.startsWith('/lead-gen/docs/')) {
    return href;
  }

  return href;
}
