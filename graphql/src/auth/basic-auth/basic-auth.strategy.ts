import {
  BadRequestException,
  ContextType,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginWithUsernameInput } from './basic-auth.input';
import { BasicAuthService } from './basic-auth.service';

export function getInputFromContext(context: ExecutionContext) {
  const request =
    context.getType<ContextType | 'graphql'>() === 'graphql'
      ? context.getArgByIndex(1)
      : context.getArgByIndex(0)?.body;
  const validation = LoginWithUsernameInput.safeParse(request);
  if (validation.success === false) {
    throw new BadRequestException(
      'The provided input format is incorrect. Please ensure that your request includes both "username" and "password" fields.',
    );
  }
  return validation.data;
}

@Injectable()
export class BasicAuthSigninGuard extends AuthGuard('basic-auth') {
  constructor(private readonly basicAuthService: BasicAuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<any> {
    const input = getInputFromContext(context);
    console.log('BasicAuthSigninGuard.canActivate:', input);
    const user = await this.basicAuthService.findByUsername(input.username);
    if (!user) {
      throw new BadRequestException(
        'Invalid username or password. Please verify your credentials and try again.',
      );
    }
    const metadata = await this.basicAuthService.saveAuthMetadata(
      input.username,
      input.password,
    );
    console.log('BasicAuthSigninGuard.metadata', metadata);
    return metadata;
  }
}

@Injectable()
export class BasicAuthSignupGuard extends AuthGuard('basic-auth') {
  constructor(private readonly basicAuthService: BasicAuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<any> {
    const input = getInputFromContext(context);
    console.log('BasicAuthSignupGuard.canActivate:', input);
    const user = await this.basicAuthService.findByUsername(input.username);
    if (user) {
      throw new BadRequestException(
        `The username '${input.username}' is already in use. Please verify your username or choose a different one.`,
      );
    }
    const metadata = await this.basicAuthService.saveAuthMetadata(
      input.username,
      input.password,
    );
    console.log('BasicAuthSignupGuard.metadata', metadata);
    return metadata;
  }
}
