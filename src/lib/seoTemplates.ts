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
