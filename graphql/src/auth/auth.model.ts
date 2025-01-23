import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn } from 'typeorm';

export enum Role {
  Admin = 'admin',
  User = 'user',
}

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

  @Column({
    type: 'enum',
    enum: Role,
    array: true,
    default: [],
    nullable: true,
  })
  roles?: Role[];

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt?: Date;
}

export interface AuthInfo {
  userId: string;
  username: string;
  roles: Role[];
  providerType: string;
}
