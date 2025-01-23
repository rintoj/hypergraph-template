import { generateIdOf } from '@hgraph/storage';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';
import { AuthService } from '../auth.service';
import { LocalStrategyService } from './local-auth.config';
import { SignInResponse, SignUpResponse } from './local-auth.response';

const saltRounds = 10;

@Injectable()
export class LocalAuthService {
  constructor(
    @Inject('LocalStrategyService')
    private readonly localStrategyService: LocalStrategyService,
    private readonly authService: AuthService,
  ) {}

  private async generateHash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  }

  private async comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
  async verifyWithUsername(username: string, password: string) {
    const user = await this.localStrategyService.findByUsername(username);
    if (!user?.passwordHash) return;
    if (!(await this.comparePassword(password, user.passwordHash))) return;
    return user;
  }

  async signInWithUsername(
    username: string,
    password: string,
    response: Response,
  ): Promise<SignInResponse> {
    const existingUser = await this.verifyWithUsername(username, password);
    if (!existingUser) {
      throw new UnauthorizedException(
        'Invalid username or password. Please verify your credentials and try again.',
      );
    }
    const { accessToken, refreshToken } = this.authService.signInWithUser(
      existingUser,
      response,
    );
    const user = await this.localStrategyService.signInWithUsername({
      username,
      refreshTokenHash: await this.generateHash(refreshToken),
    });
    return { accessToken, userId: user.userId };
  }

  async signUpWithUsername(
    username: string,
    password: string,
  ): Promise<SignUpResponse> {
    const existingUser =
      await this.localStrategyService.findByUsername(username);
    if (existingUser) {
      throw new BadRequestException(
        `The username '${username}' is already in use. Please verify your username or choose a different one.`,
      );
    }
    const id = generateIdOf(username);
    const passwordHash = await this.generateHash(password);
    const user = await this.localStrategyService.signUpWithUsername({
      username,
      passwordHash,
      authProviderType: 'username',
      authProviderId: id,
    });
    return { userId: user.userId };
  }

  async signOut(response: Response, userId: string) {
    if (userId) {
      await this.localStrategyService.signOut(userId);
    }
    return await this.authService.signOut(response);
  }
}
