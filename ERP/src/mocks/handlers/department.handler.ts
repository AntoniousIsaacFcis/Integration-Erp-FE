import { environment } from "@env/environment.development";
import { MOCK_DEPARTMENTS } from "@mocks/data/department.data";
import { http, HttpResponse } from "msw";

export const departmentHandlers = [
  // استخدام الرابط الكامل من الـ environment
  http.get(`${environment.baseUrl}/api/departments`, () => {
    return HttpResponse.json(MOCK_DEPARTMENTS);
  }),
];
