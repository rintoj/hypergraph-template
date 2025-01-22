import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Public } from './basic-auth-globa.guard';
import { BasicAuthSignInGuard, BasicAuthSignUpGuard } from './basic-auth.guard';

@Controller('/auth')
export class BasicAuthController {
  @UseGuards(BasicAuthSignInGuard)
  @Public()
  @Post('/signin')
  async signin(@Req() request: any) {
    return request.user;
  }

  @UseGuards(BasicAuthSignUpGuard)
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
