import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/response.interface';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    return next.handle().pipe(
      map((data: T) => {
        let message = 'Operation completed successfully';

        if (method === 'DELETE') {
          message = 'Data deleted successfully';
        } else if (method === 'POST') {
          message = 'Data created successfully';
        } else if (method === 'PATCH' || method === 'PUT') {
          message = 'Data updated successfully';
        } else if (method === 'GET') {
          message = 'Data retrieved successfully';
        }

        return {
          status: 'success',
          message,
          data: data,
        };
      }),
    );
  }
}
