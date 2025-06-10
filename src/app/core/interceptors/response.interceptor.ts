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
  implements NestInterceptor<T, ApiResponse<T> | T>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T> | T> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    return next.handle().pipe(
      map((data: T | ApiResponse<T>) => {
        if (this.isApiResponse(data)) {
          return data;
        }

        const message = this.getDefaultMessage(method);
        return {
          status: 'success',
          message,
          data: data,
        };
      }),
    );
  }

  private isApiResponse<T>(data: any): data is ApiResponse<T> {
    return (
      data &&
      typeof data === 'object' &&
      'status' in data &&
      'message' in data &&
      'data' in data
    );
  }

  private getDefaultMessage(method: string): string {
    switch (method) {
      case 'DELETE':
        return 'Data deleted successfully';
      case 'POST':
        return 'Data created successfully';
      case 'PATCH':
      case 'PUT':
        return 'Data updated successfully';
      case 'GET':
        return 'Data retrieved successfully';
      default:
        return 'Operation completed successfully';
    }
  }
}
