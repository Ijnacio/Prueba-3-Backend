import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Categorías')
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorías' })
  findAll() {
    return this.categoriasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalle de una categoría' })
  findOne(@Param('id') id: string) {
    return this.categoriasService.findOne(+id);
  }

  // 2. CREAR (SOLO ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crear categoría (Solo Admin)' })
  create(@Body() createCategoriaDto: CreateCategoriaDto, @Request() req) {
    // Validación Manual de Rol
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('No tienes permisos de Administrador');
    }
    return this.categoriasService.create(createCategoriaDto);
  }

  // 3. EDITAR
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Editar nombre categoría (Solo Admin)' })
  update(@Param('id') id: string, @Body() updateCategoriaDto: UpdateCategoriaDto, @Request() req) {
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('No tienes permisos de Administrador');
    }
    return this.categoriasService.update(+id, updateCategoriaDto);
  }

  // 4. ELIMINAR
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar categoría (Solo Admin)' })
  remove(@Param('id') id: string, @Request() req) {
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('No tienes permisos de Administrador');
    }
    return this.categoriasService.remove(+id);
  }
}