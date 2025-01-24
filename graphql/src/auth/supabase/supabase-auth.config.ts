import { AuthStrategy, AuthStrategyType } from '../auth.config';

export class SupabaseAuthConfig {
  public type: AuthStrategyType.Supabase;
  public supabaseUrl;
  public supabaseAnonKey;
  public enableRestAPI?: boolean;
}

export function createSupabaseAuthStrategy(
  config: Omit<SupabaseAuthConfig, 'type'>,
): AuthStrategy {
  return {
    type: AuthStrategyType.Supabase,
    ...config,
  };
}
