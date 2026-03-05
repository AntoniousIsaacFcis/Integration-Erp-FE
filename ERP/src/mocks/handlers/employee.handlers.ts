// @mocks/handlers/employee.handlers.ts
import { http, HttpResponse, delay } from 'msw';
import { environment } from '@env/environment.development';
import { EMPLOYEES_MOCK_DATA } from '@mocks/data/employees.data';

// Keep a local reference if you want to simulate adding items during the session
let localEmployees = [...EMPLOYEES_MOCK_DATA];

export const employeeHandlers = [
  // 1. GET Method: Supports Search, Status Filter, and Pagination
  http.get(`${environment.baseUrl}/api/employees`, async ({ request }) => {
    const url = new URL(request.url);

    // Extract query parameters from rxResource
    const page = Number(url.searchParams.get('page') || 1);
    const limit = Number(url.searchParams.get('limit') || 10);
    const search = url.searchParams.get('search')?.toLowerCase().trim() || '';
    const status = url.searchParams.get('status') || '';
    const joiningDateFilter = url.searchParams.get('joiningDate') || '';

    // Filter Logic
    let filtered = localEmployees.filter(emp => {
      const matchesSearch = !search ||
        emp.fullNameAr.includes(search) ||
        emp.fullNameEn.toLowerCase().includes(search) ||
        emp.email.toLowerCase().includes(search);

      const matchesStatus = !status || emp.employmentStatus === status;

      let matchesDate = true;
      if (joiningDateFilter) {
        const filterDate = new Date(joiningDateFilter);
        const employeeDate = new Date(emp.joiningDate);
        matchesDate = employeeDate >= filterDate;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });

    // Pagination Logic
    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = filtered.slice(startIndex, startIndex + limit);

    await delay(600); // Simulate network latency for rxResource loading state

    return HttpResponse.json({
      data: paginatedData,
      total: total,
      page: page,
      limit: limit
    });
  }),


  http.get(`${environment.baseUrl}/api/employees/:id`, async ({ params }) => {
    const { id } = params;
    const employee = localEmployees.find(e => e.id === id);

    await delay(400);
    if (!employee) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(employee);
  }),

  // 2. POST Method: Create Employee
  http.post(`${environment.baseUrl}/api/employees`, async ({ request }) => {
    const newData = await request.json() as any;

    // Generate a mock ID
    const newEmployee = {
      ...newData,
      id: `EMP-2026-${Math.floor(Math.random() * 1000)}`
    };

    // Optional: Add to local list to see it appear in the table after reload
    localEmployees = [newEmployee, ...localEmployees];

    console.log('MSW: Employee created and added to mock list:', newEmployee);

    await delay(1000);

    return HttpResponse.json({
      success: true,
      data: newEmployee,
      message: 'Employee created successfully'
    }, { status: 201 });
  })
];
