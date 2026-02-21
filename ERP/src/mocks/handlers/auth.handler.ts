import { http, HttpResponse, delay } from 'msw';
import { environment } from '@env/environment.development';
import { MOCK_AUTH_DATA } from '../data/auth.data';
import { HttpRequest } from '@angular/common/http';

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

    //admin creditionals (simulation to apb admin creditionals)
    const isAdmin = body.userNameOrEmailAddress === 'admin' && body.password === '1q2w3E*';

    // simulating bad password
    if (!isAdmin) {
      return new HttpResponse(
        JSON.stringify({
          error: {
            code: 'Volo.Abp:010001',
            message: 'INVALID_CREDENTIALS',
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
  }),

  // simulating signup
  http.post(`${environment.baseUrl}/api/account/register`, async ({ request }) => {
    const body: any = await request.json();
    await delay(1000);

    // مثال لمحاكاة خطأ موجود في ABP عادةً
    if (body.email === 'test@test.com') {
      return new HttpResponse(
        JSON.stringify({
          error: { message: 'This email is already registered.' }
        }),
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'User registered successfully'
    });
  }),

  //simulating reset the password
  // 1. send otp
  http.post(`${environment.baseUrl}/api/account/send-password-reset-code`, async ({ request }) => {
    const body = await request.json() as { email: string };
    const email = body.email;

    await delay(1000);
    console.log(`[MSW] OTP sent to: ${email}`);
    return HttpResponse.json({ success: true });
  }),

  // 2. token verification
  http.post(`${environment.baseUrl}/api/account/verify-password-reset-token`, async ({ request }) => {
    const body = await request.json() as { token: string };
    await delay(800);

    if (body.token === '12345') { //simulation correnct otp
      return HttpResponse.json({
        success: true,
        resetToken: 'msw-generated-secure-token-2026'
      });
    }

    return new HttpResponse(
      JSON.stringify({ error: { message: 'INVALID_OTP_CODE' } }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }),

  // 3. assign new password
  http.post(`${environment.baseUrl}/api/account/reset-password`, async ({ request }) => {
    const body = await request.json() as any;
    await delay(1000);

    if (body.newPassword === '12345') { // simulation weak password
      return new HttpResponse(
        JSON.stringify({ error: { message: 'PASSWORD_TOO_WEAK' } }),
        { status: 400 }
      );
    }

    return HttpResponse.json({ success: true });
  }),
];
