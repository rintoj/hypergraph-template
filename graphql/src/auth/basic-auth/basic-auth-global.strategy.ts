import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { parse } from 'cookie';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config } from '../../config';

@Injectable()
export class BasicAuthGlobalStrategy extends PassportStrategy(Strategy, 'jwt') {
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
  validate(data, verified) {
    console.log(data, verified);
    verified(null, data);
    // super.validate(...args);
  }
}
