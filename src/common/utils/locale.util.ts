import { I18nContext } from 'nestjs-i18n';

const languages = ['ru', 'en', 'qq', 'kk', 'uz', 'oz'];

export const currentLocale = (): string => {
  const lang = I18nContext.current()?.lang?.split('-')[0];
  console.log('lang', lang);
  if (!lang || !languages.includes(lang)) {
    return 'uz';
  }
  return lang;
};
