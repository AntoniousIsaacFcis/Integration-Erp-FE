// @core/mocks/handlers/vacation.handlers.ts
import { http, HttpResponse, delay } from 'msw';
import { environment } from '@env/environment.development';
import { MOCK_VACATIONS_STORE } from '../data/vacations.data';

export const vacationHandlers = [
  http.get(`${environment.baseUrl}/api/employees/:empId/vacations`, async ({ request, params }) => {
    const { empId } = params;
    const url = new URL(request.url);

    // 1. استخراج معاملات الصفحة
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const year = url.searchParams.get('year');
    const month = url.searchParams.get('month');

    await delay(600);

    const employeeEntry = MOCK_VACATIONS_STORE[empId as string];
    if (!employeeEntry) return new HttpResponse(null, { status: 404 });

    // 2. تطبيق منطق الـ Pagination على البيانات
    let allVacations = employeeEntry.data;
    if (year) {
      allVacations = allVacations.filter(v => v.startDate.startsWith(year));
    }

    if (year && month) {
      const formattedMonth = month.padStart(2, '0');
      const selectedDate = new Date(`${year}-${formattedMonth}-01`);

      allVacations = allVacations.filter(v => {
        const vacationStart = new Date(v.startDate);
        return vacationStart >= selectedDate;
      });
    } else if (year) {
      allVacations = allVacations.filter(v => v.startDate.startsWith(year));
    }

    allVacations.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());


    // Pagination Logic
    const startIndex = (page - 1) * limit;
    const paginatedData = allVacations.slice(startIndex, startIndex + limit);


    return HttpResponse.json({
      data: paginatedData,
      stats: employeeEntry.stats,
      total: allVacations.length,
      page,
      limit: limit
    });
  })
];
