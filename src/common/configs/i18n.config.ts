import * as NestConfig from '@nestjs/config';

export const I18nConfig = NestConfig.registerAs('i18n', () => ({
  fallbackLanguage: process.env.I18N_FALLBACK_LOCALE || 'uz',
  locale: process.env.I18N_LOCALE || 'uz',
  fakerLocale: process.env.I18N_FAKER_LOCALE || 'uz',
}));
