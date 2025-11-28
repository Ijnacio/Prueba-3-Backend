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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'; // <--- Importamos Swagger
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';

@ApiTags('Auth') 
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // El registro está comentado/deshabilitado porque lo movimos a UsersController (Solo Admin)
  // @Post('register')
  // ...

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión (Obtener Token)' }) // <--- Título del botón
  @ApiResponse({ status: 200, description: 'Login exitoso. Retorna el access_token.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas (RUT o contraseña incorrecta).' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth() // <--- Indica que este endpoint necesita el candado (Token)
  @ApiOperation({ summary: 'Ver mi perfil (Requiere Token)' })
  @ApiResponse({ status: 200, description: 'Retorna los datos del usuario logueado.' })
  @ApiResponse({ status: 401, description: 'No autorizado (Token inválido o expirado).' })
  getProfile(@Request() req) {
    return req.user;
  }
}