// features/job-levels/mocks/job-level.handlers.ts
import { http, HttpResponse } from 'msw';
import { environment } from '@env/environment.development';
import { JOB_LEVELS_MOCK_DATA } from '@mocks/data/job-level.data';
import { IJobLevel } from '@features/job-level/models/ijob-level';

let currentDb = [...JOB_LEVELS_MOCK_DATA];

export const jobLevelHandlers = [
  http.get(`${environment.baseUrl}/api/job-levels`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // استخدام البيانات المستوردة لعمل الـ Slice
    const paginatedData = currentDb.slice(startIndex, endIndex);

    return HttpResponse.json({
      data: paginatedData,
      total: currentDb.length,
      page,
      limit
    });
  }),

  http.post(`${environment.baseUrl}/api/job-levels`, async ({ request }) => {
    const payload = (await request.json()) as IJobLevel;

    //simulation adding to server
    const newJobLevel: IJobLevel = {
      ...payload,
      id: (currentDb.length + 1).toString(),
      employeeCount: 1, // default job level
      createdAt: new Date().toISOString()
    };
    currentDb = [newJobLevel, ...currentDb];//to make the added dispalyed in first
    console.log('✅ MSW: Job Level Created Successfully', newJobLevel);
    return HttpResponse.json(newJobLevel, { status: 201 });
  }),
];
