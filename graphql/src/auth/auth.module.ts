import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { toNonNullArray } from 'tsds-tools';
import { AuthConfig, AuthStrategyType } from './auth.config';
import { AuthController } from './auth.controller';
import { GlobalAuthGuard } from './auth.guard';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { AuthStrategy } from './auth.strategy';

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
        AuthResolver,
        GlobalAuthGuard,
        { provide: AuthConfig, useValue: config },
        {
          provide: 'LocalStrategyService',
          useClass: localStrategy.userService,
        },
      ]),
      imports: [
        PassportModule.register({
          defaultStrategy: 'jwt',
          global: true,
        }),
        JwtModule.register({
          secret: config.jwtConfig.secret,
          signOptions: { expiresIn: config.jwtConfig.expiry },
        }),
      ],
      controllers: [AuthController],
    };
  }
}
