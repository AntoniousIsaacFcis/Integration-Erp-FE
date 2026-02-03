import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IBreadrump } from '@core/models/ibreadrump';
import { filter, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly items = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.#recursiveBuild(this.route.root))
    ),
    { initialValue: [] as IBreadrump[] }
  );

  #recursiveBuild(route: ActivatedRoute, url: string = '', breadcrumbs: IBreadrump[] = []): IBreadrump[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');

      let fullUrl = url;
      if (routeURL !== '') {
        fullUrl += `/${routeURL}`;
      }

      const label = child.snapshot.data['breadcrumb'];

      if (label && (!breadcrumbs.length || breadcrumbs[breadcrumbs.length - 1].label !== label)) {
        breadcrumbs.push({
          label: label,
          url: fullUrl || '/'
        });
      }

      return this.#recursiveBuild(child, fullUrl, breadcrumbs);
    }

    return breadcrumbs;
  }
}
