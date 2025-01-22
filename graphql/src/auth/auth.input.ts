import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field()
  name!: string;

  @Field()
  email!: string;

  @Field()
  password!: string;
}

@InputType()
export class LoginWithEmailInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}
