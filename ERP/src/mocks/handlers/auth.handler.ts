import { ILoginDTO } from "@core/models/iuser";
import { environment } from "@env/environment.development";
import { MOCK_ADMIN_USER } from "@mocks/data/auth.data";
import { http, HttpResponse } from "msw";

export const authHandlers = [
  http.post(`${environment.baseUrl}/api/auth/login`, async ({ request }) => {
    const credentials = (await request.json()) as ILoginDTO;

    if (credentials.email === 'admin@erp.com') {
      return HttpResponse.json({
        token: 'fake-jwt-token',
        user: MOCK_ADMIN_USER
      });
    }

    // simulation of sever response
    return new HttpResponse(
      JSON.stringify({ message: 'Invalid credentials' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );

  })
];
