export enum ProcessingStatus {
  IDLE = 'IDLE',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface DocFile {
  id: string;
  name: string;
  originalContent: string;
  convertedHtml: string | null;
  status: ProcessingStatus;
  errorMessage?: string;
}
