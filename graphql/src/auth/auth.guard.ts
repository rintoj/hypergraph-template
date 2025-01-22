import {
  BadRequestException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginWithUsernameInput } from './auth.input';
import { AuthService } from './auth.service';
import {
  getContextFromExecutionCtx,
  getInputFromContext,
  getResponseFromContext,
} from './util/guard.util';

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
export class AuthSignInGuard extends AuthGuard('basic-auth') {
  constructor(private readonly basicAuthService: AuthService) {
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
    const { accessToken, refreshToken } = this.basicAuthService.generateTokens({
      userId: user.id,
    });
    const response = getResponseFromContext(context);
    this.basicAuthService.attachTokensToResponse(
      response,
      accessToken,
      refreshToken,
    );
    const metadata = await this.basicAuthService.saveSigninData(
      input.username,
      refreshToken,
    );
    const request = getContextFromExecutionCtx(context);
    request.user = {
      id: metadata.id,
      username: metadata.username,
      providerType: metadata.providerType,
    };
    return metadata;
  }
}

@Injectable()
export class AuthSignUpGuard extends AuthGuard('basic-auth') {
  constructor(private readonly basicAuthService: AuthService) {
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
    const request = getContextFromExecutionCtx(context);
    request.user = {
      id: metadata.id,
      username: metadata.username,
      providerType: metadata.providerType,
    };
    return true;
  }
}
