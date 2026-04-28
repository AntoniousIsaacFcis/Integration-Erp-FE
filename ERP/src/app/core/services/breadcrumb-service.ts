import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { IBreadrump } from '@core/models/ibreadrump';
import { BehaviorSubject, combineLatest, filter, map, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BreadcrumbService {
  private readonly router = inject(Router);

  private readonly dynamicLabelsSubject = new BehaviorSubject<Record<string, string>>({});
  private readonly refreshSubject = new BehaviorSubject<void>(undefined);

  readonly items = toSignal(
    combineLatest([
      this.router.events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        startWith(null),
      ),
      this.dynamicLabelsSubject,
      this.refreshSubject,
    ]).pipe(
      map(([, dynamicLabels]) => this.#recursiveBuild(this.router.routerState.root, '', [], dynamicLabels))
    ),
    { initialValue: this.#recursiveBuild(this.router.routerState.root) }
  );

  setCurrentBreadcrumbLabel(label: string, route?: ActivatedRoute) {
    const normalizedLabel = label.trim();

    if (!normalizedLabel) {
      return;
    }

    if (route) {
      route.snapshot.data['breadcrumb'] = normalizedLabel;
      route.snapshot.data['breadcrumbTranslate'] = false;
    }

    const url = route ? this.#buildUrlFromRoute(route) : this.router.url.split('?')[0].split('#')[0] || '/';
    this.dynamicLabelsSubject.next({
      ...this.dynamicLabelsSubject.value,
      [url]: normalizedLabel,
    });
    this.refreshSubject.next();
  }

  #buildUrlFromRoute(route: ActivatedRoute): string {
    const segments: string[] = [];
    let currentRoute: ActivatedRoute | null = route;

    while (currentRoute) {
      const routeUrl = currentRoute.snapshot.url.map(segment => segment.path).join('/');

      if (routeUrl) {
        segments.unshift(routeUrl);
      }

      currentRoute = currentRoute.parent;
    }

    return `/${segments.join('/')}` || '/';
  }

  #recursiveBuild(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: IBreadrump[] = [],
    dynamicLabels: Record<string, string> = {},
  ): IBreadrump[] {
    const routeURL: string = route.snapshot.url.map(segment => segment.path).join('/');

    const fullUrl = routeURL ? `${url}/${routeURL}` : url;

    const dynamicLabel = dynamicLabels[fullUrl || '/'];
    const label = dynamicLabel || route.snapshot.data['breadcrumb'];
    const translate = dynamicLabel
      ? false
      : route.snapshot.data['breadcrumbTranslate'] !== false;

    if (label && (!breadcrumbs.length || breadcrumbs[breadcrumbs.length - 1].label !== label)) {
        breadcrumbs.push({
            label: label,
            translate,
            url: fullUrl || '/'
        });
    }

    if (route.firstChild) {
        return this.#recursiveBuild(route.firstChild, fullUrl, breadcrumbs, dynamicLabels);
    }

    return breadcrumbs;
}
}
