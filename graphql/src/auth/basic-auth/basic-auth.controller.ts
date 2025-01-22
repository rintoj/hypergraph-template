import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  BasicAuthSigninGuard,
  BasicAuthSignupGuard,
} from './basic-auth.strategy';

@Controller('/auth')
export class BasicAuthController {
  @UseGuards(BasicAuthSigninGuard)
  @Post('/signin')
  async signin(@Req() request: any) {
    return request.user;
  }

  @UseGuards(BasicAuthSignupGuard)
  @Post('/signup')
  async signup(@Req() request: any) {
    return request.user;
  }
}
