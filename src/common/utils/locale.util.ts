import { I18nContext } from 'nestjs-i18n';

const languages = ['ru', 'en', 'qq', 'kk', 'uz', 'oz'];

export const currentLocale = (): string => {
  const context = I18nContext.current();
  const lang = context?.lang?.split('-')[0];
  
  console.log('I18nContext current:', context);
  console.log('Raw lang from context:', context?.lang);
  console.log('Processed lang:', lang);
  
  if (!lang || !languages.includes(lang)) {
    console.log('Using fallback locale: uz');
    return 'uz';
  }
  
  console.log('Using resolved locale:', lang);
  return lang;
};
