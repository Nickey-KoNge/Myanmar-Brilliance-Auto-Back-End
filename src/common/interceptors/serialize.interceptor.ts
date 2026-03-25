import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// interface ClassConstructor {
//   new (...args: any[]): any;
// }
interface ClassConstructor<T = unknown> {
  new (...args: any[]): T;
}

interface StandardResponse {
  data?: unknown;
  [key: string]: unknown;
}

export function Serialize<T>(dto: ClassConstructor<T>) {
  return UseInterceptors(new SerializeInterceptor<T>(dto));
}

export class SerializeInterceptor<T> implements NestInterceptor {
  constructor(private dto: ClassConstructor<T>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      // map((response: StandardResponse) => {
      //   const sourceData =
      //     response.data !== undefined ? response.data : response;

      //   const serializedData = plainToInstance(this.dto, sourceData, {
      //     excludeExtraneousValues: true,
      //   }) as unknown;

      //   if (response.data !== undefined) {
      //     return {
      //       ...response,
      //       data: serializedData,
      //     };
      //   }

      //   return serializedData;
      // }),

      map((response: StandardResponse) => {
        const sourceData =
          response.data !== undefined ? response.data : response;

        let serializedData: T | T[];

        if (Array.isArray(sourceData)) {
          serializedData = sourceData.map((item) =>
            plainToInstance(this.dto, item, {
              excludeExtraneousValues: true,
            }),
          );
        } else {
          serializedData = plainToInstance(this.dto, sourceData, {
            excludeExtraneousValues: true,
          });
        }
        if (response.data !== undefined) {
          return {
            ...response,
            data: serializedData,
          };
        }

        return serializedData;
      }),
    );
  }
}
