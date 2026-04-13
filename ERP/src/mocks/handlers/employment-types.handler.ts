import { environment } from '@env/environment.development';
import { CreateEmploymentTypeDTO, IEmploymentType } from '@features/organization/models/iemployment-type';
import { EMPLOYMENT_TYPES_DATA } from '@mocks/data/employment-types.data';
import { delay, http, HttpResponse } from 'msw';

let currentEmploymentTypes = [...EMPLOYMENT_TYPES_DATA];

function buildEmploymentTypeId(name: string) {
  const baseId = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'employment-type';

  let nextId = baseId;
  let duplicateIndex = 1;

  while (currentEmploymentTypes.some(type => type.id === nextId)) {
    duplicateIndex += 1;
    nextId = `${baseId}-${duplicateIndex}`;
  }

  return nextId;
}

export const employmentTypesHandlers = [
  http.get(`${environment.baseUrl}/api/employment-types`, async ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 10);
    const search = url.searchParams.get('q')?.toLowerCase().trim() || '';
    const status = url.searchParams.get('status') || '';

    let filtered = [...currentEmploymentTypes];

    if (search) {
      filtered = filtered.filter(type =>
        type.name.toLowerCase().includes(search) ||
        type.description?.toLowerCase().includes(search)
      );
    }

    if (status) {
      filtered = filtered.filter(type => type.status === status);
    }

    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    await delay(500);

    return HttpResponse.json({
      data: paginatedData,
      total: filtered.length,
      page,
      limit
    });
  }),

  http.get(`${environment.baseUrl}/api/employment-types/lookup`, async () => {
    await delay(300);
    return HttpResponse.json(currentEmploymentTypes);
  }),

  http.post(`${environment.baseUrl}/api/employment-types`, async ({ request }) => {
    const payload = await request.json() as CreateEmploymentTypeDTO;

    const newEmploymentType: IEmploymentType = {
      id: buildEmploymentTypeId(payload.name),
      name: payload.name.trim(),
      status: payload.status,
      description: payload.description?.trim() || '',
      employeeCount: 0
    };

    currentEmploymentTypes = [newEmploymentType, ...currentEmploymentTypes];

    await delay(500);

    return HttpResponse.json(newEmploymentType, { status: 201 });
  }),

  http.delete(`${environment.baseUrl}/api/employment-types/:id`, async ({ params }) => {
    const { id } = params;
    currentEmploymentTypes = currentEmploymentTypes.filter(type => type.id !== id);

    await delay(300);

    return HttpResponse.json({ success: true });
  })
];
