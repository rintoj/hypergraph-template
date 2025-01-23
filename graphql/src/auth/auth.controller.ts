import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { Public } from './auth-global.guard';
import { LoginWithUsernameInput } from './auth.input';
import { AuthService } from './auth.service';
import type { Response } from 'express';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/signin')
  async signin(
    @Res() response: Response,
    @Body() input: LoginWithUsernameInput,
  ) {
    return this.authService.signInWithUsername(
      input.username,
      input.password,
      response,
    );
  }

  @Public()
  @Post('/signup')
  async signup(@Body() input: LoginWithUsernameInput) {
    return this.authService.signUpWithUsername(input.username, input.password);
  }

  @Public()
  @Get('/public')
  async public() {
    return { public: true };
  }

  @Get('/protected')
  async protected() {
    return { protected: true };
  }
}
