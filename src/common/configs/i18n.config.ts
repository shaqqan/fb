import * as NestConfig from '@nestjs/config';

export const I18nConfig = NestConfig.registerAs('i18n', () => ({
  fallbackLanguage: process.env.I18N_FALLBACK_LOCALE || 'uz',
  locale: process.env.I18N_LOCALE || 'uz',
  fakerLocale: process.env.I18N_FAKER_LOCALE || 'uz',
  fallbacks: {
    'uz': 'uz',
    'ru': 'ru',
    'en': 'en',
    'qq': 'qq',
    'kk': 'kk',
    'oz': 'oz',
  },
  typesOutputPath: process.env.I18N_TYPES_OUTPUT_PATH || 'src/generated/i18n.generated.ts',
  loaderOptions: {
    path: process.env.I18N_PATH || 'src/i18n',
    watch: process.env.I18N_WATCH === 'true',
  },
}));
