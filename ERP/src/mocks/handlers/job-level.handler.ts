// features/job-levels/mocks/job-level.handlers.ts
import { http, HttpResponse } from 'msw';
import { environment } from '@env/environment.development';
import { JOB_LEVELS_MOCK_DATA } from '@mocks/data/job-level.data';

export const jobLevelHandlers = [
  http.get(`${environment.baseUrl}/api/job-levels`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // استخدام البيانات المستوردة لعمل الـ Slice
    const paginatedData = JOB_LEVELS_MOCK_DATA.slice(startIndex, endIndex);

    return HttpResponse.json({
      data: paginatedData,
      total: JOB_LEVELS_MOCK_DATA.length,
      page,
      limit
    });
  }),
];
