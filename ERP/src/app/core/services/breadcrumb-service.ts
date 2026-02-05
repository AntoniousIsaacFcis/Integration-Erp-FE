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
    const child = route.firstChild;

    if (!child) {
      return breadcrumbs;
    }

    const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
    const fullUrl = routeURL ? `${url}/${routeURL}` : url;

    const label = child.snapshot.data['breadcrumb'];

    // فحص التكرار لضمان نظافة المسار
    if (label && (!breadcrumbs.length || breadcrumbs[breadcrumbs.length - 1].label !== label)) {
      breadcrumbs.push({
        label: label,
        url: fullUrl || '/'
      });
    }

    return this.#recursiveBuild(child, fullUrl, breadcrumbs);
  }
}
