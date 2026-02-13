import lguConfig from '../../config/lgu.config.json';

export interface LGUConfig {
  lgu: {
    name: string;
    fullName: string;
    province: string;
    districtEngineeringOffice?: string;
    region: string;
    regionCode: string;
    type: 'municipality' | 'city';
    logoPath: string;
    officialWebsite: string;
    provinceWebsite: string;
  };
  portal: {
    name: string;
    domain: string;
    baseUrl: string;
    tagline: string;
    description: string;
    brandColor: string;
    navbarTagline: string;
    footerBrandName: string;
    footerTagline: string;
    logoWhitePath: string;
  };
  location: {
    coordinates: { lat: number; lon: number };
    weather: { defaultCity: string };
  };
  transparency: {
    procurement: {
      organizationName: string;
      externalDashboard: string;
    };
    infrastructure: {
      searchString: string;
      exactMatchTargets: string[];
    };
  };
  dataPaths: Record<string, string>;
  features: {
    openLGU: boolean;
    transparency: boolean;
    tourism: boolean;
    statistics: boolean;
  };
}

export const config = lguConfig as LGUConfig;
export default config;
