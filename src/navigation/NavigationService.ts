import { createNavigationContainerRef, StackActions, CommonActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

let pending: { name: string; params?: any } | null = null;

function allRouteNames(state: any): string[] {
  if (!state?.routes) return [];
  return state.routes.flatMap((r: any) => [r.name, ...allRouteNames(r.state)]);
}

export function navigate(name: string, params?: any) {
  if (!navigationRef.isReady()) {
    console.log('🧭 QUEUED (not ready):', name);
    pending = { name, params };
    return;
  }

  const mounted = allRouteNames(navigationRef.getRootState());
  if (!mounted.includes(name)) {
    console.log('🧭 QUEUED (not mounted):', name, mounted);
    pending = { name, params };
    return;
  }

  console.log('🧭 NAVIGATING →', name, params);
  navigationRef.dispatch(
    CommonActions.navigate({ name, params, merge: false }),
  );
  pending = null;
}

export function flushPendingNavigation() {
  console.log('🧭 flush called, pending:', pending?.name ?? 'none');
  if (!pending) return;
  const { name, params } = pending;
  pending = null;
  setTimeout(() => navigate(name, params), 300);
}

export function getCurrentRouteName(): string | null {
  if (!navigationRef.isReady()) return null;
  return navigationRef.getCurrentRoute()?.name ?? null;
}

export function getCurrentRouteParams(): any {
  if (!navigationRef.isReady()) return null;
  return navigationRef.getCurrentRoute()?.params ?? null;
}

export function replace(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.replace(name, params));
  }
}

export function reset(routes: any[]) {
  if (navigationRef.isReady()) navigationRef.reset({ index: 0, routes });
}