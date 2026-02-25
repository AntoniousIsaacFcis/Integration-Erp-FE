
import { http, HttpResponse, delay } from 'msw';
import { environment } from '@env/environment.development';

export const AddemployeeFormHandlers = [
  http.post(`${environment.baseUrl}/api/employees`, async ({ request }) => {
    const data = await request.json();
    console.log('MSW Received Employee data:', data);

    await delay(1000); // محاكاة الشبكة

    return HttpResponse.json({
      success: true,
      id: 'EMP-2026-001',
      message: 'Employee created successfully'
    }, { status: 201 });
  })
];
