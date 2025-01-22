import { StorageModule } from '@hgraph/storage/nestjs';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { config } from '../../config';
import { JwtAuthGuard } from './basic-auth-globa.guard';
import { BasicAuthGlobalStrategy } from './basic-auth-global.strategy';
import { BasicAuthController } from './basic-auth.controller';
import { BasicAuthSignInGuard, BasicAuthSignUpGuard } from './basic-auth.guard';
import { AuthMetadata } from './basic-auth.model';
import { BasicAuthResolver } from './basic-auth.resolver';
import { BasicAuthService } from './basic-auth.service';
import { BasicAuthStrategy } from './basic-auth.strategy';

@Module({
  imports: [
    PassportModule.register({
      session: true,
      defaultStrategy: 'jwt',
    }),
    JwtModule.register({
      secret: config.JWT_SECRET,
      signOptions: { expiresIn: config.JWT_EXPIRY },
    }),
    StorageModule.forFeature([AuthMetadata]),
  ],
  providers: [
    BasicAuthService,
    BasicAuthResolver,
    BasicAuthSignInGuard,
    BasicAuthSignUpGuard,
    BasicAuthStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    BasicAuthGlobalStrategy,
  ],
  exports: [BasicAuthService],
  controllers: [BasicAuthController],
})
export class BasicAuthModule {}
