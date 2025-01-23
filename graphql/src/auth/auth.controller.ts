import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { Auth } from './auth.decorator';
import { Public } from './auth.guard';
import { LoginWithUsernameInput } from './auth.input';
import { AuthInfo } from './auth.model';
import { AuthService } from './auth.service';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/signin')
  async signin(
    @Res() response: Response,
    @Body() input: LoginWithUsernameInput,
  ) {
    if (!input?.username || !input?.password) {
      throw new BadRequestException('Username and password are required');
    }
    const user = await this.authService.signInWithUsername(
      input?.username,
      input?.password,
      response,
    );
    return response.status(200).json(user);
  }

  @Public()
  @Post('/signup')
  async signup(@Body() input: LoginWithUsernameInput) {
    if (!input?.username || !input?.password) {
      throw new BadRequestException('Username and password are required');
    }
    return this.authService.signUpWithUsername(input.username, input.password);
  }

  @Post('/signout')
  async signout(@Res() response: Response, @Auth() auth?: AuthInfo) {
    await this.authService.signOut(response, auth?.userId);
    return response.json({ user: null });
  }
}
