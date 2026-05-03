import { http, HttpResponse, delay } from 'msw';
import { environment } from '@env/environment.development';
import { MOCK_ATTENDANCE_LOGS } from '@mocks/data/attendance.days.data';

let localAttendanceLogs = [...MOCK_ATTENDANCE_LOGS];

export const attendanceDaysHandlers = [
  http.get(`${environment.baseUrl}/api/attendance/attendance-day`, async ({ request }) => {
    const url = new URL(request.url);

    const getCleanParam = (key: string) => {
      const val = url.searchParams.get(key);
      return (val === 'undefined' || val === 'null' || !val) ? null : val;
    };

    const skipCount = Number(url.searchParams.get('skipCount') || 0);
    const limit = Number(url.searchParams.get('maxResultCount') || url.searchParams.get('limit') || 10);
    const page = Math.floor(skipCount / limit) + 1;
    const search = getCleanParam('search')?.toLowerCase();
    const fromDate = getCleanParam('fromDate');
    const toDate = getCleanParam('toDate');
    const status = getCleanParam('status');

    console.group('🚀 [MSW] Attendance Day Request');
    console.log('Incoming Raw Params:', {
      search: url.searchParams.get('search'),
      fromDate: url.searchParams.get('fromDate')
    });
    console.log('Cleaned Params:', { search, fromDate, toDate });

    const filtered = localAttendanceLogs.filter(item => {
      const matchesSearch = !search ||
        item.employeeName.toLowerCase().includes(search) ||
        item.employeeId.toLowerCase().includes(search);

      let matchesDateRange = true;
      if (fromDate) matchesDateRange = matchesDateRange && item.date >= fromDate;
      if (toDate) matchesDateRange = matchesDateRange && item.date <= toDate;

      const matchesStatus = !status || item.status === toAttendanceStatusKey(status);

      return matchesSearch && matchesDateRange && matchesStatus;
    });

    console.log(`✅ Found Matches: ${filtered.length}`);
    console.groupEnd();

    filtered.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.checkIn || '00:00'}`).getTime();
      const dateTimeB = new Date(`${b.date}T${b.checkIn || '00:00'}`).getTime();
      return dateTimeB - dateTimeA;
    });

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit).map(item => ({
      id: item.id,
      employeeId: item.employeeId,
      shiftId: null,
      date: `${item.date}T00:00:00`,
      status: item.status === 'present' ? 1 : item.status === 'absent' ? 2 : 3,
      dayOffReason: null,
      onDutyTime: null,
      offDutyTime: null,
      signInTime: `${item.date}T${item.checkIn || '00:00'}:00`,
      signOutTime: `${item.date}T${item.checkOut || '00:00'}:00`,
      calculationType: 2,
      workedMinutes: toWorkedMinutes(item.checkIn, item.checkOut),
      delayMinutes: 0,
      earlyLeaveMinutes: 0,
      calculatedAt: null,
      leaveTypeId: null,
      leaveCount: 0,
      notes: null,
      attendanceSheetId: null,
      attendancePermissionId: null,
    }));

    await delay(500);

    return HttpResponse.json({
      items: paginatedData,
      totalCount: total,
    });
  }),

  http.get(`${environment.baseUrl}/api/core-hR/staff`, async () => {
    const staffItems = localAttendanceLogs.map(item => ({
      id: item.employeeId,
      staffCode: item.employeeId,
      firstName: item.employeeName.split(' ')[0] || item.employeeName,
      lastName: item.employeeName.split(' ').slice(1).join(' ') || '',
      fullName: item.employeeName,
      fullNameAr: item.employeeName,
      fullNameEn: item.employeeName,
      isActive: true,
    }));

    return HttpResponse.json({
      totalCount: staffItems.length,
      items: staffItems,
    });
  }),

  http.get(`${environment.baseUrl}/api/attendance/attendance-day/:id`, async ({ params }) => {
    const id = params['id'] as string;
    const log = localAttendanceLogs.find(item => item.id === id);

    if (!log) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return HttpResponse.json(toAttendanceDayDto(log));
  }),

  http.put(`${environment.baseUrl}/api/attendance/attendance-day/:id`, async ({ params, request }) => {
    const id = params['id'] as string;
    const payload = await request.json() as {
      date?: string;
      status?: number;
      signInTime?: string | null;
      signOutTime?: string | null;
    };
    const index = localAttendanceLogs.findIndex(item => item.id === id);

    if (index < 0) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }

    localAttendanceLogs[index] = {
      ...localAttendanceLogs[index],
      date: payload.date?.slice(0, 10) ?? localAttendanceLogs[index].date,
      status: payload.status === 1 ? 'present' : payload.status === 3 ? 'onLeave' : 'absent',
      checkIn: toClockTime(payload.signInTime) ?? localAttendanceLogs[index].checkIn,
      checkOut: toClockTime(payload.signOutTime) ?? localAttendanceLogs[index].checkOut,
    };

    return HttpResponse.json(toAttendanceDayDto(localAttendanceLogs[index]));
  }),

  http.delete(`${environment.baseUrl}/api/attendance/attendance-day/:id`, async ({ params }) => {
    const id = params['id'] as string;
    localAttendanceLogs = localAttendanceLogs.filter(item => item.id !== id);

    return new HttpResponse(null, { status: 204 });
  }),

];

function toAttendanceDayDto(item: (typeof localAttendanceLogs)[number]) {
  return {
    id: item.id,
    employeeId: item.employeeId,
    shiftId: null,
    date: `${item.date}T00:00:00`,
    status: item.status === 'present' ? 1 : item.status === 'absent' ? 2 : 3,
    dayOffReason: null,
    onDutyTime: `${item.date}T09:00:00`,
    offDutyTime: `${item.date}T17:00:00`,
    signInTime: `${item.date}T${item.checkIn || '00:00'}:00`,
    signOutTime: `${item.date}T${item.checkOut || '00:00'}:00`,
    calculationType: 2,
    workedMinutes: toWorkedMinutes(item.checkIn, item.checkOut),
    delayMinutes: 0,
    earlyLeaveMinutes: 0,
    calculatedAt: null,
    leaveTypeId: null,
    leaveCount: 0,
    notes: null,
    attendanceSheetId: null,
    attendancePermissionId: null,
  };
}

function toClockTime(value?: string | null) {
  const match = value?.match(/T(\d{2}:\d{2})/);
  return match?.[1] ?? null;
}

function toWorkedMinutes(checkIn?: string | null, checkOut?: string | null) {
  const start = toMinutes(checkIn);
  const end = toMinutes(checkOut);

  if (start === null || end === null) {
    return 0;
  }

  return end >= start ? end - start : end + (24 * 60) - start;
}

function toMinutes(value?: string | null) {
  const match = value?.match(/^(\d{1,2}):(\d{2})/);

  if (!match) {
    return null;
  }

  return (Number(match[1]) * 60) + Number(match[2]);
}

function toAttendanceStatusKey(status: string) {
  switch (status) {
    case '1':
      return 'present';
    case '2':
      return 'absent';
    case '3':
      return 'onLeave';
    default:
      return status;
  }
}
