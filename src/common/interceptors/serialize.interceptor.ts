import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ClassConstructor {
  new (...args: any[]): any;
}

interface StandardResponse {
  data?: unknown;
  [key: string]: unknown;
}

export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: ClassConstructor) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((response: StandardResponse) => {
        const sourceData =
          response.data !== undefined ? response.data : response;

        const serializedData = plainToInstance(this.dto, sourceData, {
          excludeExtraneousValues: true,
        }) as unknown;

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
