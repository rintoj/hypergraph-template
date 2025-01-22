import { config } from '@/config';
import { generateIdOf } from '@hgraph/storage';
import { InjectRepo, Repository } from '@hgraph/storage/nestjs';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
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

  private generateProviderId(username: string) {
    return generateIdOf(username);
  }

  async findById(id: string) {
    return this.basicAuthRepository.findById(id);
  }

  async findByUsername(username: string) {
    return this.basicAuthRepository.findOne((q) =>
      q.whereEqualTo('username', username),
    );
  }

  generateTokens(payload: any) {
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

  attachTokensToResponse(
    response: any,
    accessToken: string,
    refreshToken: string,
  ) {
    console.log({ response });
    response.header('Authentication', accessToken);
    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: config.isProd,
      sameSite: config.isProd ? 'Lax' : 'none',
      maxAge: expirationToSeconds(config.JWT_EXPIRY) * 1000,
    });
    response.header('Refresh', refreshToken);
    response.cookie('Refresh', refreshToken, {
      httpOnly: true,
      secure: config.isProd,
      sameSite: config.isProd ? 'Lax' : 'none',
      maxAge: expirationToSeconds(config.JWT_REFRESH_EXPIRY) * 1000,
    });
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

  async saveSigninData(username: string, refreshToken: string) {
    const id = generateIdOf(username);
    return this.basicAuthRepository.update({
      id,
      username,
      lastSigninAt: new Date(),
      refreshTokenHash: await this.generateHash(refreshToken),
    });
  }

  async saveAuthMetadata(
    username: string,
    password: string,
    lastSigninAt?: Date,
  ) {
    const passwordHash = await this.generateHash(password);
    const id = generateIdOf(username);
    return this.basicAuthRepository.save({
      id,
      username,
      passwordHash,
      providerId: id,
      providerType: 'basic-auth',
      createdAt: new Date(),
      lastSigninAt,
    });
  }

  async deleteAuthMetadata(username: string) {
    return this.basicAuthRepository.delete((q) =>
      q.whereEqualTo('username', username),
    );
  }
}
