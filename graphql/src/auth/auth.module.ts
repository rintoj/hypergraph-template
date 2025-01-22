import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { GlobalAuthGuard } from './auth.guard';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule],
  providers: [AuthResolver, AuthService, GlobalAuthGuard],
})
export class AuthModule {}
