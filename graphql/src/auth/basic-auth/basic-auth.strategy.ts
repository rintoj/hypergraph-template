import {
  BadRequestException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { getInputFromContext, getRequestContext } from '../util/guard.util';
import { LoginWithUsernameInput } from './basic-auth.input';
import { BasicAuthService } from './basic-auth.service';

function getInput(context: ExecutionContext) {
  const input = getInputFromContext(context);
  const validation = LoginWithUsernameInput.safeParse(input);
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
    const input = getInput(context);
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
    const request = getRequestContext(context);
    request.user = {
      id: metadata.id,
      username: metadata.username,
      providerType: metadata.providerType,
    };
    return metadata;
  }
}

@Injectable()
export class BasicAuthSignupGuard extends AuthGuard('basic-auth') {
  constructor(private readonly basicAuthService: BasicAuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<any> {
    const input = getInput(context);
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
    const request = getRequestContext(context);
    request.user = {
      id: metadata.id,
      username: metadata.username,
      providerType: metadata.providerType,
    };
    return true;
  }
}
