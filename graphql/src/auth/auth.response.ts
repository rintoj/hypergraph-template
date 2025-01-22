import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../user/user.model';

@ObjectType()
export class LoginResponse {
  @Field(() => ID)
  id!: string;

  @Field(() => User)
  user!: User;

  @Field()
  token!: string;
}
