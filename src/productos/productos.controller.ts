import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Productos (Inventario)')
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  // 1. LISTAR (Público o para todos los roles)
  @Get()
  @ApiOperation({ summary: 'Listar todos los productos' })
  findAll() {
    return this.productosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalle de un producto' })
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(+id);
  }

  // 2. CREAR (SOLO ADMIN) - ¡Aquí ponemos el freno!
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crear nuevo producto (Solo Admin)' })
  create(@Body() createProductoDto: CreateProductoDto, @Request() req) {
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('Solo el Administrador puede crear productos');
    }
    return this.productosService.create(createProductoDto);
  }

  // 3. EDITAR (SOLO ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Editar precio/stock (Solo Admin)' })
  update(@Param('id') id: string, @Body() updateProductoDto: UpdateProductoDto, @Request() req) {
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('Solo el Administrador puede editar productos');
    }
    return this.productosService.update(+id, updateProductoDto);
  }

  // 4. ELIMINAR (SOLO ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un producto (Solo Admin)' })
  remove(@Param('id') id: string, @Request() req) {
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('Solo el Administrador puede borrar productos');
    }
    return this.productosService.remove(+id);
  }
}