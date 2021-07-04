export interface HttpResponse {
  status?: number;
  headers?: {
    [header: string]: string;
  };
  body: any;
}

export function createSuccessResponse(code: string, message: string) {
  return (result?: unknown): HttpResponse => ({
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: {
      success: true,
      code,
      message,
      result,
    },
  });
}

export function createErrorResponse(code: string, message: string, statusCode?: number) {
  return (): HttpResponse => ({
    status: statusCode || 500,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: {
      success: false,
      code,
      message,
    },
  });
}
