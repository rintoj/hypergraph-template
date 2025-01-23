import { Injectable } from '@nestjs/common';
import { LocalAuthConfig } from './local';

export enum AuthStrategyType {
  Local = 'local',
}

export type AuthStrategies = LocalAuthConfig;

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
