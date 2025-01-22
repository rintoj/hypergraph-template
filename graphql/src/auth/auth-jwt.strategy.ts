import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from '../config';

@Injectable()
export class AuthJwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.JWT_SECRET,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    console.log('JWTStragegy.validate payload:', payload);
    return { userId: payload.sub, username: payload.username };
  }
}
