import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SupabaseAuthService } from './supabase-auth.service';
import { AuthConfig } from '../auth.config';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy, 'supabase') {
  constructor(
    private readonly supabaseService: SupabaseAuthService,
    private readonly config: AuthConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwtConfig.secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    const user = await this.supabaseService.authenticate(payload.access_token);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
