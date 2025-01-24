import { DynamicModule, Module } from '@nestjs/common';
import { toNonNullArray } from 'tsds-tools';
import { AuthModule } from '../auth.module';
import { SupabaseAuthConfig } from './supabase-auth.config';
import { SupabaseAuthController } from './supabase-auth.controller';
import { SupabaseAuthService } from './supabase-auth.service';

@Module({})
export class SupabaseAuthModule {
  static forRoot(config: SupabaseAuthConfig): DynamicModule {
    return {
      module: SupabaseAuthModule,
      imports: [AuthModule],
      providers: toNonNullArray([
        SupabaseAuthConfig,
        SupabaseAuthService,
        { provide: SupabaseAuthConfig, useValue: config },
      ]),
      controllers: toNonNullArray([
        config.enableRestAPI !== false ? SupabaseAuthController : undefined,
      ]),
    };
  }
}
