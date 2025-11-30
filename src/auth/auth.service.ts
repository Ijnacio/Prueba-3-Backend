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

  async login({ rut, password }: LoginDto) {
    // 1. Buscamos el usuario Y su contraseña (que normalmente está oculta)
    const user = await this.usersService.findByRutWithPassword(rut);

    // 2. Si no existe o está inactivo, error genérico por seguridad
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 3. Comparamos la contraseña plana con el hash de la BD
    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // 4. Creamos el payload del Token
    const payload = { 
      sub: user.id, 
      rut: user.rut, 
      rol: user.rol,
      name: user.name 
    };

    // 5. Firmamos el token
    const token = await this.jwtService.signAsync(payload);

    // 6. Retornamos todo lo que el Frontend necesita
    return {
      access_token: token,
      rut: user.rut,
      rol: user.rol,
      name: user.name
    };
  }
}