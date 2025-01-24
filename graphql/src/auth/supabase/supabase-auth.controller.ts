import { Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Public } from '../auth.guard';
import { SupabaseAuthService } from './supabase-auth.service';

@Controller('/auth/supabase')
export class SupabaseAuthController {
  constructor(private readonly supabaseService: SupabaseAuthService) {}

  @Public()
  @Get('/google')
  async signinWithGoogle(@Req() request: Request, @Res() res: Response) {
    const host = `${request.protocol}://${request.get('host')}`;
    const response = await this.supabaseService.signinWithGoogle(host);
    res.redirect(response.data.url);
  }

  @Public()
  @Get('/callback') // Assuming this handles the callback
  async handleCallback(@Req() request: Request, @Res() response: Response) {
    const { code } = request.query;
    const output = await this.supabaseService.exchangeCodeForSession(
      code as string | undefined,
      response,
    );
    return response.json(output);
  }
}
