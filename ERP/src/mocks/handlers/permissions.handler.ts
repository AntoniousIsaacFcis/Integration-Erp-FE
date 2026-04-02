import { http, HttpResponse, delay } from 'msw';
import { environment } from "@env/environment.development";
import { MOCK_PERMISSIONS } from '@mocks/data/permissions.data';

export const permissionsHandlers = [
  http.get(`${environment.baseUrl}/api/permissions`, async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 10);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const fromDate = url.searchParams.get('fromDate');
    const toDate = url.searchParams.get('toDate');
    const search = url.searchParams.get('search');

    let filtered = [...MOCK_PERMISSIONS];

    // Search filter (from image)
    if (search && search !== 'undefined') {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.employeeId.toLowerCase().includes(searchLower) ||
        p.reason.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (status && status !== 'undefined') {
      filtered = filtered.filter(p => p.status === status);
    }

    // Type filter
    if (type && type !== 'undefined') {
      filtered = filtered.filter(p => p.type === type);
    }

    // Date range filters
    if (fromDate && fromDate !== 'undefined') {
      filtered = filtered.filter(p => new Date(p.date) >= new Date(fromDate));
    }
    if (toDate && toDate !== 'undefined') {
      filtered = filtered.filter(p => new Date(p.date) <= new Date(toDate));
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    await delay(400);

    return HttpResponse.json({
      data: paginatedData,
      total: total
    });
  })
];
