import { http, HttpResponse, delay } from 'msw';
import { environment } from "@env/environment.development";
import { MOCK_ATTENDANCE_LOGS } from "@mocks/data/attendance.days.data";

let localAttendanceLogs = [...MOCK_ATTENDANCE_LOGS];

export const attendanceDaysHandlers = [
  http.get(`${environment.baseUrl}/api/attendance/all`, async ({ request }) => {
    const url = new URL(request.url);

    const getCleanParam = (key: string) => {
      const val = url.searchParams.get(key);
      return (val === 'undefined' || val === 'null' || !val) ? null : val;
    };

    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 10);
    const search = getCleanParam('search')?.toLowerCase();
    const fromDate = getCleanParam('fromDate');
    const toDate = getCleanParam('toDate');
    const status = getCleanParam('status');

    // DEBUG: عشان تشوف في الـ Console إيه اللي واصل فعلاً للـ Mock
    console.group('🚀 [MSW] Attendance All Request');
    console.log('Incoming Raw Params:', {
      search: url.searchParams.get('search'),
      fromDate: url.searchParams.get('fromDate')
    });
    console.log('Cleaned Params:', { search, fromDate, toDate });

    // --- 2. Filter Logic ---
    let filtered = localAttendanceLogs.filter(item => {
      const matchesSearch = !search ||
        item.employeeName.toLowerCase().includes(search) ||
        item.employeeId.toLowerCase().includes(search);

      let matchesDateRange = true;
      if (fromDate) matchesDateRange = matchesDateRange && item.date >= fromDate;
      if (toDate) matchesDateRange = matchesDateRange && item.date <= toDate;

      const matchesStatus = !status || item.status === status;

      return matchesSearch && matchesDateRange && matchesStatus;
    });

    console.log(`✅ Found Matches: ${filtered.length}`);
    console.groupEnd();

    // --- 3. Sorting ---
    filtered.sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.checkIn || '00:00'}`).getTime();
      const dateTimeB = new Date(`${b.date}T${b.checkIn || '00:00'}`).getTime();
      return dateTimeB - dateTimeA; // الأحدث أولاً
    });

    // --- 4. Pagination ---
    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    await delay(500);

    return HttpResponse.json({
      data: paginatedData,
      total: total,
      page: page,
      limit: limit
    });
  }),

  //for attendanceLogDetails page
  http.get(`${environment.baseUrl}/api/attendance/details/:id`, async ({ params }) => {
    const id = params['id'] as string;
    const log = localAttendanceLogs.find(item => item.id === id);

    if (!log) {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return HttpResponse.json({
      id: log.id,
      employeeName: log.employeeName,
      date: log.date,
      status: log.status,
      checkIn: log.checkIn,
      checkOut: log.checkOut,
      sessionNumber: `Session-${log.id}`,
      source: log.employeeName
    });
  }),
];
