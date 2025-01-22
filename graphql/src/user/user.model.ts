import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum UserRole {
  Admin = 'Admin',
  User = 'User',
}
registerEnumType(UserRole, { name: 'AccountRole' });

export enum UserStatus {
  Active = 'Active',
  Disabled = 'Disabled',
}
registerEnumType(UserStatus, { name: 'UserStatus' });

@ObjectType()
export class User {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field(() => [UserRole])
  roles!: UserRole[];

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => String, { nullable: true })
  photoURL?: string;

  status!: UserStatus;
  providerUid!: string;
  isEmailVerified?: boolean;
}
