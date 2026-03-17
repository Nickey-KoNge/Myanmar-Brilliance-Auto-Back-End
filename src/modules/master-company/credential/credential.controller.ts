import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CredentialsService } from './credential.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('credentials')
export class CredentialsController {
  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.credentialsService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.credentialsService.login(loginDto);
  }

  // credential.controller.ts
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { refresh_token: string }) {
    // Token ကို decode လုပ်ပြီး User ID ကို ရယူခြင်း (သို့မဟုတ် logic တစ်ခုခုဖြင့် ပို့ပေးရန်)
    const decoded = this.jwtService.decode(body.refresh_token);
    const userId = decoded.sub;

    // argument ၂ ခုလုံး ထည့်ပေးလိုက်ပါ
    return this.credentialsService.refreshTokens(userId, body.refresh_token);
  }
}
