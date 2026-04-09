import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslationService } from '@core/services/translation-service';
import { environment } from '@env/environment.development';
import { CreateEmploymentTypeDTO, IEmploymentType, IEmploymentTypeResponse } from '../models/iemployment-type';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EmploymentTypesService {
  private readonly http = inject(HttpClient);
  private readonly translationService = inject(TranslationService);
  private readonly API_URL = `${environment.baseUrl}/api/employment-types`;

  // 1. Resource for Management Table (Paginated/Filtered)
getManagementData(params: { page: number; limit: number; search?: string;status?: string }) {
    return this.http.get<IEmploymentTypeResponse>(this.API_URL, {
      params: {
        page: params.page,
        limit: params.limit,
        ...(params.search && { q: params.search }),
        ...(params.status && { status: params.status })
      }
    });
  }

  // 2. Resource for Lookups (Dropdowns/Lists)
  // Used when other forms need to select an Employment Type
  public readonly lookupResource = rxResource({
    stream: () => this.http.get<IEmploymentType[]>(`${this.API_URL}/lookup`).pipe(
      catchError(() => of([]))
    )
  });

  // Live translation computed list for dropdowns
  readonly lookupList = computed(() => {
    const data = this.lookupResource.value() ?? [];
    const lang = this.translationService.lang();
    return data.map(type => ({
      id: type.id,
      displayName: lang === 'ar' ? type.employmentTypeAr : type.employmentTypeEn
    }));
  });

  // 3. Actions
  create(data: CreateEmploymentTypeDTO) {
    return this.http.post<IEmploymentType>(this.API_URL, data);
  }

  delete(id: string) {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
