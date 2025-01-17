import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Account } from '../account/account.model';

@ObjectType()
export class LoginResponse {
  @Field(() => ID)
  id!: string;

  @Field(() => Account)
  account!: Account;

  @Field()
  token!: string;
}
