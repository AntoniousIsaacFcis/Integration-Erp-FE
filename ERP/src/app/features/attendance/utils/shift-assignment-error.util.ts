import { IRemoteServiceError } from '@core/models/iremote-service-error';

const SHIFT_ASSIGNMENT_ERROR_MAP: Record<string, string> = {
  'Attendance:DuplicateActiveManualEmployeeAssignment': 'ERRORS.DUPLICATE_ACTIVE_MANUAL_EMPLOYEE_ASSIGNMENT',
};

export function resolveShiftAssignmentSaveError(error: unknown) {
  const backendError = extractBackendError(error);
  const mappedMessage = backendError.code ? SHIFT_ASSIGNMENT_ERROR_MAP[backendError.code] : undefined;

  if (mappedMessage) {
    return {
      message: mappedMessage,
      isModal: true,
    };
  }

  if (backendError.code?.startsWith('Attendance:')) {
    return {
      message: backendError.message || 'COMMON.MESSAGES.PLEASE_TRY_AGAIN',
      isModal: true,
    };
  }

  return {
    message: 'COMMON.MESSAGES.PLEASE_TRY_AGAIN',
    isModal: false,
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

  return {
    code: remoteError?.code || pickFirstString(layers.map(layer => layer?.code)) || '',
    message: remoteError?.message || pickFirstString(layers.map(layer => layer?.message)) || '',
  };
}

function collectErrorLayers(error: unknown) {
  const layers: Array<any> = [];
  let current: any = error;

  for (let index = 0; index < 4 && current; index += 1) {
    layers.push(current);
    current = current?.error;
  }

  return layers;
}

function pickFirstString(values: unknown[]) {
  return values.find((value): value is string => typeof value === 'string' && value.trim().length > 0) ?? '';
}
