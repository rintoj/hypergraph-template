import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { BasicAuthController } from './basic-auth.controller';
import { BasicAuthRepository } from './basic-auth.repository';
import { BasicAuthResolver } from './basic-auth.resolver';
import { BasicAuthService } from './basic-auth.service';
import {
  BasicAuthSignupGuard,
  BasicAuthSigninGuard,
} from './basic-auth.strategy';

@Module({
  imports: [
    PassportModule.register({
      session: true,
      defaultStrategy: 'basic-auth',
    }),
  ],
  providers: [
    BasicAuthRepository,
    BasicAuthService,
    BasicAuthResolver,
    BasicAuthSigninGuard,
    BasicAuthSignupGuard,
  ],
  exports: [BasicAuthService],
  controllers: [BasicAuthController],
})
export class BasicAuthModule {}
