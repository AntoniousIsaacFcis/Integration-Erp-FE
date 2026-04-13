import { environment } from "@env/environment.development";
import { JOB_TITLES_DATA } from "@mocks/data/job-titles.data";
import { CreateDesignationDTO, IDesignation } from "@features/organization/models/idesignation";
import { delay, http, HttpResponse } from "msw";

const API_URL = `${environment.baseUrl}/api/organization/designation`;

let currentDesignations = [...JOB_TITLES_DATA];

function buildDesignationId(name: string) {
  const baseId = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'designation';

  let nextId = baseId;
  let duplicateIndex = 1;

  while (currentDesignations.some((designation) => designation.id === nextId)) {
    duplicateIndex += 1;
    nextId = `${baseId}-${duplicateIndex}`;
  }

  return nextId;
}

function toApiItem(designation: IDesignation) {
  return {
    name: designation.name,
    departmentId: designation.departmentId,
    description: designation.description ?? '',
    isActive: designation.status === 'active',
    isDeleted: false,
    deleterId: null,
    deletionTime: null,
    lastModificationTime: null,
    lastModifierId: null,
    creationTime: new Date().toISOString(),
    creatorId: null,
    id: designation.id,
  };
}

export const jobTitlesHandlers = [
  http.get(API_URL, async ({ request }) => {
    const url = new URL(request.url);
    const skipCount = Number(url.searchParams.get('skipCount') || 0);
    const maxResultCount = Number(url.searchParams.get('maxResultCount') || 10);
    const search =
      url.searchParams.get('filter')?.toLowerCase().trim() ||
      url.searchParams.get('search')?.toLowerCase().trim() ||
      url.searchParams.get('searchTerm')?.toLowerCase().trim() ||
      url.searchParams.get('q')?.toLowerCase().trim() ||
      '';
    const status = url.searchParams.get('status') || '';
    const isActive = url.searchParams.get('isActive');

    let filtered = [...currentDesignations];

    if (search) {
      filtered = filtered.filter((designation) =>
        designation.name.toLowerCase().includes(search) ||
        designation.description?.toLowerCase().includes(search),
      );
    }

    if (status) {
      filtered = filtered.filter((designation) => designation.status === status);
    } else if (isActive !== null) {
      filtered = filtered.filter(
        (designation) => String(designation.status === 'active') === isActive,
      );
    }

    await delay(500);

    return HttpResponse.json({
      totalCount: filtered.length,
      items: filtered.slice(skipCount, skipCount + maxResultCount).map((designation) => toApiItem(designation)),
    });
  }),

  http.get(`${API_URL}/lookup`, async () => {
    await delay(300);
    return HttpResponse.json(currentDesignations);
  }),

  http.get(`${API_URL}/:id`, async ({ params }) => {
    const designation = currentDesignations.find((item) => item.id === params['id']);

    await delay(300);

    if (!designation) {
      return HttpResponse.json({ message: 'Designation not found' }, { status: 404 });
    }

    return HttpResponse.json(toApiItem(designation));
  }),

  http.post(API_URL, async ({ request }) => {
    const payload = await request.json() as Partial<CreateDesignationDTO> & { isActive?: boolean };

    const newDesignation: IDesignation = {
      id: buildDesignationId(payload.name ?? ''),
      name: payload.name?.trim() || '',
      departmentId: payload.departmentId ?? null,
      description: payload.description?.trim() || '',
      status:
        typeof payload.isActive === 'boolean'
          ? payload.isActive ? 'active' : 'inactive'
          : payload.status ?? 'active',
    };

    currentDesignations = [newDesignation, ...currentDesignations];

    await delay(400);

    return HttpResponse.json(toApiItem(newDesignation), { status: 201 });
  }),

  http.put(`${API_URL}/:id`, async ({ request, params }) => {
    const payload = await request.json() as Partial<CreateDesignationDTO> & { isActive?: boolean };
    const designationId = params['id'] as string;
    const designationIndex = currentDesignations.findIndex((item) => item.id === designationId);

    if (designationIndex === -1) {
      return HttpResponse.json({ message: 'Designation not found' }, { status: 404 });
    }

    const currentDesignation = currentDesignations[designationIndex];
    const updatedDesignation: IDesignation = {
      ...currentDesignation,
      name: payload.name?.trim() || currentDesignation.name,
      departmentId: payload.departmentId ?? null,
      description: payload.description?.trim() ?? currentDesignation.description ?? '',
      status:
        typeof payload.isActive === 'boolean'
          ? payload.isActive ? 'active' : 'inactive'
          : currentDesignation.status,
    };

    currentDesignations = currentDesignations.map((item, index) =>
      index === designationIndex ? updatedDesignation : item,
    );

    await delay(400);

    return HttpResponse.json(toApiItem(updatedDesignation));
  }),

  http.delete(`${API_URL}/:id`, async ({ params }) => {
    const designationId = params['id'] as string;
    currentDesignations = currentDesignations.filter((designation) => designation.id !== designationId);

    await delay(300);

    return HttpResponse.json({ success: true });
  }),
];
