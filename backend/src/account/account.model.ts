import { Field, ID, ObjectType } from '@nestjs/graphql';
import { AccountRole } from './account-role.enum';

@ObjectType()
export class Account {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  email?: string;

  @Field(() => [AccountRole])
  roles!: AccountRole[];

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
