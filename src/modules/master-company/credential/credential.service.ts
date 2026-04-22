import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { Credential } from './entities/credential.entity';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class CredentialsService {
  constructor(
    private dataSource: DataSource,
    private jwtService: JwtService,
  ) {}

  async register(
    dto: RegisterDto,
    manager?: EntityManager,
  ): Promise<Credential> {
    const credentialRepo = manager
      ? manager.getRepository(Credential)
      : this.dataSource.getRepository(Credential);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    if (!dto.password || dto.password.length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters long',
      );
    }

    const existing = await credentialRepo.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const credential = credentialRepo.create({
        email: dto.email,
        password: hashedPassword,
      });

      return await credentialRepo.save(credential);
    } catch {
      throw new InternalServerErrorException('Failed to create credential');
    }
  }

  async updateCredential(
    id: string,
    email?: string,
    password?: string,
  ): Promise<Credential> {
    const credentialRepo = this.dataSource.getRepository(Credential);

    const credential = await credentialRepo.findOne({ where: { id } });

    if (!credential) throw new NotFoundException('Credential not found');

    if (email) {
      if (email !== credential.email) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
          throw new BadRequestException('Invalid email format');

        const existing = await credentialRepo.findOne({ where: { email } });

        if (existing && existing.id !== id) {
          throw new BadRequestException(
            'Email already in use by another account',
          );
        }

        credential.email = email;
      }
    }

    if (password) {
      if (password.length < 6)
        throw new BadRequestException(
          'Password must be at least 6 characters long',
        );
      credential.password = await bcrypt.hash(password, 10);
    }

    return await credentialRepo.save(credential);
  }

  async deleteCredential(id: string): Promise<void> {
    const credentialRepo = this.dataSource.getRepository(Credential);

    const result = await credentialRepo.delete(id);
    // const result = await credentialRepo.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Credential not found');
    }
  }

  async login(dto: LoginDto) {
    console.log(dto.email);
    const user = await this.dataSource.getRepository(Credential).findOne({
      where: { email: dto.email },
      // relations: ['staff', 'staff.company'],
      relations: ['staff', 'staff.company', 'staff.role'],
      select: ['id', 'email', 'password', 'status'],
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const staffName = user.staff?.staffName || 'Unknow User';

    const role = user.staff?.role?.role_name;

    // 1. Generate Access and Refresh Tokens
    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.staff.company.id,
      staffName,
      role,
    );

    // 2. Save the Refresh Token to the database
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    console.log('LOGIN ROLE RAW:', user.staff?.role);
    console.log('LOGIN ROLE NAME:', role);

    return {
      message: 'Login successful',
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        staffName: user.staff?.staffName || 'Unknown User',
        image: user.staff?.image || null,
        companyId: user.staff?.company?.id,
        role,
      },
    };
  }

  async getTokens(
    userId: string,
    email: string,
    companyId: string,
    staffName: string,
    role: string,
  ) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        // { sub: userId, email, companyId, staffName },
        {
          sub: userId,
          email,
          companyId,
          staffName,
          role,
        },
        { secret: 'AT_SECRET', expiresIn: '4h' },
      ),
      this.jwtService.signAsync(
        // { sub: userId, email, companyId, staffName },
        {
          sub: userId,
          email,
          companyId,
          staffName,
          role,
        },
        { secret: 'RT_SECRET', expiresIn: '7d' },
      ),
    ]);

    return { access_token: at, refresh_token: rt };
  }

  async updateRefreshToken(userId: string, rt: string) {
    const hashedRt = await bcrypt.hash(rt, 10);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    await this.dataSource.getRepository(RefreshToken).save({
      token: hashedRt,
      expiresAt: expiryDate,
      credential: { id: userId },
    });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.dataSource.getRepository(Credential).findOne({
      where: { id: userId },
      // relations: ['staff', 'staff.company'],
      relations: ['staff', 'staff.company', 'staff.role'],
    });

    if (!user) throw new ForbiddenException('Access Denied');

    // ၁။ Database ထဲမှ သိမ်းထားသော Token ကို ယူသည်
    const rtRepo = this.dataSource.getRepository(RefreshToken);
    const storedToken = await rtRepo.findOne({
      where: { credential: { id: userId } },
      order: { createdAt: 'DESC' }, // နောက်ဆုံးထုတ်ထားသော token ကိုယူရန်
    });

    // ၂။ Token ရှိမရှိ နှင့် သက်တမ်းကုန်မကုန် စစ်သည်
    if (!storedToken || new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException(
        'Refresh token expired. Please login again.',
      );
    }

    // ၃။ အရေးကြီးဆုံးအချက်: ပို့လိုက်သော Token နှင့် DB ထဲက Hash တူမတူ bcrypt ဖြင့် စစ်ရမည်
    const isMatch = await bcrypt.compare(refreshToken, storedToken.token);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }
    const staffName = user.staff?.staffName || 'Unknown User';
    const role = user.staff?.role?.role_name;

    // ၄။ Token အသစ်ပြန်ထုတ်ပေးခြင်း
    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.staff.company.id,
      staffName,
      role,
    );

    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async restoreCredential(email: string): Promise<Credential> {
    const credentialRepo = this.dataSource.getRepository(Credential);

    const existing = await credentialRepo.findOne({
      where: { email },
      withDeleted: true,
    });

    if (existing) {
      if ('deletedAt' in existing) {
        (existing as Credential & { deletedAt?: Date | null }).deletedAt = null;
        return await credentialRepo.save(existing);
      }
      return existing;
    }

    const hashedPassword = await bcrypt.hash('123456', 10);
    const newCredential = credentialRepo.create({
      email,
      password: hashedPassword,
    });

    return await credentialRepo.save(newCredential);
  }
}
