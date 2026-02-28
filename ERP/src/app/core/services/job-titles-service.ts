import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { TranslationService } from './translation-service';
import { rxResource } from '@angular/core/rxjs-interop';
import { environment } from '@env/environment.development';
import { catchError, of } from 'rxjs';

export interface IJobTitle {
  id: string;
  nameAr: string;
  nameEn: string;
}

@Injectable({
  providedIn: 'root',
})
export class JobTitlesService {
  private http = inject(HttpClient);
  private translationService = inject(TranslationService);

  resource = rxResource({ //global service so rxResource rather than observable
    stream: () => this.http.get<IJobTitle[]>(`${environment.baseUrl}/api/job-titles`).pipe(
      catchError(err => {
        console.error('Failed to load job titles', err);
        return of([]);
      })
    )
  });

  list = computed(() => {
    const lang = this.translationService.lang();
    const data = this.resource.value() ?? [];
    return data.map(job => ({
      ...job,
      displayName: lang === 'ar' ? job.nameAr : job.nameEn
    }));
  });

}
