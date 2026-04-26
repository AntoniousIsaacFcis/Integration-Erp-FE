import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "@env/environment.development";
import { Translation, TranslocoLoader } from "@jsverse/transloco";
import { catchError, forkJoin, map, of } from "rxjs";

interface AbpLocalizationResponse {
    resources?: Record<string, { texts?: Translation }>;
}

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
    private http = inject(HttpClient);

    getTranslation(lang: string) {
        return forkJoin({
            ui: this.http.get<Translation>(`/assets/i18n/${lang}.json`),
            backend: this.http
                .get<AbpLocalizationResponse>(
                    `${environment.baseUrl}/api/abp/application-localization?cultureName=${lang}`
                )
                .pipe(catchError(() => of({ resources: {} } as AbpLocalizationResponse)))
        }).pipe(
            map(({ ui, backend }) => ({
                ...ui,
                ...this.flattenBackendTexts(backend)
            }))
        );
    }

    private flattenBackendTexts(response: AbpLocalizationResponse): Translation {
        const flatTexts = Object.values(response.resources ?? {}).reduce<Translation>(
            (texts, resource) => ({
                ...texts,
                ...(resource.texts ?? {})
            }),
            {}
        );

        return Object.entries(flatTexts).reduce<Translation>((texts, [key, value]) => {
            this.setPath(texts, key, value);
            return texts;
        }, {});
    }

    private setPath(target: Translation, key: string, value: unknown) {
        const parts = key.split('.');
        let current = target as Record<string, unknown>;

        parts.slice(0, -1).forEach(part => {
            if (!current[part] || typeof current[part] !== 'object') {
                current[part] = {};
            }

            current = current[part] as Record<string, unknown>;
        });

        current[parts[parts.length - 1]] = value;
    }
}
