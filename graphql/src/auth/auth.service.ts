import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';
import { AuthConfig } from './auth.config';
import { ACCESS_TOKEN } from './auth.input';
import { AuthInfo, AuthPayload } from './auth.model';
import { expirationToSeconds } from './auth.utils';
import { AuthInfoWithWithCredentials } from './local/local-auth.config';

const saltRounds = 10;
const isProd = process.env.NODE_ENV === 'production';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authConfig: AuthConfig,
  ) {}

  private async generateHash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(password, salt);
  }

  private async comparePassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }

  private sanitizePayload(user: AuthInfo): AuthPayload {
    return {
      userId: user.userId,
      username: user.username,
      roles: user.roles,
    };
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

  signInWithUser(user: AuthInfoWithWithCredentials, response: Response) {
    const { accessToken, refreshToken } = this.generateTokens(
      this.sanitizePayload(user),
    );
    this.attachTokensToResponse(response, refreshToken);
    return { accessToken, refreshToken };
  }

  async signOut(response: Response) {
    response.clearCookie(ACCESS_TOKEN);
  }
}
