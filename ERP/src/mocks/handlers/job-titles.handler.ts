import { environment } from "@env/environment.development";
import { JOB_TITLES_DATA } from "@mocks/data/job-titles.data";
import { delay, http, HttpResponse } from "msw";

export const jobTitlesHandlers = [
  http.get(`${environment.baseUrl}/api/job-titles`, async () => {
    await delay(500); 
    return HttpResponse.json(JOB_TITLES_DATA);
  })
];
