import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { toNonNullArray } from 'tsds-tools';
import { AuthConfig, AuthStrategyType } from './auth.config';
import { GlobalAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { AuthStrategy } from './auth.strategy';
import { LocalAuthModule } from './local/local-auth.module';

@Global()
@Module({})
export class AuthModule {
  static forRoot(config: AuthConfig): DynamicModule {
    const localStrategy = config.strategies.find(
      (s) => s.type === AuthStrategyType.Local,
    );
    return {
      module: AuthModule,
      providers: toNonNullArray([
        AuthStrategy,
        AuthService,
        GlobalAuthGuard,
        { provide: AuthConfig, useValue: config },
      ]),
      exports: [AuthService],
      imports: toNonNullArray([
        PassportModule.register({ defaultStrategy: 'jwt', global: true }),
        JwtModule.register({
          secret: config.jwtConfig.secret,
          signOptions: { expiresIn: config.jwtConfig.expiry },
        }),
        localStrategy ? LocalAuthModule.forRoot(localStrategy) : undefined,
      ]),
    };
  }
}
