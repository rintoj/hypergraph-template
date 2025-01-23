import { DynamicModule, Module } from '@nestjs/common';
import { toNonNullArray } from 'tsds-tools';
import { AuthModule } from '../auth.module';
import { LocalAuthConfig } from './local-auth.config';
import { LocalAuthController } from './local-auth.controller';
import { LocalAuthResolver } from './local-auth.resolver';
import { LocalAuthService } from './local-auth.service';

@Module({})
export class LocalAuthModule {
  static forRoot(config: LocalAuthConfig): DynamicModule {
    return {
      module: LocalAuthModule,
      imports: [AuthModule],
      providers: toNonNullArray([
        LocalAuthService,
        config.enableRestAPI !== false ? LocalAuthResolver : undefined,
        { provide: LocalAuthConfig, useValue: config },
        { provide: 'LocalStrategyService', useClass: config.userService },
      ]),
      controllers: toNonNullArray([
        config.enableRestAPI !== false ? LocalAuthController : undefined,
      ]),
    };
  }
}
