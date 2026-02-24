export type ApiErrorBody = {
  error: {
    message: string;
    code?: string;
    details?: string;
  };
};
