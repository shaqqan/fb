import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { currentLocale } from '../utils/locale.util';

@Injectable()
export class MultilingualTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Only transform pagination responses
        if (this.isPaginationResponse(data)) {
          return this.transformPaginationData(data);
        }
        return data;
      }),
    );
  }

  private isPaginationResponse(data: any): boolean {
    return data &&
      typeof data === 'object' &&
      'data' in data &&
      'meta' in data &&
      'links' in data &&
      Array.isArray(data.data);
  }

  private transformPaginationData(data: any): any {
    const currentLang = currentLocale();

    return {
      ...data,
      data: data.data.map((item: any) => this.transformMultilingualProperties(item, currentLang))
    };
  }

  private transformMultilingualProperties(item: any, currentLang: string): any {
    if (!item || typeof item !== 'object') {
      return item;
    }

    const transformed = { ...item };

    // List of known multilingual properties
    const multilingualProps = [
      'title', 'description', 'name', 'fullName', 'position',
      'information', 'content', 'summary', 'subtitle'
    ];

    for (const prop of multilingualProps) {
      if (transformed[prop] && typeof transformed[prop] === 'object') {
        // Check if it's a multilingual object
        if (this.isMultilingualObject(transformed[prop])) {
          // Get the value for current language, fallback to 'uz' if not found
          transformed[prop] = transformed[prop][currentLang] || transformed[prop]['uz'] || '';
        }
      }
    }

    // Recursively transform nested objects
    for (const key in transformed) {
      if (
        transformed[key] &&
        typeof transformed[key] === 'object' &&
        !Array.isArray(transformed[key])
      ) {
        // ✅ Skip Date objects
        if (transformed[key] instanceof Date) {
          continue;
        }

        transformed[key] = this.transformMultilingualProperties(
          transformed[key],
          currentLang,
        );
      }
    }

    return transformed;
  }

  private isMultilingualObject(obj: any): boolean {
    if (!obj || typeof obj !== 'object') return false;

    // Check if it has multilingual language keys
    const langKeys = ['uz', 'ru', 'en', 'kk', 'kk_k', 'uz_k'];
    return langKeys.some(key => key in obj);
  }
}
