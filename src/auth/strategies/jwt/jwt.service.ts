import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'super_secret_key', // debe coincidir con tu JWT_SECRET
    });
  }

  async validate(payload: any) {
    // devuelve exactamente el payload que pusiste al firmar el token
    return {
      user_id: payload.user_id,
      user_name: payload.user_name,
      developer: payload.developer,
      multi_company: payload.multi_company,
      theme_color: payload.theme_color || 'Blue_Theme',
    };
  }
}