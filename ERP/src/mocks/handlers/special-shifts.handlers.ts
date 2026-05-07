import { SPECIAL_SHIFTS_MOCK } from '@mocks/data/special-shifts.mock';
import { http, HttpResponse, delay } from 'msw';
import { environment } from '@env/environment.development';

let localSpecialShifts = [...SPECIAL_SHIFTS_MOCK];

export const specialShiftHandlers = [
  http.get(`${environment.baseUrl}/api/special-shifts`, async ({ request }) => {
    const url = new URL(request.url);

    // Extract pagination params
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 10);
    const search = url.searchParams.get('search')?.toLowerCase() || '';

    // Filter logic
    let filtered = localSpecialShifts.filter(shift => {
      const matchesSearch = !search ||
        shift.nameAr.toLowerCase().includes(search) ||
        shift.nameEn.toLowerCase().includes(search);

      return matchesSearch;
    });

    // Pagination
    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    await delay(600);

    return HttpResponse.json({
      data: paginatedData,
      total: total,
      page: page,
      limit: limit
    });
  }),
];
