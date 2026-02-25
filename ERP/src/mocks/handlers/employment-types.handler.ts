import { http, HttpResponse, delay } from 'msw';
import { environment } from '@env/environment.development';
import { EMPLOYMENT_TYPES_DATA } from '../data/employment-types.data';

export const employmentTypeHandlers = [
  http.get(`${environment.baseUrl}/api/employment-types`, async () => {
    await delay(300); 
    return HttpResponse.json(EMPLOYMENT_TYPES_DATA);
  })
];
