import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslationService } from '@core/services/translation-service';
import { environment } from '@env/environment.development';
import { IDepartment } from '../models/idepartment';
import { TranslocoService } from '@jsverse/transloco';

interface IDepartmentView extends IDepartment {
  displayName: string;
}

@Injectable({
  providedIn: 'root',
})
export class DepartmentsService {
  private http = inject(HttpClient);
  private transloco = inject(TranslocoService);
  private translationService = inject(TranslationService);

  departmentsResource = rxResource({
    stream: () => this.http.get<IDepartment[]>(`${environment.baseUrl}/api/departments`)
  });

  localizedDepartments = computed(() => {
    const data = this.departmentsResource.value() ?? [];
    const lang = this.translationService.lang();

    return data.map(dept => ({
      ...dept,
      displayName: lang === 'ar' ? dept.nameAr : dept.nameEn
    })) as IDepartmentView[];
  });
}
