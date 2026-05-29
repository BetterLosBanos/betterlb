import { config } from './lguConfig';

// helpers for interpolation using config

export function formatStandardTitle(
  subject: string,
  portalName?: string
): string {
  return `${subject} | ${portalName || config.portal.name}`;
}

export function formatStandardDescription(
  subject: string,
  portalName?: string,
  lguFullName?: string
): string {
  const name = portalName || config.portal.name;
  const lgu = lguFullName || config.lgu.fullName;
  return `Learn more about ${subject} through ${name}, the Philippines' civic information portal for ${lgu}.`;
}

/**
 * Resolve {{token}} placeholders in seo-metadata.json entries.
 * Called at runtime by the SEO component.
 */
const TOKEN_MAP: Record<string, string> = {
  'portal.name': config.portal.name,
  'portal.domain': config.portal.domain,
  'portal.baseUrl': config.portal.baseUrl,
  'lgu.name': config.lgu.name,
  'lgu.fullName': config.lgu.fullName,
  'lgu.province': config.lgu.province,
  'lgu.type': config.lgu.type,
  'lgu.adjective':
    config.lgu.type === 'city'
      ? 'City'
      : config.lgu.type === 'province'
        ? 'Provincial'
        : 'Municipal',
};

const TOKEN_RE = /\{\{(\w+(?:\.\w+)*)\}\}/g;

export function resolveSeoTokens(text: string): string {
  return text.replace(TOKEN_RE, (_, key) => TOKEN_MAP[key] ?? key);
}
