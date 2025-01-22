import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AuthJwtStrategy } from './auth-jwt.strategy';
import { GlobalAuthGuard } from './auth.guard';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

@Module({
  imports: [UserModule],
  providers: [AuthResolver, AuthService, AuthJwtStrategy, GlobalAuthGuard],
})
export class AuthModule {}
