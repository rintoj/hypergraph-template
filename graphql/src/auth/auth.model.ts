import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
@ObjectType()
export class AuthMetadata {
  @PrimaryColumn()
  @Field()
  id: string;

  @Column()
  @Field()
  username: string;

  @Column()
  @Field()
  providerType!: string;

  @Column()
  passwordHash: string;

  @Column()
  providerId!: string;

  @Column({ nullable: true })
  lastSigninAt?: Date;

  @Column({ nullable: true })
  refreshTokenHash?: string;

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt?: Date;
}

export interface AuthInfo {
  userId: string;
  roles: string;
}
