/**
 * Citizen's Charter Utility Functions
 *
 * Helper functions for working with Citizen's Charter service data
 */

import type {
  CitizensCharterService,
  CitizensCharterData,
  ServiceFilterOptions,
} from '@/types/citizens-charter';

// Import the data
import citizensCharterData from '@/data/citizens-charter/citizens-charter.json';

/**
 * Get all Citizen's Charter services
 * @returns Array of all services
 */
export function getAllServices(): CitizensCharterService[] {
  return (citizensCharterData as CitizensCharterData).services;
}

/**
 * Get a specific service by its service number
 * @param number - The service number (e.g., "1.1", "5.2")
 * @returns The service or undefined if not found
 */
export function getServiceByNumber(
  number: string
): CitizensCharterService | undefined {
  return getAllServices().find(service => service.service_number === number);
}

/**
 * Get services filtered by office/division
 * @param office - The office or division name
 * @returns Array of services from the specified office
 */
export function getServicesByOffice(office: string): CitizensCharterService[] {
  return getAllServices().filter(service => service.office_division === office);
}

/**
 * Get services by section number
 * @param section - The section number (e.g., "1" for LCRO services)
 * @returns Array of services in the section
 */
export function getServicesBySection(
  section: string
): CitizensCharterService[] {
  return getAllServices().filter(service =>
    service.service_number.startsWith(`${section}.`)
  );
}

/**
 * Search services by query string
 * @param query - The search query
 * @returns Array of matching services
 */
export function searchServices(query: string): CitizensCharterService[] {
  const lowerQuery = query.toLowerCase();
  return getAllServices().filter(
    service =>
      service.service_name.toLowerCase().includes(lowerQuery) ||
      service.office_division.toLowerCase().includes(lowerQuery) ||
      service.who_may_avail.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get services with advanced filtering
 * @param options - Filter options
 * @returns Array of filtered services
 */
export function filterServices(
  options: ServiceFilterOptions
): CitizensCharterService[] {
  let services = getAllServices();

  if (options.office) {
    services = services.filter(
      service => service.office_division === options.office
    );
  }

  if (options.classification) {
    services = services.filter(
      service => service.classification === options.classification
    );
  }

  if (options.type_of_transaction) {
    services = services.filter(service =>
      service.type_of_transaction.includes(options.type_of_transaction!)
    );
  }

  if (options.search) {
    const lowerQuery = options.search.toLowerCase();
    services = services.filter(
      service =>
        service.service_name.toLowerCase().includes(lowerQuery) ||
        service.office_division.toLowerCase().includes(lowerQuery)
    );
  }

  return services;
}

/**
 * Get all unique office/division names
 * @returns Array of unique office names
 */
export function getAllOffices(): string[] {
  const offices = new Set(
    getAllServices().map(service => service.office_division)
  );
  return Array.from(offices).sort();
}

/**
 * Get all section numbers
 * @returns Array of unique section numbers
 */
export function getAllSections(): string[] {
  const sections = new Set(
    getAllServices().map(service => service.service_number.split('.')[0])
  );
  return Array.from(sections).sort();
}

/**
 * Get services count by office
 * @returns Object mapping office names to service counts
 */
export function getServicesCountByOffice(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const service of getAllServices()) {
    const office = service.office_division;
    counts[office] = (counts[office] || 0) + 1;
  }
  return counts;
}

/**
 * Get simple services only (quick transactions)
 * @returns Array of simple services
 */
export function getSimpleServices(): CitizensCharterService[] {
  return getAllServices().filter(
    service => service.classification === 'Simple'
  );
}

/**
 * Get complex services only (multi-step transactions)
 * @returns Array of complex services
 */
export function getComplexServices(): CitizensCharterService[] {
  return getAllServices().filter(
    service => service.classification === 'Complex'
  );
}

/**
 * Get G2C (Government to Citizen) services
 * @returns Array of G2C services
 */
export function getG2CServices(): CitizensCharterService[] {
  return getAllServices().filter(service =>
    service.type_of_transaction.includes('G2C')
  );
}

/**
 * Get G2B (Government to Business) services
 * @returns Array of G2B services
 */
export function getG2BServices(): CitizensCharterService[] {
  return getAllServices().filter(service =>
    service.type_of_transaction.includes('G2B')
  );
}
