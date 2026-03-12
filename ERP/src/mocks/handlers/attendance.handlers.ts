// @core/mocks/handlers/attendance.handlers.ts
import { http, HttpResponse, delay } from 'msw';
import { environment } from '@env/environment.development';
import { MOCK_ATTENDANCE_DATA } from '@mocks/data/attendance.data';


export const attendanceHandlers = [
  http.get(`${environment.baseUrl}/api/attendance/available-years`, async () => {
    // Get years from the first employee's data
    const firstEmployeeId = Object.keys(MOCK_ATTENDANCE_DATA)[0];
    const years = Object.keys((MOCK_ATTENDANCE_DATA as any)[firstEmployeeId]).sort((a, b) => Number(b) - Number(a));
    console.log(`years from database ${years}`);
    return HttpResponse.json(years.map(y => ({ label: y, value: y })));
  }),

  http.get(`${environment.baseUrl}/api/attendance/:id`, async ({ params, request }) => {
    const id = params['id'] as string;
    const url = new URL(request.url);
    const year = url.searchParams.get('year') || '2025';
    const month = url.searchParams.get('month') || '1';

    await delay(500);

    const employeeData = (MOCK_ATTENDANCE_DATA as any)[id];
    const yearData = employeeData?.[year];
    const data = yearData?.[month] || [];

    return HttpResponse.json(data);
  }),
];
