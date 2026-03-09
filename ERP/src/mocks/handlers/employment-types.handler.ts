// features/employment-types/mocks/employment-types.handlers.ts
import { http, HttpResponse } from 'msw';
import { environment } from '@env/environment.development';
import { EMPLOYMENT_TYPES_DATA } from '@mocks/data/employment-types.data';

let db = [...EMPLOYMENT_TYPES_DATA];

export const employmentTypesHandlers = [
  
  // Matching: GET /api/employment-types
  http.get(`${environment.baseUrl}/api/employment-types`, ({ request }) => {
    const url = new URL(request.url);
    const searchTerm = url.searchParams.get('q') || '';

    let filtered = db.filter(item =>
      item.employmentTypeAr.includes(searchTerm) || item.employmentTypeEn.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return HttpResponse.json({
      data: filtered,
      total: filtered.length,
      page: 1,
      limit: 10
    });
  }),

  // Matching: GET /api/employment-types/lookup
  http.get(`${environment.baseUrl}/api/employment-types/lookup`, () => {
    return HttpResponse.json(db);
  }),

  http.post(`${environment.baseUrl}/api/employment-types`, async ({ request }) => {
    const payload = await request.json() as any;
    const newEntry = { ...payload, id: Math.random().toString(), employeeCount: 0 };
    db = [newEntry, ...db];
    return HttpResponse.json(newEntry, { status: 201 });
  })
];
