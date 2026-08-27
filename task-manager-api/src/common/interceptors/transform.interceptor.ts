import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        const message = response.req.method === 'POST'
          ? 'Resource created successfully'
          : 'Operation completed successfully';

        return {
          success: true,
          statusCode: response.statusCode,
          message: data?.message || message,
          data: data?.data !== undefined ? data.data : data,
        };
      }),
    );
  }
}