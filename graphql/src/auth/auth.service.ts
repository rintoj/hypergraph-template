import { config } from '@/config';
import { generateIdOf } from '@hgraph/storage';
import { InjectRepo, Repository } from '@hgraph/storage/nestjs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';
import { ACCESS_TOKEN } from './auth.input';
import { AuthMetadata } from './auth.model';
import { expirationToSeconds } from './auth.utils';

const saltRounds = 10;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepo(AuthMetadata)
    private readonly basicAuthRepository: Repository<AuthMetadata>,
    private readonly jwtService: JwtService,
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
      secret: config.JWT_SECRET,
      expiresIn: config.JWT_EXPIRY,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: config.JWT_REFRESH_SECRET,
      expiresIn: config.JWT_REFRESH_EXPIRY,
    });
    return { accessToken, refreshToken };
  }

  private attachTokensToResponse(response: Response, accessToken: string) {
    response.header(ACCESS_TOKEN, accessToken);
    response.cookie(ACCESS_TOKEN, accessToken, {
      httpOnly: true,
      secure: config.isProd,
      sameSite: config.isProd ? 'lax' : 'none',
      maxAge: expirationToSeconds(config.JWT_EXPIRY) * 1000,
    });
  }

  async findByUsername(username: string) {
    return this.basicAuthRepository.findOne((q) =>
      q.whereEqualTo('username', username),
    );
  }

  async verifyWithUsername(
    username: string,
    password: string,
  ): Promise<AuthMetadata | undefined> {
    const user = await this.basicAuthRepository.findOne((q) =>
      q.whereEqualTo('username', username),
    );
    if (!user?.passwordHash) return;
    if (!this.comparePassword(password, user.passwordHash)) return;
    return user;
  }

  async verifyWithRefreshToken(
    username: string,
    refreshToken: string,
  ): Promise<AuthMetadata | undefined> {
    const user = await this.basicAuthRepository.findOne((q) =>
      q.whereEqualTo('username', username),
    );
    if (!user?.passwordHash) return;
    if (!this.comparePassword(refreshToken, user.refreshTokenHash)) return;
    return user;
  }

  async signInWithUsername(
    username: string,
    password: string,
    response: Response,
  ) {
    const existingUser = await this.verifyWithUsername(username, password);
    if (!existingUser) {
      throw new BadRequestException(
        'Invalid username or password. Please verify your credentials and try again.',
      );
    }
    const { accessToken, refreshToken } = this.generateTokens({
      userId: existingUser.id,
    });
    const user = await this.basicAuthRepository.update({
      id: generateIdOf(username),
      username,
      lastSigninAt: new Date(),
      refreshTokenHash: await this.generateHash(refreshToken),
    });
    this.attachTokensToResponse(response, accessToken);
    return {
      id: user.id,
      username: user.username,
      providerType: user.providerType,
    };
  }

  async signUpWithUsername(username: string, password: string) {
    const existingUser = await this.findByUsername(username);
    if (existingUser) {
      throw new BadRequestException(
        `The username '${username}' is already in use. Please verify your username or choose a different one.`,
      );
    }
    const id = generateIdOf(username);
    const passwordHash = await this.generateHash(password);
    const user = await this.basicAuthRepository.save({
      id,
      username,
      passwordHash,
      providerId: id,
      providerType: 'username',
      createdAt: new Date(),
    });
    return {
      id: user.id,
      username: user.username,
      providerType: user.providerType,
    };
  }

  async signOut(response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refreshToken');
  }

  async deleteAuthMetadata(username: string) {
    return this.basicAuthRepository.delete((q) =>
      q.whereEqualTo('username', username),
    );
  }
}
