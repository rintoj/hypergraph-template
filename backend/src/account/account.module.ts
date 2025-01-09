import { Module } from '@nestjs/common';
import { AccountResolver } from './account.resolver';
import { AccountRepository } from './account.repository';

@Module({
  providers: [AccountResolver, AccountRepository],
  exports: [AccountRepository],
})
export class AccountModule {}
