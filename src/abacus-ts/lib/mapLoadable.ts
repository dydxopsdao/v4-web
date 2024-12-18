import { Loadable } from './loadable';

export function mapLoadableData<T, R>(load: Loadable<T>, map: (obj: T) => R): Loadable<R> {
  return {
    ...load,
    data: load.data != null ? map(load.data) : undefined,
  } as Loadable<R>;
}

export function mergeLoadableData<T, R>(
  one: Loadable<T>,
  two: Loadable<R>
): Loadable<[T | undefined, R | undefined]> {
  const priority = ['pending', 'error', 'success', 'idle'] as const;
  return {
    status: priority[Math.min(priority.indexOf(one.status), priority.indexOf(two.status))]!,
    error: (one as any).error ?? (two as any).error ?? undefined,
    data: [one.data, two.data],
  } as any;
}

// converts idle to pending and if a status has valid data is counts as success
export function mergeLoadableStatus(
  ...status: Array<Loadable<any>>
): Exclude<Loadable<any>['status'], 'idle'> {
  if (status.some((s) => s.status === 'error' && s.data == null)) {
    return 'error';
  }
  if (status.some((s) => s.status === 'idle')) {
    return 'pending';
  }
  if (status.some((s) => s.status === 'pending' && s.data == null)) {
    return 'pending';
  }
  return 'success';
}