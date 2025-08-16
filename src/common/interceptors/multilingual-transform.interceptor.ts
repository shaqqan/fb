import { 
  Injectable, 
  NestInterceptor, 
  ExecutionContext, 
  CallHandler 
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { currentLocale } from '../utils/current-locale.util';

interface MultilingualField {
  [key: string]: string;
}

@Injectable()
export class MultilingualTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        if (!data) return data;

        // Handle paginated responses
        if (data.data && Array.isArray(data.data)) {
          data.data = data.data.map(item => this.transformItem(item, true));
          return data;
        }

        // Handle array responses
        if (Array.isArray(data)) {
          return data.map(item => this.transformItem(item, true));
        }

        // Handle single item responses
        return this.transformItem(data, false);
      })
    );
  }

  private transformItem(item: any, isPaginated: boolean): any {
    if (typeof item !== 'object' || item === null) return item;

    const transformedItem = { ...item };

    Object.keys(transformedItem).forEach(key => {
      const value = transformedItem[key];
      
      // Check if the field is a multilingual object
      if (this.isMultilingualField(value)) {
        if (isPaginated) {
          // For paginated responses, return only the current locale
          transformedItem[key] = value[currentLocale()] || value['uz'];
        } else {
          // For single item responses, keep the full multilingual object
          transformedItem[key] = value;
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recursively transform nested objects
        transformedItem[key] = this.transformItem(value, isPaginated);
      }
    });

    return transformedItem;
  }

  private isMultilingualField(value: any): boolean {
    return (
      typeof value === 'object' && 
      value !== null && 
      Object.keys(value).every(key => 
        ['ru', 'en', 'kk', 'kk_k', 'uz', 'uz_k'].includes(key)
      )
    );
  }
}
