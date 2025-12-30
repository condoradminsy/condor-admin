import { request } from '../request';

/** get user routes */
export function fetchGetUserRoutes() {
  return request<Api.Route.UserRoute>({ url: '/core/common/getRoutes' });
}

/**
 * whether the route is exist
 *
 * @param routeName route name
 */
export function fetchIsRouteExist(routeName: string) {
  return request<boolean>({ url: '/core/common/isRouteExist', params: { routeName } });
}
