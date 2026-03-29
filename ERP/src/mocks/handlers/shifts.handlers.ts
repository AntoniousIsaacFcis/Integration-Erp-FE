import { http, HttpResponse, delay } from 'msw';
import { environment } from '@env/environment.development';
import { SHIFTS_MOCK_DATA } from '@mocks/data/shifts.data';

// Keep local reference for session persistence
let localShifts = [...SHIFTS_MOCK_DATA];

export const shiftsHandlers = [
  // GET: Fetch shifts with pagination and search
  http.get(`${environment.baseUrl}/api/shifts`, async ({ request }) => {
    const url = new URL(request.url);

    // Extract query parameters
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 10);
    const search = url.searchParams.get('search')?.toLowerCase().trim() || '';
    const status = url.searchParams.get('status') || '';
    const createdAtFilter = url.searchParams.get('createdAt') || '';

    // Filter logic
    let filtered = localShifts.filter(shift => {
      const matchesSearch = !search ||
        shift.nameAr.includes(search) ||
        shift.nameEn.toLowerCase().includes(search) ||
        shift.type.toLowerCase().includes(search);

      const matchesStatus = !status || shift.status === status;

      // Add date filter logic - AFTER the selected date (not equal)
      let matchesDate = true;
      if (createdAtFilter) {
        const filterDate = new Date(createdAtFilter);
        const shiftDate = new Date(shift.createdAt);
        // Greater than (>) means AFTER the selected date
        matchesDate = shiftDate > filterDate;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });

    // Sort by createdAt ascending (from earliest to latest)
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateA - dateB; // Ascending order
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

  // GET: Fetch single shift by ID
  http.get(`${environment.baseUrl}/api/shifts/:id`, async ({ params }) => {
    const { id } = params;
    const shift = localShifts.find(s => s.id === id);

    await delay(400);
    if (!shift) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(shift);
  }),

  // POST: Create new shift
  http.post(`${environment.baseUrl}/api/shifts`, async ({ request }) => {
    const newData = await request.json() as any;

    const newShift = {
      ...newData,
      id: `SHIFT-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
      createdAt: new Date()
    };

    localShifts = [newShift, ...localShifts];

    console.log('MSW: Shift created:', newShift);

    await delay(1000);

    return HttpResponse.json({
      success: true,
      data: newShift,
      message: 'Shift created successfully'
    }, { status: 201 });
  }),

  // PUT: Update shift
  http.put(`${environment.baseUrl}/api/shifts/:id`, async ({ params, request }) => {
    const { id } = params;
    const updates = await request.json() as any;

    const shiftIndex = localShifts.findIndex(s => s.id === id);
    if (shiftIndex === -1) return new HttpResponse(null, { status: 404 });

    localShifts[shiftIndex] = { ...localShifts[shiftIndex], ...updates };

    console.log('MSW: Shift updated:', localShifts[shiftIndex]);

    await delay(1000);

    return HttpResponse.json({
      success: true,
      data: localShifts[shiftIndex],
      message: 'Shift updated successfully'
    });
  }),

  // DELETE: Delete shift
  http.delete(`${environment.baseUrl}/api/shifts/:id`, async ({ params }) => {
    const { id } = params;

    const shiftIndex = localShifts.findIndex(s => s.id === id);
    if (shiftIndex === -1) return new HttpResponse(null, { status: 404 });

    const deletedShift = localShifts.splice(shiftIndex, 1)[0];

    console.log('MSW: Shift deleted:', deletedShift);

    await delay(800);

    return HttpResponse.json({
      success: true,
      message: 'Shift deleted successfully'
    });
  })
];
