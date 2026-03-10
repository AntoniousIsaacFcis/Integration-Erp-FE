// features/employment-types/mocks/employment-types.handlers.ts
import { delay, http, HttpResponse } from 'msw';
import { environment } from '@env/environment.development';
import { EMPLOYMENT_TYPES_DATA } from '@mocks/data/employment-types.data';

let db = [...EMPLOYMENT_TYPES_DATA];

export const employmentTypesHandlers = [
  // Matching: GET /api/employment-types/lookup
  http.get(`${environment.baseUrl}/api/employment-types/lookup`, () => {
    return HttpResponse.json(db);
  }),

  // Matching: GET /api/employment-types
  http.get(`${environment.baseUrl}/api/employment-types`, async ({ request }) => {
    const url = new URL(request.url);
    const searchTerm = url.searchParams.get('q') || '';
    const statusFilter = url.searchParams.get('status');

    // 1. Get pagination parameters from URL
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '10');

    let filtered = db.filter(item => {

      const matchesSearch = item.employmentTypeAr.includes(searchTerm) ||
        item.employmentTypeEn.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !statusFilter || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    await delay(600);
    return HttpResponse.json({
      data: paginatedData,
      total: total,
      page: 1,
      limit: 10
    });
  }),

  http.post(`${environment.baseUrl}/api/employment-types`, async ({ request }) => {
    const payload = await request.json() as any;
    const newEntry = { ...payload, id: Math.random().toString(), employeeCount: 0 };
    db = [newEntry, ...db];
    return HttpResponse.json(newEntry, { status: 201 });
  })
];
