export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface INotification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  isModal?: boolean;
  actionLabel: string;
  cancelLabel?: string;
  onAction?: () => void;
  onCancel?: () => void;
}
