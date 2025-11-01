import { I18nContext } from 'nestjs-i18n';

const languages = ['ru', 'en', 'qq', 'kk', 'uz', 'oz'];

export const currentLocale = (): string => {
  const context = I18nContext.current();
  const lang = context?.lang?.split('-')[0];

  if (!lang || !languages.includes(lang)) {
    return 'uz';
  }

  return lang;
};
