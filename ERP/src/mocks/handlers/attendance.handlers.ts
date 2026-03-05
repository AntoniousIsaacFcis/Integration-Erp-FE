// @core/mocks/handlers/attendance.handlers.ts
import { http, HttpResponse, delay } from 'msw';
import { environment } from '@env/environment.development';
import { MOCK_ATTENDANCE_DATA } from '@mocks/data/attendance.data';

export const attendanceHandlers = [
  http.get(`${environment.baseUrl}/api/attendance/available-years`, async () => {
    const years = Object.keys(MOCK_ATTENDANCE_DATA).sort((a, b) => Number(b) - Number(a));
    console.log(`years from database ${years}`)
    return HttpResponse.json(years.map(y => ({ label: y, value: y })));
  }),

  http.get(`${environment.baseUrl}/api/employees/:id/attendance`, async ({ params, request }) => {
    const { id } = params;
    const url = new URL(request.url);
    const year = url.searchParams.get('year') || '2025';
    const month = url.searchParams.get('month') || '1';

    await delay(600);

    const yearData = MOCK_ATTENDANCE_DATA[year];
    if (!yearData) return HttpResponse.json([]);

    const data = yearData ? yearData[month] : [];

    return HttpResponse.json(data);
  }),

];
