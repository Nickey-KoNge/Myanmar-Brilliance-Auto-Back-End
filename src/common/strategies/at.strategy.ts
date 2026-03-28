import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
  sub: string;
  email: string;
  companyId: string;
};
@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'AT_SECRET', // သင်၏ CredentialsService ထဲက secret နဲ့ တူရပါမယ်
    });
  }

  validate(payload: JwtPayload) {
    // ဤနေရာတွင် return ပြန်ပေးလိုက်သော data သည် request.user ထဲသို့ ရောက်သွားပါမည်
    return {
      userId: payload.sub,
      email: payload.email,
      companyId: payload.companyId,
    };
  }
}
