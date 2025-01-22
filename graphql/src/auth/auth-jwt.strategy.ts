import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from '../config';

@Injectable()
export class AuthJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  logIn(context: any) {
    console.log('AuthJwtStrategy.logIn:', context);
  }

  async validate(payload: any) {
    console.log('JWTStrategy.validate payload:', payload);
    return { userId: payload.sub, username: payload.username };
  }
}
