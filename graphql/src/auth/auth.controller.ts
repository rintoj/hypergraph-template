import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from './auth.guard';
import { LoginWithUsernameInput } from './auth.input';
import { AuthService } from './auth.service';
import { Auth } from './auth.decorator';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/signin')
  async signin(
    @Res() response: Response,
    @Body() input: LoginWithUsernameInput,
  ) {
    const user = await this.authService.signInWithUsername(
      input.username,
      input.password,
      response,
    );
    console.log({ user });
    return response.json(user);
  }

  @Public()
  @Post('/signup')
  async signup(@Body() input: LoginWithUsernameInput) {
    return this.authService.signUpWithUsername(input.username, input.password);
  }

  @Public()
  @Get('/signout')
  async signout(@Res() response: Response) {
    await this.authService.signOut(response);
    return response.json({ user: null });
  }

  @Public()
  @Get('/public')
  async public() {
    return { public: true };
  }

  @Get('/protected')
  async protected(@Auth() user: any) {
    return user;
  }
}
