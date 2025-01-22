import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Public } from './auth-global.guard';
import { AuthSignInGuard, AuthSignUpGuard } from './auth.guard';

@Controller('/auth')
export class AuthController {
  @UseGuards(AuthSignInGuard)
  @Public()
  @Post('/signin')
  async signin(@Req() request: any) {
    return request.user;
  }

  @UseGuards(AuthSignUpGuard)
  @Public()
  @Post('/signup')
  async signup(@Req() request: any) {
    return request.user;
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
