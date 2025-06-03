import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LanguageType } from '../types';

interface LanguageContextType {
  language: LanguageType;
  setLanguage: (language: LanguageType) => void;
  translate: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple translations for demonstration
const translations: Record<LanguageType, Record<string, string>> = {
  en: {
    'navbar.philippines': 'The Philippines',
    'navbar.home': 'Home',
    'navbar.services': 'Services',
    'navbar.travel': 'Travel',
    'navbar.government': 'Government',
    'hero.title': 'Welcome to BetterGov.ph',
    'hero.subtitle': 'The Unofficial Portal of the Republic of the Philippines. Access government services, stay updated with the latest news, and find information about the Philippines.',
    'hero.search': 'Search for services, information, or agencies',
    'services.title': 'Popular Services',
    'news.title': 'Latest News and Updates',
    'weather.title': 'Weather Updates',
    'forex.title': 'Foreign Exchange Rates',
    'footer.copyright': '© 2025 BetterGov. Public Domain.',
    // Add more translations as needed
  },
  fil: {
    'navbar.home': 'Tahanan',
    'navbar.services': 'Mga Serbisyo',
    'navbar.travel': 'Paglalakbay',
    'navbar.government': 'Pamahalaan',
    'hero.title': 'Maligayang Pagdating sa Unopisyal na Portal ng Republika ng Pilipinas',
    'hero.subtitle': 'I-access ang mga serbisyo ng pamahalaan, manatiling updated sa pinakabagong balita, at humanap ng impormasyon tungkol sa Pilipinas.',
    'hero.search': 'Maghanap ng mga serbisyo, impormasyon, o ahensya',
    'services.title': 'Mga Sikat na Serbisyo',
    'news.title': 'Pinakabagong Balita at Updates',
    'weather.title': 'Mga Update sa Panahon',
    'forex.title': 'Palitan ng Pera',
    'footer.copyright': '© 2025 Republika ng Pilipinas. Nakalaan ang lahat ng karapatan.',
    // Add more translations as needed
  },
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageType>('en');

  useEffect(() => {
    // You could load the language preference from localStorage here
    const savedLanguage = localStorage.getItem('language') as LanguageType;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fil')) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const translate = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};