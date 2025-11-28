import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //@Post('register')
  //@HttpCode(HttpStatus.CREATED)
  //register(@Body() registerDto: RegisterDto) {
  //  return this.authService.register(registerDto);
  //}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard) // ¡Aquí usamos tu Guard!
  getProfile(@Request() req) {
    return req.user;
  }
}