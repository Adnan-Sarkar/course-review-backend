export interface TErrorResponse {
  success: boolean;
  message: string;
  errorMessage: string;
  errorDetails: any;
  stack: string;
}
