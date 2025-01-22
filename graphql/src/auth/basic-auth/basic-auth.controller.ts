import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { BasicAuthSignInGuard, BasicAuthSignUpGuard } from './basic-auth.guard';

@Controller('/auth')
export class BasicAuthController {
  @UseGuards(BasicAuthSignInGuard)
  @Post('/signin')
  async signin(@Req() request: any) {
    return request.user;
  }

  @UseGuards(BasicAuthSignUpGuard)
  @Post('/signup')
  async signup(@Req() request: any) {
    return request.user;
  }
}
