import { ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../user/user.model';

export const ROLES_KEY = 'roles';
export const Authorized = (...roles: UserRole[]) =>
  SetMetadata(ROLES_KEY, roles);

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export function isPublicEndpoint(
  reflector: Reflector,
  context: ExecutionContext,
) {
  return !!reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);
}

// @Injectable()
// export class JwtAuthGuard extends AuthGuard('jwt') {
//   constructor(private reflector: Reflector) {
//     super();
//   }

//   getRequest(context: ExecutionContext) {
//     const ctx = GqlExecutionContext.create(context);
//     return ctx.getContext().req;
//   }

//   async logIn(context: any) {
//     console.log('JTWAuthGuard.login:', context);
//   }

//   canActivate(context: ExecutionContext) {
//     console.log('JTWAuthGuard.canActivate:', context.getArgByIndex(1));
//     const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
//       context.getHandler(),
//       context.getClass(),
//     ]);
//     if (isPublic) {
//       return true;
//     }
//     return !super.canActivate(context);
//   }

//   handleRequest(err, user, info) {
//     console.log('JTWAuthGuard.handleRequest:', user, info);
//     if (err || !user) {
//       throw err || new UnauthorizedException();
//     }
//     return user;
//   }
// }

// Protects all the end points in the application
// export const GlobalAuthGuard = { provide: APP_GUARD, useClass: JwtAuthGuard };
