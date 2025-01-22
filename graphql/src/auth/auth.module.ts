import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthResolver } from './auth.resolver';

@Module({
  imports: [UserModule],
  providers: [AuthResolver],
})
export class AuthModule {}
