import { Controller, Get, Post, Body, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';



@ApiTags('Usuarios (Gestión de Personal)')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crear nuevo empleado (Solo Admin)' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error: El RUT ya existe.' })
  @ApiResponse({ status: 403, description: 'Prohibido: Solo Admin.' })
  create(@Body() createUserDto: CreateUserDto, @Request() req) {
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('Solo el Administrador puede crear empleados');
    }
    return this.usersService.create(createUserDto);
  }


  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({ summary: 'Ver lista de personal (Solo Admin)' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios del sistema.' })
  findAll(@Request() req) {
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('Acceso denegado');
    }
    return this.usersService.findAll();
  }
}