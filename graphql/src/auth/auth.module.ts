import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthGuardProvider } from './auth.guard';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [UserModule],
  providers: [AuthResolver, AuthGuardProvider],
})
export class AuthModule {}
