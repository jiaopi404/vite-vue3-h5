import type { RouteMeta } from 'vue-router';
export interface RouteItem {
  path: string;
  component: any;
  meta: Partial<RouteMeta>;
  name?: string;
  alias?: string | string[];
  redirect?: string;
  caseSensitive?: boolean;
  children?: RouteItem[];
  [key: string]: any;
}

/**
 * @description: Get menu return value
 */
export type getMenuListResultModel = RouteItem[];
