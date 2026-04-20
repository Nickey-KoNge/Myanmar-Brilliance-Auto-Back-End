import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Staff } from 'src/modules/master-company/staff/entities/staff.entity';

type JwtPayload = {
  sub: string;
  email: string;
  companyId: string;
  staffName: string;
};
@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepo: Repository<Staff>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'AT_SECRET', // သင်၏ CredentialsService ထဲက secret နဲ့ တူရပါမယ်
    });
  }

  async validate(payload: JwtPayload) {
    const staff = await this.staffRepo.findOne({
      where: {
        credential: { id: payload.sub },
      } as FindOptionsWhere<Staff>,
    });
    return {
      userId: staff ? staff.id : payload.sub,
      email: payload.email,
      companyId: payload.companyId,
      staffName: payload.staffName,
      credentialId: payload.sub,
    };
  }
}
