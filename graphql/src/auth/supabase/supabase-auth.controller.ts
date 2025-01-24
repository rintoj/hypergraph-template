import { BadRequestException, Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Public } from '../auth.guard';
import { SupabaseAuthConfig } from './supabase-auth.config';
import { SupabaseAuthService } from './supabase-auth.service';

@Controller('/auth/supabase')
export class SupabaseAuthController {
  constructor(
    private readonly config: SupabaseAuthConfig,
    private readonly supabaseService: SupabaseAuthService,
  ) {}

  private validateNextUrl(next: string | undefined) {
    if (!next) return;
    if (!this.config.redirectUrl.split(',').includes(next)) {
      throw new BadRequestException('Invalid redirect URL');
    }
  }

  @Public()
  @Get('/google')
  async signinWithGoogle(@Req() request: Request, @Res() res: Response) {
    const host = `${request.protocol}://${request.get('host')}`;
    const { next } = request.query as any;
    this.validateNextUrl(next);
    const response = await this.supabaseService.signinWithGoogle(host, next);
    res.redirect(response.data.url);
  }

  @Public()
  @Get('/callback')
  async handleCallback(@Req() request: Request, @Res() response: Response) {
    const { code, next } = request.query as any;
    this.validateNextUrl(next);
    const output = await this.supabaseService.exchangeCodeForSession(
      code,
      response,
    );
    response.redirect(
      `${next ?? this.config.redirectUrl}?access_token=${output.accessToken}&user_id=${output.userId}`,
    );
  }
}
