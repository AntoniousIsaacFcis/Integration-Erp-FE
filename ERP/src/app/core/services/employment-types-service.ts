import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { TranslationService } from './translation-service';
import { rxResource } from '@angular/core/rxjs-interop';
import { environment } from '@env/environment.development';
import { catchError, of } from 'rxjs';

export interface IEmploymentType {
  id: string;
  nameAr: string;
  nameEn: string;
}

@Injectable({
  providedIn: 'root',
})
export class EmploymentTypesService {
  private http = inject(HttpClient);
  private translationService = inject(TranslationService);

  resource = rxResource({
    stream: () => this.http.get<IEmploymentType[]>(`${environment.baseUrl}/api/employment-types`).pipe(
          catchError(err => {
            console.error('Failed to load nationalities', err);
            return of([]); 
          })
        )
  });

  //live translation according lang
  list = computed(() => {
    const data = this.resource.value() ?? [];
    const lang = this.translationService.lang();

    return data.map(type => ({
      ...type,
      displayName: lang === 'ar' ? type.nameAr : type.nameEn
    }));
  });
}

