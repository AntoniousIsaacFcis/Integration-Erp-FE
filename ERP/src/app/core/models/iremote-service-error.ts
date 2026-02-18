export interface IRemoteServiceError {
  code?: string;
  message: string;
  details?: string;
  data?: Record<string, string>;
  validationErrors?: Array<{
    message: string;
    members: string[];
  }>;
}

export interface IErrorResponse {
  error: IRemoteServiceError;
}
