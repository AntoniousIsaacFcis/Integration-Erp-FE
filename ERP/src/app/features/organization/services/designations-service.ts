import { computed, inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslationService } from '@core/services/translation-service';
import { environment } from '@env/environment.development';
import { IDesignation } from '../models/idesignation';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DesignationsService {
  private readonly http = inject(HttpClient);
  private readonly translationService = inject(TranslationService);

  readonly resource = rxResource({
    stream: () => this.http.get<IDesignation[]>(`${environment.baseUrl}/api/job-titles`).pipe(
      catchError((err) => {
        console.error('Failed to load designations', err);
        return of([]);
      }),
    ),
  });

  readonly list = computed(() => {
    const lang = this.translationService.lang();
    const data = this.resource.value() ?? [];

    return data.map((designation) => ({
      ...designation,
      displayName: lang === 'ar' ? designation.nameAr : designation.nameEn,
    }));
  });
}
