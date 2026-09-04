export type * from './auth';
export type * from './navigation';
export type * from './ui';
export type * from './admin/app.contract';
export type * from './admin/client.contract';
export type * from './admin/license.contract';

export interface PaginatedData<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
}