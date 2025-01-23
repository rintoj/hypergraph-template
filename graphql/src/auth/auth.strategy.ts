import { config } from '@/config';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { parse } from 'cookie';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ACCESS_TOKEN } from './auth.input';

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      secretOrKey: config.JWT_SECRET,
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromHeader(ACCESS_TOKEN),
        ExtractJwt.fromUrlQueryParameter('token'),
        ExtractJwt.fromHeader('token'),
        (req) => {
          const cookies = parse(req.headers.cookie ?? '');
          return cookies[ACCESS_TOKEN];
        },
      ]),
    });
  }

  validate(data, verified, a, b) {
    console.log('AuthStrategy: verify =>', { data, verified, a, b });
    verified(null, data);
  }
}
