import { Column, Entity } from 'typeorm';

@Entity()
export class AuthMetadata {
  @Column()
  authProviderId!: string;

  @Column()
  authProviderType!: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  lastSigninAt?: Date;

  @Column({ nullable: true })
  refreshTokenHash?: string;
}

export interface AuthInfo {
  userId: string;
  username: string;
  roles: string[];
  authProviderId: string;
  authProviderType: string;
}

export type AuthPayload = Omit<AuthInfo, 'authProviderId' | 'authProviderType'>;

export interface AuthInfoWithWithCredentials extends AuthInfo {
  passwordHash?: string;
  refreshTokenHash?: string;
}
