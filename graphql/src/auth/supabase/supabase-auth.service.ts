import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Response } from 'express';
import { UserMetadata } from '../auth.model';
import { AuthService } from '../auth.service';
import { SupabaseAuthConfig } from './supabase-auth.config';

@Injectable()
export class SupabaseAuthService {
  private readonly supabase: SupabaseClient<any, 'public', any>;

  constructor(
    private readonly authService: AuthService,
    private readonly config: SupabaseAuthConfig,
  ) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { flowType: 'pkce' },
    });
  }

  async signinWithGoogle(host: string, next: string | undefined) {
    return await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${host}/auth/supabase/callback`,
        queryParams: {
          prompt: 'consent',
          next,
        },
      },
    });
  }

  async exchangeCodeForSession(code: string | undefined) {
    if (!code) {
      throw new UnauthorizedException(
        'Authorization code is missing. Please provide a valid code.',
      );
    }
    const { data } = await this.supabase.auth.exchangeCodeForSession(code);
    if (!data?.session?.user) {
      throw new UnauthorizedException(
        'Failed to exchange authorization code for session. Please try again.',
      );
    }
    const user = data.session.user;
    const provider = `supabase:${user.app_metadata.provider}`;
    const userMetadata: UserMetadata = {
      provider,
      providerId: user.id,
      name: user.user_metadata?.full_name,
      email: user.user_metadata?.email,
      identifier: user.user_metadata?.email,
      phoneNumber: user.user_metadata?.phone_number,
      pictureUrl: user.user_metadata?.avatar_url,
    };
    await this.authService.createUser(userMetadata);
    const issuedCode = await this.authService.issueAuthCode(
      userMetadata.identifier,
      userMetadata.provider,
    );
    return { code: issuedCode, provider };
  }

  async signinWithCode(code: string, provider: string, response: Response) {
    const authMetadata = await this.authService.findByAuthCode(code, provider);
    if (!authMetadata) {
      throw new BadRequestException(
        'Invalid authentication code. Please try again.',
      );
    }
    await this.authService.clearAuthCode(authMetadata.id);
    const { accessToken, authInfo } = await this.authService.issueTokens(
      authMetadata.id,
      response,
    );
    return { accessToken, userId: authInfo.userId };
  }
}
