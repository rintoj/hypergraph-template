import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { BasicAuthService } from './basic-auth.service';

@Injectable()
export class BasicAuthStrategy extends PassportStrategy(
  Strategy,
  'basic-auth',
) {
  constructor(private readonly basicAuthService: BasicAuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string) {
    return this.basicAuthService.verifyWithUsername(email, password);
  }
}
