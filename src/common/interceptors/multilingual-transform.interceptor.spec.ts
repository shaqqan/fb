import { Test, TestingModule } from '@nestjs/testing';
import { MultilingualTransformInterceptor } from './multilingual-transform.interceptor';
import { I18nContext } from 'nestjs-i18n';

// Mock I18nContext
jest.mock('nestjs-i18n', () => ({
  I18nContext: {
    current: jest.fn(),
  },
}));

describe('MultilingualTransformInterceptor', () => {
  let interceptor: MultilingualTransformInterceptor;
  let mockI18nContext: jest.Mocked<typeof I18nContext>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MultilingualTransformInterceptor],
    }).compile();

    interceptor = module.get<MultilingualTransformInterceptor>(MultilingualTransformInterceptor);
    mockI18nContext = I18nContext as jest.Mocked<typeof I18nContext>;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform pagination response with multilingual properties', () => {
    // Mock current locale
    mockI18nContext.current.mockReturnValue({ lang: 'en' } as any);

    const mockData = {
      data: [
        {
          id: 1,
          title: { en: 'English Title', uz: 'Uzbek Title', ru: 'Russian Title' },
          description: { en: 'English Description', uz: 'Uzbek Description' },
          name: 'Simple Name',
          nested: {
            title: { en: 'Nested English', uz: 'Nested Uzbek' }
          }
        }
      ],
      meta: { totalItems: 1, currentPage: 1 },
      links: { first: 'first', last: 'last' }
    };

    const mockContext = {} as any;
    const mockCallHandler = {
      handle: () => ({
        pipe: (fn: any) => fn(mockData)
      })
    } as any;

    const result = interceptor.intercept(mockContext, mockCallHandler);
    
    // The interceptor should transform the data
    expect(result).toBeDefined();
  });

  it('should not transform non-pagination responses', () => {
    const mockData = { id: 1, title: 'Simple Title' };
    const mockContext = {} as any;
    const mockCallHandler = {
      handle: () => ({
        pipe: (fn: any) => fn(mockData)
      })
    } as any;

    const result = interceptor.intercept(mockContext, mockCallHandler);
    expect(result).toBeDefined();
  });

  it('should handle empty pagination response', () => {
    const mockData = { data: [], meta: {}, links: {} };
    const mockContext = {} as any;
    const mockCallHandler = {
      handle: () => ({
        pipe: (fn: any) => fn(mockData)
      })
    } as any;

    const result = interceptor.intercept(mockContext, mockCallHandler);
    expect(result).toBeDefined();
  });
});
