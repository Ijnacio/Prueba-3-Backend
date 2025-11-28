import { Controller, Get, Post, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Usuarios (Gestión de Personal)')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. CREAR (AHORA PROTEGIDO: Solo Admin)
  @ApiBearerAuth() // <--- Candadito activado
  @UseGuards(AuthGuard) // <--- Guardia activado
  @Post()
  @ApiOperation({ summary: 'Crear nuevo empleado (Solo Admin)' })
  create(@Body() createUserDto: CreateUserDto, @Request() req) {
    // Validación de Rol ACTIVA
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('Solo el Administrador puede crear empleados');
    }
    return this.usersService.create(createUserDto);
  }

  // 2. LISTAR EMPLEADOS (Solo Admin)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({ summary: 'Ver lista de personal (Solo Admin)' })
  findAll(@Request() req) {
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('Acceso denegado');
    }
    return this.usersService.findAll();
  }
}