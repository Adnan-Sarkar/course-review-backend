export interface TError {
  success: boolean;
  message: string;
  errorMessage: string;
  errorDetails: any;
  stack: string;
}
