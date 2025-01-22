import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { BasicAuthGuard } from './basic-auth.strategy';

@Controller('/auth')
export class BasicAuthController {
  @UseGuards(BasicAuthGuard)
  @Post('/login')
  async login(@Req() request: any) {
    return request.user;
  }
}
