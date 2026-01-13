export interface HistoryPoint {
  year: number;
  population: number;
}

export interface GrowthRate {
  period: string;
  rate: number;
}

export interface MunicipalityData {
  name: string;
  history: HistoryPoint[];
  growthRates: GrowthRate[];
}

export interface BarangayData {
  id: string;
  name: string;
  history: HistoryPoint[];
}

export interface PopulationData {
  meta: {
    location: {
      region: string;
      province: string;
      municipality: string;
    };
    source: string;
    notes?: string;
    censusDates: Record<string, string>; // e.g. "2010": "2010-05-01"
  };
  municipality: MunicipalityData;
  barangays: BarangayData[];
}
