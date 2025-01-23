import { generateIdOf } from '@hgraph/storage';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';
import { AuthConfig, LocalStrategyService } from './auth.config';
import { ACCESS_TOKEN } from './auth.input';
import { AuthInfo, AuthPayload } from './auth.model';
import { SignInResponse, SignUpResponse } from './auth.response';
import { expirationToSeconds } from './auth.utils';

const saltRounds = 10;
const isProd = process.env.NODE_ENV === 'production';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authConfig: AuthConfig,
    @Inject('LocalStrategyService')
    private readonly localStrategyService: LocalStrategyService,
  ) {}

  private async generateHash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  }

  private async comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  private generateTokens(payload: any) {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.authConfig.jwtConfig.secret,
      expiresIn: this.authConfig.jwtConfig.expiry,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.authConfig.jwtConfig.refreshSecret,
      expiresIn: this.authConfig.jwtConfig.refreshExpiry,
    });
    return { accessToken, refreshToken };
  }

  private attachTokensToResponse(response: Response, accessToken: string) {
    response.header(ACCESS_TOKEN, accessToken);
    response.cookie(ACCESS_TOKEN, accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'lax' : 'none',
      maxAge: expirationToSeconds(this.authConfig.jwtConfig.expiry) * 1000,
    });
  }

  private sanitizePayload(user: AuthInfo): AuthPayload {
    return {
      userId: user.userId,
      username: user.username,
      roles: user.roles,
    };
  }

  async verifyWithUsername(username: string, password: string) {
    const user = await this.localStrategyService.findByUsername(username);
    if (!user?.passwordHash) return;
    if (!(await this.comparePassword(password, user.passwordHash))) return;
    return user;
  }

  async verifyWithRefreshToken(username: string, refreshToken: string) {
    const user = await this.localStrategyService.findByUsername(username);
    if (!user?.refreshTokenHash) return;
    if (!this.comparePassword(refreshToken, user.refreshTokenHash)) return;
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
    const { accessToken, refreshToken } = this.generateTokens(
      this.sanitizePayload(existingUser),
    );
    const user = await this.localStrategyService.signInWithUsername({
      username,
      refreshTokenHash: await this.generateHash(refreshToken),
    });
    this.attachTokensToResponse(response, accessToken);
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
    response.clearCookie(ACCESS_TOKEN);
  }
}
