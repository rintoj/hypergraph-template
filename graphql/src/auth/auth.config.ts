import { Injectable } from '@nestjs/common';
import { ClassType } from 'tsds-tools';
import { AuthInfo, AuthInfoWithWithCredentials } from './auth.model';

export enum AuthStrategyType {
  Local = 'local',
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

export interface LocalAuthStrategyConfig {
  type: AuthStrategyType.Local;
  userService: ClassType<LocalStrategyService>;
  usernameField?: string;
  passwordField?: string;
  enableRestAPI?: boolean;
  enableGraphQLAPI?: boolean;
}

export function createLocalStrategy(
  config: Omit<LocalAuthStrategyConfig, 'type'>,
): LocalAuthStrategyConfig {
  return {
    type: AuthStrategyType.Local,
    ...config,
  };
}

export type AuthStrategies = LocalAuthStrategyConfig;

export interface AuthJwtConfig {
  secret: string;
  expiry: string;
  refreshSecret: string;
  refreshExpiry: string;
}

@Injectable()
export class AuthConfig {
  strategies: AuthStrategies[];
  jwtConfig: AuthJwtConfig;
}
