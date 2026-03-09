import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Credential } from './entities/credential.entity';
import { Staff } from '../staff/entities/staff.entity';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class CredentialsService {
  constructor(
    private dataSource: DataSource,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Hash the password before saving
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const credential = await this.dataSource.getRepository(Credential).save({
      email: dto.email,
      password: hashedPassword,
    });

    return credential;

    // 2. Use a transaction to create both records
    // return await this.dataSource.transaction(async (manager) => {
    //   try {
    //     // Create the Login Identity
    //     const credential = await manager.save(Credential, {
    //       email: dto.email,
    //       password: hashedPassword,
    //     });

    //     // Create the Staff Profile linked to the Credential and Company
    //     await manager.save(Staff, {
    //       staffName: dto.staffName,
    //       phone: dto.phone,
    //       credential: { id: credential.id },
    //       company: { id: dto.companyId },
    //     });

    //     return { message: 'Registration successful' };
    //   } catch (error) {
    //     if (error.code === '23505') throw new ConflictException('Email already exists');
    //     throw error;
    //   }
    // });
  }

  async updateCredential(id: string, email?: string, password?: string) {
    const credentialRepo = this.dataSource.getRepository(Credential);

    const credential = await credentialRepo.findOne({
      where: { id },
    });

    if (!credential) {
      throw new UnauthorizedException('Credential not found');
    }

    if (email) {
      credential.email = email;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      credential.password = hashedPassword;
    }

    return credentialRepo.save(credential);
  }

  async deleteCredential(id: string) {
    return this.dataSource.getRepository(Credential).delete(id);
  }

  async login(dto: LoginDto) {
    const user = await this.dataSource.getRepository(Credential).findOne({
      where: { email: dto.email },
      relations: ['staff', 'staff.company'],
      select: ['id', 'email', 'password', 'status'],
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 1. Generate Access and Refresh Tokens
    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.staff.company.id,
    );

    // 2. Save the Refresh Token to the database
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return {
      message: 'Login successful',
      ...tokens,
    };
  }

  async getTokens(userId: string, email: string, companyId: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, companyId },
        { secret: 'AT_SECRET', expiresIn: '15m' }, // Use env variables in production
      ),
      this.jwtService.signAsync(
        { sub: userId, email, companyId },
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
}