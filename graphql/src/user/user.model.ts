import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserRole } from './user.enum';

export enum UserStatus {
  Active = 'Active',
  Disabled = 'Disabled',
}

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
