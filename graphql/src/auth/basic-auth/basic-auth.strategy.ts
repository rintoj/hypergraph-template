import {
  BadRequestException,
  ContextType,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { LoginWithUsernameInput } from './basic-auth.input';
import { BasicAuthService } from './basic-auth.service';

@Injectable()
export class BasicAuthStrategy extends PassportStrategy(
  Strategy,
  'basic-auth',
) {
  async logIn(context: any) {
    console.log('BasicAuthStrategy.login:', context);
  }

  async validate(username: string, password: string): Promise<any> {
    console.log('BasicAuthStrategy.validate:', username, password);
    return null;
  }
}

@Injectable()
export class BasicAuthGuard extends AuthGuard('basic-auth') {
  constructor(private readonly basicAuthService: BasicAuthService) {
    super();
  }

  async logIn(context: any) {
    console.log('BasicAuthGuard.login:', context);
  }

  getInput(context: ExecutionContext) {
    console.log((context as any).type);
    const request =
      context.getType<ContextType | 'graphql'>() === 'graphql'
        ? context.getArgByIndex(1)
        : context.getArgByIndex(0)?.body;
    const validation = LoginWithUsernameInput.safeParse(request);
    if (validation.success === false) {
      throw new BadRequestException(
        'Invalid input format. Expected an object with "username" and "password" properties.',
      );
    }
    return validation.data;
  }

  async canActivate(context: ExecutionContext): Promise<any> {
    const input = this.getInput(context);
    console.log('BasicAuthGuard.canActivate:', input);
    const user = await this.basicAuthService.findByUsername(input.username);
    if (!user) {
      throw new UnauthorizedException(
        `A user with this username ('${input.username}') does not exist`,
      );
    }
    const metadata = await this.basicAuthService.saveAuthMetadata(
      input.username,
      input.password,
    );
    console.log('BasicAuthGuard.metadata', metadata);
    return metadata;
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
