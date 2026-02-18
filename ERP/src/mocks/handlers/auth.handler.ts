import { http, HttpResponse, delay } from 'msw';
import { environment } from '@env/environment.development';
import { MOCK_AUTH_DATA } from '../data/auth.data';

// In-memory state
let isUserLoggedIn = false;

export const authHandlers = [
  // simulating ABP Config fetch
  http.get(`${environment.baseUrl}/api/abp/application-configuration`, async () => {
    await delay(600);
    const data = isUserLoggedIn ? MOCK_AUTH_DATA.adminConfig() : MOCK_AUTH_DATA.guestConfig();
    return HttpResponse.json(data);
  }),

  // simulating login
  http.post(`${environment.baseUrl}/api/account/login`, async ({ request }) => {
    const body: any = await request.json();
    await delay(1200); // to see spinner

    // simulating bad password
    if (body.password === '111111') {
      return new HttpResponse(
        JSON.stringify({
          error: {
            code: 'Volo.Abp:010001',
            message: 'Invalid email or password.', // Friendly error
            details: 'The username or password provided is incorrect.'
          }
        }),
        { status: 401 }
      );
    }

    isUserLoggedIn = true;
    return HttpResponse.json(MOCK_AUTH_DATA.loginSuccess);
  }),

  // simulating logout
  http.get(`${environment.baseUrl}/api/account/logout`, async () => {
    isUserLoggedIn = false;
    await delay(300);
    return new HttpResponse(null, { status: 204 });
  })
];
