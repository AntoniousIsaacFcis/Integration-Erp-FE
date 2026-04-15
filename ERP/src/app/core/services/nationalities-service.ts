import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { TranslationService } from './translation-service';
import { rxResource } from '@angular/core/rxjs-interop';
import { environment } from '@env/environment.development';
import {
  INationality,
  INationalityApiItem,
  INationalityApiResponse,
} from '@core/models/inationality';
import { catchError, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NationalitiesService {
  private readonly http = inject(HttpClient);
  private readonly translationService = inject(TranslationService);
  private readonly API_URL = `${environment.baseUrl}/api/organization/nationality`;

  nationalitiesResource = rxResource({
    stream: () =>
      this.http
        .get<INationalityApiResponse>(this.API_URL, {
          params: { skipCount: 0, maxResultCount: 1000 },
        })
        .pipe(
          map((response) => response.items.map((item) => this.mapApiItem(item))),
          catchError((err) => {
            console.error('Failed to load nationalities', err);
            return of([]);
          }),
        ),
  });

  localizedNationalities = computed(() => { //instant translation for fetched data
    const data = this.nationalitiesResource.value() ?? [];
    const lang = this.translationService.lang(); // Signal يراقب تغيير اللغة

    return data
      .filter((nat) => nat.status !== 'inactive')
      .map((nat) => ({
      ...nat,
      displayName:
        lang === 'ar'
          ? nat.nameAr || nat.name || nat.nameEn || nat.code || nat.id
          : nat.nameEn || nat.name || nat.nameAr || nat.code || nat.id,
    }));
  });

  private mapApiItem(item: INationalityApiItem): INationality {
    return {
      id: item.id,
      code: item.code,
      name: item.name?.trim() || item.nameEn?.trim() || item.nameAr?.trim() || item.id,
      nameAr: item.nameAr?.trim() || item.name?.trim() || undefined,
      nameEn: item.nameEn?.trim() || item.name?.trim() || undefined,
      status:
        (typeof item.isActive === 'boolean' ? item.isActive : !item.isDeleted)
          ? 'active'
          : 'inactive',
    };
  }
}
