import { Context, Query, Resolver } from '@nestjs/graphql';
import { Account } from './account.model';
import { RequestContext } from '../context';
import { AccountRepository } from './account.repository';

@Resolver()
export class AccountResolver {
  constructor(private readonly accountRepository: AccountRepository) {}

  @Query(() => Account, { nullable: true })
  async me(
    @Context()
    context: RequestContext,
  ): Promise<Account> {
    return this.accountRepository.findById(context.accountId);
  }
}
