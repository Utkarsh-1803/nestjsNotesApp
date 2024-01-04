import { AuthService } from './auth.service';
import { Get, Body, Controller, Post } from '@nestjs/common';
import { AllowAnonymous } from '../shared';
import {
  UserSignUp,
  UserLogin,
} from './authDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get()
  getHello(): string {
    return this.authService.getHello();
  }

  @AllowAnonymous()
  @Post('login')
  async login(@Body() body: UserLogin) {
    return await this.authService.login(body);
  }

  @AllowAnonymous()
  @Post('signup')
  async signup(@Body() body: UserSignUp) {
    return await this.authService.signup(body);
  }

}