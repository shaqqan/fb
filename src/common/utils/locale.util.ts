import { I18nContext } from 'nestjs-i18n';

const languages = ['ru', 'en', 'kk', 'kk_k', 'uz', 'uz_k']; 

export const currentLocale = (): string => {
  const lang = I18nContext.current()?.lang?.split('-')[0] || 'uz';
  if (!languages.includes(lang)) {
    return 'uz';
  }
  return lang;
};
