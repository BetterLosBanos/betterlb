/**
 * Merged Services Utility Functions
 *
 * Functions for working with merged Citizens Charter + community services data
 */

import type {
  Service,
  ServiceFilterOptions,
  ServiceSource,
  VerificationItem,
} from '@/types/servicesTypes';

// Import the merged services data
import mergedServicesData from '@/data/citizens-charter/merged-services.json';

/**
 * Get all merged services (Citizens Charter + community)
 * @returns Array of all services
 */
export function getMergedServices(): Service[] {
  return mergedServicesData as Service[];
}

/**
 * Get services by category slug
 * @param categorySlug - The category slug to filter by
 * @returns Array of services in the category
 */
export function getServicesByCategory(categorySlug: string): Service[] {
  if (categorySlug === 'all') {
    return getMergedServices();
  }
  return getMergedServices().filter(
    service => service.category.slug === categorySlug
  );
}

/**
 * Get services by office/division (Citizens Charter field)
 * @param officeDivision - The office division name
 * @returns Array of services from the specified office
 */
export function getServicesByOffice(officeDivision: string): Service[] {
  return getMergedServices().filter(
    service => service.officeDivision === officeDivision
  );
}

/**
 * Get services by source type
 * @param source - The source type filter
 * @returns Array of services from the specified source
 */
export function getServicesBySource(source: ServiceSource): Service[] {
  return getMergedServices().filter(service => service.source === source);
}

/**
 * Search services by query string
 * @param query - The search query
 * @returns Array of matching services
 */
export function searchServices(query: string): Service[] {
  if (!query) return getMergedServices();
  const lowerQuery = query.toLowerCase();
  return getMergedServices().filter(
    service =>
      service.service.toLowerCase().includes(lowerQuery) ||
      service.category.name.toLowerCase().includes(lowerQuery) ||
      service.officeDivision?.toLowerCase().includes(lowerQuery) ||
      service.description?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Filter services with multiple options
 * @param options - Filter options including category, office, source, classification, and search
 * @returns Array of filtered services
 */
export function filterServices(options: ServiceFilterOptions): Service[] {
  let services = getMergedServices();

  // Filter by category
  if (options.category && options.category !== 'all') {
    services = services.filter(s => s.category.slug === options.category);
  }

  // Filter by office division
  if (options.officeDivision && options.officeDivision !== 'all') {
    services = services.filter(
      s => s.officeDivision === options.officeDivision
    );
  }

  // Filter by source
  if (options.source && options.source !== 'all') {
    services = services.filter(s => s.source === options.source);
  }

  // Filter by classification (Citizens Charter only)
  if (options.classification) {
    services = services.filter(
      s => s.classification === options.classification
    );
  }

  // Search filter
  if (options.search) {
    const lowerQuery = options.search.toLowerCase();
    services = services.filter(
      service =>
        service.service.toLowerCase().includes(lowerQuery) ||
        service.category.name.toLowerCase().includes(lowerQuery) ||
        service.officeDivision?.toLowerCase().includes(lowerQuery) ||
        service.description?.toLowerCase().includes(lowerQuery)
    );
  }

  return services;
}

/**
 * Get all unique office/division names from Citizens Charter
 * @returns Array of unique office division names
 */
export function getAllOfficeDivisions(): string[] {
  const divisions = new Set(
    getMergedServices()
      .map(service => service.officeDivision)
      .filter(Boolean) as string[]
  );
  return Array.from(divisions).sort();
}

/**
 * Get services by office division slug
 * @param officeSlug - The office slug to filter by
 * @returns Array of services from the specified office
 */
export function getOfficeDivisionServices(officeSlug: string): Service[] {
  const slugs = Array.isArray(officeSlug) ? officeSlug : [officeSlug];
  return getMergedServices().filter(service => {
    const serviceSlugs = Array.isArray(service.officeSlug)
      ? service.officeSlug
      : [service.officeSlug].filter(Boolean);
    return serviceSlugs.some(slug => slugs.includes(slug));
  });
}

/**
 * Get services with incomplete data that need verification
 * @returns Array of services flagged for verification
 */
export function getIncompleteServices(): Service[] {
  return getMergedServices().filter(
    service =>
      service.dataComplete === false || service.needsVerification === true
  );
}

/**
 * Get verification queue from verification-queue.json
 * @returns The verification queue with pending and completed items
 */
export function getVerificationQueue(): {
  pending: VerificationItem[];
  completed: VerificationItem[];
} {
  // This would typically import from the JSON file
  // For now, return the incomplete services converted to verification items
  const incompleteServices = getIncompleteServices();

  return {
    pending: incompleteServices.map(service => ({
      serviceNumber: service.serviceNumber || '',
      serviceName: service.service,
      reason:
        'Placeholder data - needs requirements, steps, fees, and other details from Citizens Charter document',
      priority: 'high' as const,
    })),
    completed: [],
  };
}

/**
 * Get Citizens Charter services only
 * @returns Array of Citizens Charter services
 */
export function getCitizensCharterServices(): Service[] {
  return getMergedServices().filter(s => s.source === 'citizens-charter');
}

/**
 * Get community-contributed services only
 * @returns Array of community services
 */
export function getCommunityServices(): Service[] {
  return getMergedServices().filter(s => s.source === 'community');
}

/**
 * Get simple services only (quick transactions from Citizens Charter)
 * @returns Array of simple services
 */
export function getSimpleServices(): Service[] {
  return getMergedServices().filter(s => s.classification === 'Simple');
}

/**
 * Get complex services only (multi-step transactions from Citizens Charter)
 * @returns Array of complex services
 */
export function getComplexServices(): Service[] {
  return getMergedServices().filter(s => s.classification === 'Complex');
}

/**
 * Get service by slug
 * @param slug - The service slug
 * @returns The service or undefined if not found
 */
export function getServiceBySlug(slug: string): Service | undefined {
  return getMergedServices().find(s => s.slug === slug);
}

/**
 * Get related services based on category and office
 * @param service - The service to find related services for
 * @param limit - Maximum number of related services to return
 * @returns Array of related services
 */
export function getRelatedServices(service: Service, limit = 4): Service[] {
  const related = getMergedServices().filter(
    s =>
      s.slug !== service.slug &&
      (s.category.slug === service.category.slug ||
        s.officeDivision === service.officeDivision)
  );

  // Prioritize same office, then same category
  related.sort((a, b) => {
    const aSameOffice = a.officeDivision === service.officeDivision;
    const bSameOffice = b.officeDivision === service.officeDivision;
    if (aSameOffice && !bSameOffice) return -1;
    if (!aSameOffice && bSameOffice) return 1;
    return 0;
  });

  return related.slice(0, limit);
}

/**
 * Get services count by category
 * @returns Object mapping category slugs to service counts
 */
export function getServicesCountByCategory(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const service of getMergedServices()) {
    const slug = service.category.slug;
    counts[slug] = (counts[slug] || 0) + 1;
  }
  return counts;
}

/**
 * Get services count by source
 * @returns Object with counts for each source type
 */
export function getServicesCountBySource(): {
  citizensCharter: number;
  community: number;
  total: number;
} {
  const all = getMergedServices();
  return {
    citizensCharter: all.filter(s => s.source === 'citizens-charter').length,
    community: all.filter(s => s.source === 'community').length,
    total: all.length,
  };
}
