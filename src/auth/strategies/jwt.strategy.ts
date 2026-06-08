import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayloadUser } from '../decorators/current-user.decorator';

export interface JwtPayload {
  sub: string;
  username: string;
  role: 'facilitator' | 'member' | 'guest';
  email: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'dev_secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayloadUser> {
    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      email: payload.email,
    };
  }
}
