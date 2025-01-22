import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserService } from '../user/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  async logIn(context: any) {
    console.log('LocalStrategy.login:', context);
  }

  async validate(username: string, password: string): Promise<any> {
    console.log('LocalStrategy.validate:', username, password);
    return null;
  }
}

@Injectable()
export class LocalGuard extends AuthGuard('local') {
  constructor(
    private readonly reflector: Reflector,
    private readonly userService: UserService,
  ) {
    super();
  }

  async logIn(context: any) {
    console.log('LocalGuard.login:', context);
  }

  async canActivate(context: ExecutionContext): Promise<any> {
    const { input } = context.getArgByIndex(1) ?? {};
    console.log('LocalGuard.canActivate:', input);
    const user = await this.userService.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException(
        `A user with this email (${input.email}) does not exist`,
      );
    }
    // const authUser = await verifyFirestoreUserWithEmail(
    //   input.email,
    //   input.password,
    // );
    // if (!authUser || authUser.error) {
    //   throw new Error('Invalid email or password');
    // }
    // console.log({ authUser });
    // if (isPublicEndpoint(this.reflector, context)) {
    //   return true;
    // }
    return true;
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    console.log('LocalGuard.handleRequest:', user, info);
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
