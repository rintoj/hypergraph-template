import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, Entity } from 'typeorm';
import { AuthMetadata } from '../auth/auth.model';

export enum UserRole {
  Admin = 'Admin',
  User = 'User',
}
registerEnumType(UserRole, { name: 'UserRole' });

export enum UserStatus {
  Active = 'Active',
  Disabled = 'Disabled',
}
registerEnumType(UserStatus, { name: 'UserStatus' });

@ObjectType()
@Entity()
export class User extends AuthMetadata {
  @Field(() => ID)
  @Column({ nullable: true })
  id!: string;

  @Field()
  @Column({ nullable: true })
  name!: string;

  @Field({ nullable: true })
  @Column()
  email!: string;

  @Field(() => [UserRole])
  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.User],
    nullable: true,
  })
  roles?: UserRole[];

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  updatedAt?: Date;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  photoURL?: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    nullable: true,
  })
  status!: UserStatus;

  @Column({ nullable: true })
  isEmailVerified?: boolean;
}
