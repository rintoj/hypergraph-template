import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { config } from '../config';
import { UserModule } from '../user/user.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { LocalGuard, LocalStrategy } from './auth-local.strategy';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [
    UserModule,
    PassportModule.register({
      session: true,
      defaultStrategy: 'local',
    }),
    JwtModule.register({
      secret: config.JWT_SECRET,
      signOptions: { expiresIn: config.JWT_EXPIRY },
    }),
    FirebaseModule,
  ],
  providers: [
    AuthResolver,
    AuthService,
    LocalGuard,
    LocalStrategy,
    // AuthJwtStrategy,
    // AuthenticationGuard,
    // GlobalAuthGuard,
  ],
})
export class AuthModule {}
