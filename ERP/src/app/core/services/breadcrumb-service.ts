import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IBreadrump } from '@core/models/ibreadrump';
import { BehaviorSubject, filter, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private readonly router = inject(Router);

  private readonly breadcrumbsSubject = new BehaviorSubject<IBreadrump[]>(//for intial value immedatly when run
    this.#recursiveBuild(this.router.routerState.root)
  );

  readonly items = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.#recursiveBuild(this.router.routerState.root))
    ),
    { initialValue: this.#recursiveBuild(this.router.routerState.root) }
  );

  #recursiveBuild(route: ActivatedRoute, url: string = '', breadcrumbs: IBreadrump[] = []): IBreadrump[] {
    const routeURL: string = route.snapshot.url.map(segment => segment.path).join('/');

    const fullUrl = routeURL ? `${url}/${routeURL}` : url;

    const label = route.snapshot.data['breadcrumb'];

    if (label && (!breadcrumbs.length || breadcrumbs[breadcrumbs.length - 1].label !== label)) {
        breadcrumbs.push({
            label: label,
            url: fullUrl || '/'
        });
    }

    if (route.firstChild) {
        return this.#recursiveBuild(route.firstChild, fullUrl, breadcrumbs);
    }

    return breadcrumbs;
}
}
