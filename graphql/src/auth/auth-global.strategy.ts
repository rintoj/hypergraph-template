import { config } from '@/config';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { parse } from 'cookie';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class AuthGlobalStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      secretOrKey: config.JWT_SECRET,
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('token'),
        ExtractJwt.fromHeader('token'),
        ExtractJwt.fromUrlQueryParameter('access_token'),
        ExtractJwt.fromHeader('access_token'),
        (req) => {
          const cookies = parse(req.headers.cookie ?? '');
          return cookies.Authentication;
        },
      ]),
    });
  }

  validate(data, verified, a, b) {
    console.log({ data, verified, a, b });
    verified(null, data);
  }
}
