// features/job-levels/mocks/job-level.handlers.ts
import { delay, http, HttpResponse } from 'msw';
import { environment } from '@env/environment.development';
import { JOB_LEVELS_MOCK_DATA } from '@mocks/data/job-level.data';
import { IEmployeeLevelTableItem } from '@features/organization/models/iemployee-level';

let currentDb = [...JOB_LEVELS_MOCK_DATA];

export const jobLevelHandlers = [
  http.get(`${environment.baseUrl}/api/job-levels`, async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const searchTerm = url.searchParams.get('q') || '';
    const statusFilter = url.searchParams.get('status') || '';

    let filteredResults = [...currentDb];

    if (searchTerm) {
      filteredResults = currentDb.filter(item =>
        item.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item as any).nameEn?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filteredResults = filteredResults.filter(item => item.status === statusFilter);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // استخدام البيانات المستوردة لعمل الـ Slice
    const paginatedData = filteredResults.slice(startIndex, endIndex);

    await delay(600);
    return HttpResponse.json({
      data: paginatedData,
      total: filteredResults.length,
      page,
      limit
    });
  }),

  http.post(`${environment.baseUrl}/api/job-levels`, async ({ request }) => {
    const payload = (await request.json()) as IEmployeeLevelTableItem;

    //simulation adding to server
    const newJobLevel: IEmployeeLevelTableItem = {
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
