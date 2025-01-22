import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { BasicAuthModule } from './basic-auth';

@Module({
  imports: [UserModule, BasicAuthModule],
  providers: [AuthResolver, AuthService],
})
export class AuthModule {}
