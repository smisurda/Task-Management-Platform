import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt-payload.interface';
import { Role } from '@app/data';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.organizationId || !payload.role) {
      throw new UnauthorizedException();
    }
    return {
      userId: payload.sub,
      email: payload.email,
      organizationId: payload.organizationId,
      role: payload.role as Role,
    };
  }
}
