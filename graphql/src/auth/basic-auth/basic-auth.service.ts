import { generateIdOf } from '@hgraph/storage';
import { InjectRepo, Repository } from '@hgraph/storage/nestjs';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthMetadata } from './basic-auth.model';

const saltRounds = 10;

@Injectable()
export class BasicAuthService {
  constructor(
    @InjectRepo(AuthMetadata)
    private readonly basicAuthRepository: Repository<AuthMetadata>,
  ) {}

  private async hashPassword(password: string): Promise<string> {
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

  async validateUser(username: string, password: string): Promise<boolean> {
    const user = await this.basicAuthRepository.findOne((q) =>
      q.whereEqualTo('username', username),
    );
    if (!user?.passwordHash) return false;
    return this.comparePassword(password, user.passwordHash);
  }

  async saveSigninData(username: string) {
    const id = generateIdOf(username);
    return this.basicAuthRepository.update({
      id,
      username,
      lastSigninAt: new Date(),
    });
  }

  async saveAuthMetadata(
    username: string,
    password: string,
    lastSigninAt?: Date,
  ) {
    const passwordHash = await this.hashPassword(password);
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
