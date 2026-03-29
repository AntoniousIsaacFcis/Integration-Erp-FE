import { environment } from "@env/environment.development";
import { NATIONALITIES_DATA } from "@mocks/data/nationalities.data";
import { delay, http, HttpResponse } from "msw";

export const nationalityHandlers = [
  http.get(`${environment.baseUrl}/api/nationalities`, async () => {
    // محاكاة تأخير بسيط لاختبار الـ Skeleton Loader أو الـ Spinner
    await delay(400);
    return HttpResponse.json(NATIONALITIES_DATA);
  })
];
