import { config } from '@/config';
import { StorageModule } from '@hgraph/storage/nestjs';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthStrategy } from './auth-global.strategy';
import { AuthController } from './auth.controller';
import { GlobalAuthGuard } from './auth.guard';
import { AuthMetadata } from './auth.model';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

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
  providers: [AuthStrategy, AuthResolver, AuthService, GlobalAuthGuard],
  controllers: [AuthController],
})
export class AuthModule {}
