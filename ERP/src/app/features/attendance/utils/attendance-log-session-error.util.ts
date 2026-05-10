import { IRemoteServiceError } from '@core/models/iremote-service-error';

export const ATTENDANCE_LOG_SESSION_ERROR_MAP: Record<string, string> = {
  'Attendance:AttendanceLogSessionAlreadyOpen': 'ATTENDANCE.OPEN_SESSION_ALREADY_EXISTS',
};

export interface AttendanceLogSessionErrorPresentation {
  message: string;
  isModal: boolean;
  type: 'error' | 'warning';
  actionLabel: string;
  cancelLabel?: string;
  existingSessionId?: string;
}

export function resolveAttendanceLogSessionSaveError(error: unknown): AttendanceLogSessionErrorPresentation {
  const backendError = extractBackendError(error);
  const mappedMessage = backendError.code ? ATTENDANCE_LOG_SESSION_ERROR_MAP[backendError.code] : undefined;

  if (backendError.code === 'Attendance:AttendanceLogSessionAlreadyOpen') {
    return {
      message: mappedMessage ?? backendError.message ?? 'COMMON.MESSAGES.PLEASE_TRY_AGAIN',
      isModal: true,
      type: 'warning',
      actionLabel: backendError.existingSessionId
        ? 'ATTENDANCE.VIEW_OPEN_SESSION'
        : 'ATTENDANCE.SHOW_OPEN_SESSIONS',
      cancelLabel: 'COMMON.CANCEL',
      existingSessionId: backendError.existingSessionId,
    };
  }

  if (mappedMessage || backendError.code?.startsWith('Attendance:')) {
    return {
      message: mappedMessage ?? backendError.message ?? 'COMMON.MESSAGES.PLEASE_TRY_AGAIN',
      isModal: true,
      type: 'error',
      actionLabel: 'COMMON.CONFIRM',
    };
  }

  return {
    message: 'COMMON.MESSAGES.PLEASE_TRY_AGAIN',
    isModal: false,
    type: 'error',
    actionLabel: 'COMMON.CONFIRM',
  };
}

function extractBackendError(error: unknown) {
  const layers = collectErrorLayers(error);
  const remoteError = layers.find((layer): layer is IRemoteServiceError =>
    typeof layer?.message === 'string' &&
    (
      typeof layer?.code === 'string' ||
      Array.isArray(layer?.validationErrors) ||
      layer?.data != null ||
      layer?.details != null
    ),
  );

  const data = remoteError?.data ?? layers.find(layer => layer?.data != null)?.data;

  return {
    code: remoteError?.code || pickFirstString(layers.map(layer => layer?.code)) || '',
    message: remoteError?.message || pickFirstString(layers.map(layer => layer?.message)) || '',
    existingSessionId: pickDataString(data, 'AttendanceLogSessionId'),
  };
}

function collectErrorLayers(error: unknown) {
  const layers: Array<any> = [];
  let current: any = error;

  for (let index = 0; index < 5 && current; index += 1) {
    layers.push(current);
    current = current?.error;
  }

  return layers;
}

function pickFirstString(values: unknown[]) {
  return values.find((value): value is string => typeof value === 'string' && value.trim().length > 0) ?? '';
}

function pickDataString(data: unknown, key: string) {
  if (!data || typeof data !== 'object') {
    return undefined;
  }

  const value = (data as Record<string, unknown>)[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}
