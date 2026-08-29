import { mockDataSource } from './sources/mock';
import { supabaseDataSource } from './sources/supabase';
import type { DataSource } from './contracts';

export function isApiConfigured(): boolean {
  const useApi = import.meta.env.VITE_USE_API === 'true';
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
  return Boolean(useApi && supabaseUrl && supabaseAnonKey);
}

let _dataSource: DataSource | null = null;

export function getDataSource(): DataSource {
  if (!_dataSource) {
    _dataSource = isApiConfigured() ? supabaseDataSource : mockDataSource;
  }
  return _dataSource;
}
