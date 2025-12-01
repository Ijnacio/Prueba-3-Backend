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
    const user = await this.usersService.findByRutWithPassword(rut);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { 
      sub: user.id, 
      rut: user.rut, 
      rol: user.rol,
      name: user.name 
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      access_token: token,
      rut: user.rut,
      rol: user.rol,
      name: user.name
    };
  }
}