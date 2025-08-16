import { I18nContext } from 'nestjs-i18n';

const languages = ['ru', 'en', 'kk', 'kk_k', 'uz', 'uz_k'];

export const currentLocale = (): string => {
  const lang = I18nContext.current()?.lang?.split('-')[0] || 'uz';
  return languages.includes(lang) ? lang : 'uz';
};

export function transformMultilingualProperties<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(transformMultilingualProperties) as T;
  }

  if (typeof obj === 'object') {
    const locale = currentLocale();
    const transformedObj = {} as any;

    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && Object.keys(value).some(k => languages.includes(k))) {
        // If the value is an object with language keys
        transformedObj[key] = value[locale] || value['uz'] || Object.values(value)[0];
      } else if (typeof value === 'object') {
        // Recursively transform nested objects
        transformedObj[key] = transformMultilingualProperties(value);
      } else {
        transformedObj[key] = value;
      }
    }

    return transformedObj as T;
  }

  return obj;
}
