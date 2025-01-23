import { ClassType } from 'tsds-tools';
import { AuthStrategyType } from '../auth.config';
import { AuthInfo } from '../auth.model';

export interface AuthInfoWithWithCredentials extends AuthInfo {
  passwordHash?: string;
  refreshTokenHash?: string;
}

export interface UserCredentials {
  username: string;
  authProviderId: string;
  authProviderType: string;
  passwordHash: string;
}

export interface RefreshTokenCredentials {
  username: string;
  refreshTokenHash: string;
}

export interface LocalStrategyService {
  findByUsername(username: string): Promise<AuthInfoWithWithCredentials>;

  signInWithUsername(credentials: RefreshTokenCredentials): Promise<AuthInfo>;

  signUpWithUsername(credentials: UserCredentials): Promise<AuthInfo>;

  signOut(userId: string): Promise<any>;
}

export class LocalAuthConfig {
  type!: AuthStrategyType.Local;
  userService!: ClassType<LocalStrategyService>;
  enableRestAPI?: boolean;
  enableGraphQLAPI?: boolean;
  hashSaltRounds?: number;
}

export function createLocalStrategy(
  config: Omit<LocalAuthConfig, 'type'>,
): LocalAuthConfig {
  return {
    type: AuthStrategyType.Local,
    ...config,
  };
}
