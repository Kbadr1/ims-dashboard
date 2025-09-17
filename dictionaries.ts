import 'server-only'; 
import { Locale } from './i18n-config'; 

export interface Dictionary {
  navbar: {
    home: string;
    solutions: string;
    coverage: string;
    partners: string;
    contact: string; 
    get_started: string;
    live: string;
    logout: string;
  };
  home: {
    title: string;
    subtitle: string;
    description: string;
    get_started: string;
    add_country: string;
  };
  hero: {
    new_badge: string;
    latest_integration: string;
    main_title: string;
    subtitle: string;
    partners_text: string;
  };
  about: {
    title: string;
    description: string;
  };
  services: {
    title: string;
    description: string;
  };
  contact: {
    title: string;
    subtitle: string;
    phone: {
      label: string;
      value: string;
    };
    email: {
      label: string;
      value: string;
    };
    location: {
      label: string;
      value: string;
    };
    form: {
      name: string;
      country: string;
      email: string;
      company: string;
      traffic_sources: string;
      skype_id: string;
      message: string;
      send_button: string;
      sending: string;
      success_title: string;
      success_message: string;
      placeholders: {
        name: string;
        country: string;
        email: string;
        company: string;
        traffic_sources: string;
        skype_id: string;
        message: string;
      };
    };
  };
  footer: {
    copyright: string;
    sections: {
      company: string;
      solutions: string;
      resources: string;
      contact: string;
    };
    company_links: {
      about_us: string;
      partners: string;
      contact: string;
    };
    solutions_links: {
      click2sms: string;
      carrier_billing: string;
      cpi_offers: string;
    };
    resources_links: {
      faq: string;
      privacy_policy: string;
      terms_conditions: string;
    };
    contact_info: {
      address: string;
      phone: string;
      email: string;
    };
  };
  stats: {
    daily_leads: {
      number: string;
      title: string;
      description: string;
    };
    connected_geos: {
      number: string;
      title: string;
      description: string;
    };
    delivery_rate: {
      number: string;
      title: string;
      description: string;
    };
  };
  whatWeOffer: {
    title: string;
    subtitle: string;
    offers: {
      exclusive_in_house: {
        title: string;
        description: string;
      };
      network: {
        title: string;
        description: string;
      };
      best_converting: {
        title: string;
        description: string;
      };
    };
  };
  features: {
    click2sms: {
      category: string;
      title: string;
      description: string;
      features: string[];
    };
    carrier_billing: {
      category: string;
      title: string;
      description: string;
      features: string[];
    };
    cpi_offers: {
      category: string;
      title: string;
      description: string;
      features: string[];
    };
  };
  numbers: {
    live_countries: {
      number: string;
      label: string;
    };
    leads_daily: {
      number: string;
      label: string;
    };
    conversions_daily: {
      number: string;
      label: string;
    };
    live_carriers: {
      number: string;
      label: string;
    };
  };
  worldwide: {
    title: string;
    description: string;
  };
  login: {
    title: string;
    subtitle: string;
    username: string;
    password: string;
    sign_in: string;
    forgot_password: string;
    remember_me: string;
    placeholders: {
      username: string;
      password: string;
    };
    errors: {
      required: string;
      invalid_credentials: string;
    };
  };
}

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import('./public/dictionaries/en.json').then((module) => module.default),
  ar: () => import('./public/dictionaries/ar.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) =>
  dictionaries[locale]?.() ?? dictionaries.en();
