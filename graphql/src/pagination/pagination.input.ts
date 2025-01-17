import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class PageInput {
  @Field(() => Int, { nullable: true })
  offset?: number;

  @Field(() => Int, { nullable: true })
  limit?: number;
}
