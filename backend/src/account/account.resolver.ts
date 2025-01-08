import { Query, Resolver } from '@nestjs/graphql';
import { Account } from './account.model';

@Resolver()
export class AccountResolver {
  @Query(() => Account, { nullable: true })
  me() {
    return null;
  }
}
