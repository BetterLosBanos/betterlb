import { config } from './lguConfig';

/**
 * LGU-type-aware labels.
 * Returns the correct terminology based on whether the LGU is a municipality, city, or province.
 */
const LGU_LABELS: Record<
  string,
  { head: string; body: string; subdivisions: string; adjective: string }
> = {
  municipality: {
    head: 'Mayor',
    body: 'Sangguniang Bayan',
    subdivisions: 'Barangays',
    adjective: 'Municipal',
  },
  city: {
    head: 'Mayor',
    body: 'Sangguniang Panlungsod',
    subdivisions: 'Barangays',
    adjective: 'City',
  },
  province: {
    head: 'Governor',
    body: 'Sangguniang Panlalawigan',
    subdivisions: 'Municipalities & Cities',
    adjective: 'Provincial',
  },
};

const type = config.lgu.type;
const labels = LGU_LABELS[type] ?? LGU_LABELS.municipality;

export const lguLabels = {
  /** "Municipality of Los Baños" / "City of ..." / "Province of ..." */
  fullName: config.lgu.fullName,
  /** "Los Baños" */
  name: config.lgu.name,
  /** "Laguna" */
  province: config.lgu.province,
  /** "Mayor" / "Governor" */
  head: labels.head,
  /** "Sangguniang Bayan" / "Sangguniang Panlungsod" */
  body: labels.body,
  /** "Barangays" / "Municipalities & Cities" */
  subdivisions: labels.subdivisions,
  /** "Municipal" / "City" / "Provincial" */
  adjective: labels.adjective,
  /** "{name}, {province}" e.g. "Los Baños, Laguna" */
  location: `${config.lgu.name}, ${config.lgu.province}`,
};
