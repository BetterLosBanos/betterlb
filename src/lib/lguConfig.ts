import lguConfig from '../../config/lgu.config.json';

export interface LGUConfig {
  lgu: {
    name: string;
    fullName: string;
    province: string;
    districtEngineeringOffice?: string;
    region: string;
    /** ISO-like region code (e.g. "040000000") */
    regionCode: string;
    type: 'municipality' | 'city' | 'province';
    officialWebsite: string;
    provinceWebsite: string;
  };
  portal: {
    name: string;
    domain: string;
    baseUrl: string;
    description: string;
    brandColor: string;
    footerBrandName: string;
    logoWhitePath: string;
    navbarLogoPath: string;
    defaultOgImagePath: string;
    faviconPath: string;
    faviconSvgPath: string;
    appleTouchIconPath: string;
    githubUrl: string;
    discordUrl: string;
    facebookUrl: string;
    contactEmail: string;
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
