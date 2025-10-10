export interface CountryBase {
  cca2: string;
  cca3: string;
  name: {
    common: string;
    nativeName: Record<string, { common: string }>;
  };
}

export interface Country extends CountryBase {}
