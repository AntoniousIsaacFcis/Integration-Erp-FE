import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { TranslationService } from './translation-service';
import { rxResource } from '@angular/core/rxjs-interop';
import { environment } from '@env/environment.development';
import { INationality } from '@core/models/inationality';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NationalitiesService {
  private http = inject(HttpClient);
  private translationService = inject(TranslationService);

  nationalitiesResource = rxResource({
    stream: () => this.http.get<INationality[]>(`${environment.baseUrl}/api/nationalities`).pipe(
      catchError(err => {
        console.error('Failed to load nationalities', err);
        return of([]);
      })
    )
  });

  localizedNationalities = computed(() => { //instant translation for fetched data
    const data = this.nationalitiesResource.value() ?? [];
    const lang = this.translationService.lang(); // Signal يراقب تغيير اللغة

    return data.map(nat => ({
      ...nat,
      displayName: lang === 'ar' ? nat.nameAr : nat.nameEn
    }));
  });
}
