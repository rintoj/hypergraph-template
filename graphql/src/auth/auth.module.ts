import { config } from '@/config';
import { StorageModule } from '@hgraph/storage/nestjs';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthGlobalStrategy } from './auth-global.strategy';
import { AuthController } from './auth.controller';
import { AuthMetadata } from './auth.model';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { LocalAuthStrategy } from './auth.strategy';
import { JwtAuthGuard } from './auth-global.guard';
import { APP_GUARD } from '@nestjs/core';

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
    AuthGlobalStrategy,
    AuthResolver,
    AuthService,
    LocalAuthStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
