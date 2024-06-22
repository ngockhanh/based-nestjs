import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  StreamableFile,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  pagination?: {}
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next
      .handle()
      .pipe(map((data) => {
        if (data instanceof StreamableFile) {
          return data;
        }

        if (data?.pagination) {
          return {
            data: data.data,
            pagination: data.pagination,
          };
        }

        return { data };
      }));
  }
}
