import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      user_id: payload.user_id,
      user_name: payload.user_name,
      developer: payload.developer,
      super_admin: payload.super_admin || payload.developer || false,
      multi_company: payload.multi_company,
      theme_color: payload.theme_color || 'Blue_Theme',
      company_id: payload.company_id,
    };
  }
}
