import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    validationErrors?: Array<{ field: string; message: string }>;
  };
}

export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): void {
  res.status(statusCode).json({
    success: true,
    data,
  });
}

export function sendCreated<T>(res: Response, data: T): void {
  sendSuccess(res, data, 201);
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: number = 500,
  validationErrors?: Array<{ field: string; message: string }>
): void {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(validationErrors && { validationErrors }),
    },
  };

  res.status(statusCode).json(response);
}
