import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Response } from 'express';
import { UserMetadata } from '../auth.model';
import { AuthService } from '../auth.service';

@Injectable()
export class SupabaseAuthService {
  private readonly supabase: SupabaseClient<any, 'public', any>;

  constructor(private readonly authService: AuthService) {
    const supabaseUrl = process.env.SUPABASE_URL; // Get these from your .env file
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    this.supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce',
      },
    });
  }

  async authenticate(accessToken: string) {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(accessToken);
    if (error) {
      throw new Error(error.message);
    }
    return user;
  }

  async signinWithGoogle(host: string) {
    const response = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${host}/auth/supabase/callback`,
        queryParams: {
          prompt: 'consent',
        },
      },
    });
    return response;
  }

  async exchangeCodeForSession(code: string | undefined, response: Response) {
    if (!code) {
      throw new UnauthorizedException(
        'Authorization code is missing. Please provide a valid code.',
      );
    }
    const { data } = await this.supabase.auth.exchangeCodeForSession(code);
    const user = data.session.user;
    const provider = `Supabase:${user.app_metadata.provider}`;
    const userMetadata: UserMetadata = {
      provider,
      providerId: user.id,
      name: user.user_metadata.full_name,
      email: user.user_metadata.email,
      identifier: user.user_metadata.email,
      phoneNumber: user.user_metadata.phoneNumber,
      pictureUrl: user.user_metadata.avatar_url,
    };
    await this.authService.createUser(userMetadata);
    const { accessToken, authInfo } = await this.authService.issueTokens(
      userMetadata.identifier,
      response,
    );
    return { accessToken, userId: authInfo.userId };
  }
}
