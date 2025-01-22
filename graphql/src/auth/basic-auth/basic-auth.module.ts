import { StorageModule } from '@hgraph/storage/nestjs';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { BasicAuthController } from './basic-auth.controller';
import { AuthMetadata } from './basic-auth.model';
import { BasicAuthResolver } from './basic-auth.resolver';
import { BasicAuthService } from './basic-auth.service';
import {
  BasicAuthSigninGuard,
  BasicAuthSignupGuard,
} from './basic-auth.strategy';

@Module({
  imports: [
    PassportModule.register({
      session: true,
      defaultStrategy: 'basic-auth',
    }),
    StorageModule.forFeature([AuthMetadata]),
  ],
  providers: [
    BasicAuthService,
    BasicAuthResolver,
    BasicAuthSigninGuard,
    BasicAuthSignupGuard,
  ],
  exports: [BasicAuthService],
  controllers: [BasicAuthController],
})
export class BasicAuthModule {}
