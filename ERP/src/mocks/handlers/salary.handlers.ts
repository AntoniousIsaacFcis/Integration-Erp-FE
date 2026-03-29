// @core/mocks/handlers/salary.handlers.ts
import { http, HttpResponse, delay } from 'msw';
import { environment } from '@env/environment.development';
import { MOCK_SALARY_STORE } from '../data/salary.data';

export const salaryHandlers = [
  http.get(`${environment.baseUrl}/api/employees/:empId/salary`, async ({ request, params }) => {
    const { empId } = params;
    const url = new URL(request.url);

    const year = url.searchParams.get('year') || '2025';
    const rawMonth = url.searchParams.get('month') || '10';
    let month = rawMonth.startsWith('0') ? rawMonth.replace(/^0+/, '') : rawMonth;

    month = month.padStart(2, '0');

    await delay(500);

    const employeeSalaries = MOCK_SALARY_STORE[empId as string];
    const yearData = employeeSalaries ? employeeSalaries[year] : null;
    const monthData = yearData ? yearData[month] : null;

    if (!monthData) {
      return HttpResponse.json({
        summary: { monthlySalary: 0, status: 'PROCESSING', currency: 'ريال' },
        elements: [], total: 0, page: 1, limit: 10
      });
    }

    return HttpResponse.json(monthData);
  }),

  http.get(`${environment.baseUrl}/api/salary/available-years`, async ({ request }) => {
  const url = new URL(request.url);
  const employeeId = url.searchParams.get('employeeId');
  if (!employeeId) return HttpResponse.json([]);

  const employeeSalaries = MOCK_SALARY_STORE[employeeId];
  const years = Object.keys(employeeSalaries || {}).sort((a, b) => Number(b) - Number(a));
  return HttpResponse.json(years.map(y => ({ label: y, value: y })));
})
];
