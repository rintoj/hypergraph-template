import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Req,
  Res,
} from '@nestjs/common';
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
    const { next } = request?.query as any;
    this.validateNextUrl(next);
    const response = await this.supabaseService.signinWithGoogle(host, next);
    if (!response?.data?.url) {
      throw new InternalServerErrorException('Invalid redirect URL');
    }
    res.redirect(response?.data?.url);
  }

  @Public()
  @Get('/callback')
  async handleCallback(@Req() request: Request, @Res() res: Response) {
    const { code, next } = request.query as any;
    this.validateNextUrl(next);
    const output = await this.supabaseService.exchangeCodeForSession(code);
    res.redirect(
      `${next ?? this.config.redirectUrl}?code=${output.code}&provider=${output.provider}`,
    );
  }

  @Public()
  @Post('/token')
  async signWithCode(
    @Res() response: Response,
    @Body() input: { code: string; provider: string },
  ) {
    if (!input?.code || !input?.provider) {
      throw new BadRequestException(
        'Provider is missing. Please provide a valid provider.',
      );
    }
    const user = await this.supabaseService.signinWithCode(
      input.code,
      input.provider,
      response,
    );
    return response.status(200).json(user);
  }
}
