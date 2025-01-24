import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { toNonNullArray } from 'tsds-tools';
import { AuthConfig, AuthStrategyType } from './auth.config';
import { GlobalAuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { AuthStrategy } from './auth.strategy';
import { LocalAuthModule } from './local';
import { SupabaseAuthModule } from './supabase';
import { StorageModule } from '@hgraph/storage/nestjs';
import { AuthMetadata } from './auth.model';

@Global()
@Module({})
export class AuthModule {
  static async forRoot(config: AuthConfig): Promise<DynamicModule> {
    const authModules = [];
    for (const strategy of config.strategies) {
      if (strategy.type === AuthStrategyType.Local) {
        authModules.push(LocalAuthModule.forRoot(strategy));
      } else if (strategy.type === AuthStrategyType.Supabase) {
        authModules.push(SupabaseAuthModule.forRoot(strategy));
      }
    }
    return {
      module: AuthModule,
      providers: toNonNullArray([
        AuthStrategy,
        AuthService,
        GlobalAuthGuard,
        { provide: AuthConfig, useValue: config },
        { provide: 'UserService', useClass: config.userService },
      ]),
      exports: [AuthService],
      imports: toNonNullArray([
        StorageModule.forFeature([AuthMetadata]),
        PassportModule.register({ defaultStrategy: 'jwt', global: true }),
        JwtModule.register({
          secret: config.jwtConfig.secret,
          signOptions: { expiresIn: config.jwtConfig.expiry },
        }),
        ...authModules,
      ]),
    };
  }
}
