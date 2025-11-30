import { 
  Controller, Get, Post, Body, Patch, Param, Delete, 
  UseGuards, Request, UnauthorizedException 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/uptate-user.dto'; // Ojo con el nombre del archivo (uptate vs update)
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';

@ApiTags('Usuarios (Gestión de Personal)')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. CREAR
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crear nuevo empleado (Solo Admin)' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error de validación (RUT duplicado o datos faltantes).' })
  create(@Body() createUserDto: CreateUserDto, @Request() req) {
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('Solo el Administrador puede crear empleados');
    }
    return this.usersService.create(createUserDto);
  }

  // 2. LISTAR
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({ summary: 'Ver lista de personal activo (Solo Admin)' })
  findAll(@Request() req) {
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('Acceso denegado');
    }
    return this.usersService.findAll();
  }

  // 3. EDITAR (NUEVO)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Editar usuario / Cambiar contraseña (Solo Admin)' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('Solo el Administrador puede editar empleados');
    }
    // Convertimos el id de string a number con +id
    return this.usersService.update(+id, updateUserDto);
  }

  // 4. ELIMINAR (NUEVO)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar usuario y liberar RUT (Solo Admin)' })
  @ApiResponse({ status: 200, description: 'Usuario desactivado correctamente.' })
  remove(@Param('id') id: string, @Request() req) {
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('Solo el Administrador puede eliminar empleados');
    }
    return this.usersService.remove(+id);
  }
}