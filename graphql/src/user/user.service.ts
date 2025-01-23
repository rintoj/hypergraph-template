import { generateIdOf } from '@hgraph/storage';
import { InjectRepo, Repository } from '@hgraph/storage/nestjs';
import { Injectable } from '@nestjs/common';
import {
  LocalStrategyService,
  RefreshTokenCredentials,
  UserCredentials,
} from '../auth/auth.config';
import { AuthInfo, AuthInfoWithWithCredentials } from '../auth/auth.model';
import { User, UserStatus } from './user.model';

@Injectable()
export class UserService implements LocalStrategyService {
  constructor(
    @InjectRepo(User) private readonly userRepository: Repository<User>,
  ) {}

  private toAuthInfo(user: User): AuthInfo {
    return {
      userId: user.id,
      username: user.email,
      roles: user.roles,
      authProviderId: user.authProviderId,
      authProviderType: user.authProviderType,
    };
  }

  private toAuthInfoWithCredentials(user: User): AuthInfoWithWithCredentials {
    return {
      ...this.toAuthInfo(user),
      passwordHash: user.passwordHash,
      refreshTokenHash: user.refreshTokenHash,
    };
  }

  private generateId(username: string) {
    return generateIdOf('email:' + username.toLocaleLowerCase().trim());
  }

  async findByUsername(username: string): Promise<AuthInfoWithWithCredentials> {
    const user = await this.userRepository.findOne((q) =>
      q.whereEqualTo('email', username),
    );
    return this.toAuthInfoWithCredentials(user);
  }

  async signInWithUsername(
    credentials: RefreshTokenCredentials,
  ): Promise<AuthInfo> {
    const id = this.generateId(credentials.username);
    const user = await this.userRepository.update({
      id,
      refreshTokenHash: credentials.refreshTokenHash,
      lastSigninAt: new Date(),
    });
    return this.toAuthInfo(user);
  }

  async signUpWithUsername(credentials: UserCredentials): Promise<AuthInfo> {
    const id = this.generateId(credentials.username);
    const user = await this.userRepository.insert({
      id,
      name: '',
      email: credentials.username,
      authProviderId: credentials.authProviderId,
      authProviderType: credentials.authProviderType,
      passwordHash: credentials.passwordHash,
      status: UserStatus.Active,
    });
    return this.toAuthInfo(user);
  }

  async signOut(id: string): Promise<any> {
    await this.userRepository.update({ id, refreshTokenHash: null });
  }
}
