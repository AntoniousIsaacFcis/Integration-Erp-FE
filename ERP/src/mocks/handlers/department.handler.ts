import { environment } from "@env/environment.development";
import { CreateDepartmentDTO, IDepartment } from "@features/organization/models/idepartment";
import { MOCK_DEPARTMENTS } from "@mocks/data/department.data";
import { delay, http, HttpResponse } from "msw";

const API_URL = `${environment.baseUrl}/api/organization/department`;

let currentDepartments = [...MOCK_DEPARTMENTS];

function buildDepartmentId(name: string) {
  const baseId = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'department';

  let nextId = baseId;
  let duplicateIndex = 1;

  while (currentDepartments.some((department) => department.id === nextId)) {
    duplicateIndex += 1;
    nextId = `${baseId}-${duplicateIndex}`;
  }

  return nextId;
}

function toApiItem(department: IDepartment) {
  return {
    name: department.name,
    abbreviation: department.abbreviation ?? '',
    description: department.description ?? '',
    isActive: department.status === 'active',
    managerStaffIds: department.managerStaffIds,
    employeeStaffIds: department.employeeStaffIds,
    isDeleted: false,
    deleterId: null,
    deletionTime: null,
    lastModificationTime: null,
    lastModifierId: null,
    creationTime: new Date().toISOString(),
    creatorId: null,
    id: department.id,
  };
}

export const departmentHandlers = [
  http.get(API_URL, async ({ request }) => {
    const url = new URL(request.url);
    const skipCount = Number(url.searchParams.get('skipCount') || 0);
    const maxResultCount = Number(url.searchParams.get('maxResultCount') || 10);
    const search =
      url.searchParams.get('filter') ||
      url.searchParams.get('search') ||
      url.searchParams.get('searchTerm') ||
      url.searchParams.get('q') ||
      '';
    const status = url.searchParams.get('status') || '';
    const isActive = url.searchParams.get('isActive');

    let filtered = [...currentDepartments];

    if (search) {
      const normalizedSearch = search.toLowerCase().trim();
      filtered = filtered.filter((department) =>
        department.name.toLowerCase().includes(normalizedSearch) ||
        department.abbreviation?.toLowerCase().includes(normalizedSearch) ||
        department.description?.toLowerCase().includes(normalizedSearch),
      );
    }

    if (status) {
      filtered = filtered.filter((department) => department.status === status);
    } else if (isActive !== null && isActive !== '') {
      filtered = filtered.filter((department) => String(department.status === 'active') === isActive);
    }

    await delay(400);

    return HttpResponse.json({
      totalCount: filtered.length,
      items: filtered.slice(skipCount, skipCount + maxResultCount).map(toApiItem),
    });
  }),

  http.get(`${API_URL}/lookup`, async () => {
    await delay(250);
    return HttpResponse.json(currentDepartments);
  }),

  http.get(`${API_URL}/:id`, async ({ params }) => {
    const departmentId = params['id'] as string;
    const department = currentDepartments.find((item) => item.id === departmentId);

    await delay(250);

    if (!department) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(toApiItem(department));
  }),

  http.post(API_URL, async ({ request }) => {
    const payload = await request.json() as Partial<CreateDepartmentDTO> & { isActive?: boolean };

    const newDepartment: IDepartment = {
      id: buildDepartmentId(payload.name ?? ''),
      name: payload.name?.trim() || '',
      abbreviation: payload.abbreviation?.trim() || '',
      description: payload.description?.trim() || '',
      status: payload.isActive === false ? 'inactive' : 'active',
      managerStaffIds: Array.from(new Set(payload.managerStaffIds ?? [])),
      employeeStaffIds: Array.from(new Set(payload.employeeStaffIds ?? [])),
    };

    currentDepartments = [newDepartment, ...currentDepartments];

    await delay(400);

    return HttpResponse.json(toApiItem(newDepartment), { status: 201 });
  }),

  http.put(`${API_URL}/:id`, async ({ params, request }) => {
    const payload = await request.json() as Partial<CreateDepartmentDTO> & { isActive?: boolean };
    const departmentId = params['id'] as string;
    const departmentIndex = currentDepartments.findIndex((item) => item.id === departmentId);

    if (departmentIndex === -1) {
      return new HttpResponse(null, { status: 404 });
    }

    const currentDepartment = currentDepartments[departmentIndex];
    const updatedDepartment: IDepartment = {
      ...currentDepartment,
      name: payload.name?.trim() || currentDepartment.name,
      abbreviation: payload.abbreviation?.trim() || '',
      description: payload.description?.trim() || '',
      status: payload.isActive === false ? 'inactive' : 'active',
      managerStaffIds: Array.from(new Set(payload.managerStaffIds ?? [])),
      employeeStaffIds: Array.from(new Set(payload.employeeStaffIds ?? [])),
    };

    currentDepartments = currentDepartments.map((item, index) =>
      index === departmentIndex ? updatedDepartment : item,
    );

    await delay(400);

    return HttpResponse.json(toApiItem(updatedDepartment));
  }),

  http.delete(`${API_URL}/:id`, async ({ params }) => {
    const departmentId = params['id'] as string;
    currentDepartments = currentDepartments.filter((department) => department.id !== departmentId);

    await delay(250);

    return new HttpResponse(null, { status: 204 });
  }),
];
