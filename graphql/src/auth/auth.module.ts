import { Module } from '@nestjs/common';
import { FirebaseModule } from '../firebase/firebase.module';
import { UserModule } from '../user/user.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { BasicAuthModule } from './basic-auth';

@Module({
  imports: [
    UserModule,
    // PassportModule.register({
    //   session: true,
    //   defaultStrategy: 'basic-auth',
    // }),
    // JwtModule.register({
    //   secret: config.JWT_SECRET,
    //   signOptions: { expiresIn: config.JWT_EXPIRY },
    // }),
    FirebaseModule,
    BasicAuthModule,
  ],
  providers: [
    AuthResolver,
    AuthService,
    // LocalGuard,
    // LocalStrategy,
    // AuthJwtStrategy,
    // AuthenticationGuard,
    // GlobalAuthGuard,
  ],
})
export class AuthModule {}
