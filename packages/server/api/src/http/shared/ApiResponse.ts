export interface ApiErrorDetail {
  readonly code: string;
  readonly message: string;
}

/**
 * Respuesta estandarizada para toda la API.
 * Los controllers usan ok(), el errorHandler usa fail().
 */
export class ApiResponse<T = null> {
  private constructor(
    readonly success: boolean,
    readonly message: string,
    readonly data: T,
    readonly errors: ApiErrorDetail[],
    readonly requestId?: string,
  ) {}

  static ok<T>(data: T, message: string = 'OK'): ApiResponse<T> {
    return new ApiResponse(true, message, data, []);
  }

  static fail(
    message: string,
    errors: ApiErrorDetail[] = [],
  ): ApiResponse<null> {
    return new ApiResponse(false, message, null, errors);
  }

  withRequestId(requestId: string): ApiResponse<T> {
    return new ApiResponse(this.success, this.message, this.data, this.errors, requestId);
  }
}
