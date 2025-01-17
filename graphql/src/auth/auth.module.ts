import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [AccountModule],
  providers: [AuthResolver],
})
export class AuthModule {}
