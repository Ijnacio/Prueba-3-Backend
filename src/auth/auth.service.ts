import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}


  async login({ rut, password }: LoginDto) { // Recibe RUT
    const user = await this.usersService.findOneByRut(rut);

    if (!user) {
      throw new UnauthorizedException('RUT no encontrado');
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const payload = { 
      sub: user.id, // ID del usuario
      rut: user.rut, // Guardamos el RUT en el token
      rol: user.rol // Guardamos el Rol (importante para permisos)
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      rut: user.rut,
      rol: user.rol
    };
  }
}