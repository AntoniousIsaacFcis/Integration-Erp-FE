export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface INotification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  isModal?: boolean;
  email?: string;
  temporaryPassword?: string;
  actionLabel: string;
  cancelLabel?: string;
  onAction?: () => void;
  onCancel?: () => void;
}
