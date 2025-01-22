import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { UserRole } from '../user/user.enum';
import { RequestContext } from '../context';

export const ROLES_KEY = 'roles';
export const Authorized = (...roles: UserRole[]) =>
  SetMetadata(ROLES_KEY, roles);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(executionContext: ExecutionContext): boolean {
    const roles = this.reflector.get<UserRole[]>(
      ROLES_KEY,
      executionContext.getHandler(),
    );
    if (!roles) return true;
    const context: RequestContext = executionContext.getArgByIndex(2);
    if (!context.accountId || !context.roles) {
      return false;
    }
    if (!roles.length) return context.roles.includes(UserRole.User);
    return roles.some((role) => context.roles.includes(role));
  }
}

export const AuthGuardProvider = { provide: APP_GUARD, useClass: AuthGuard };
