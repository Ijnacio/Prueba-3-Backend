import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Productos (Inventario)')
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  // 1. LISTAR
  @Get()
  @ApiOperation({ summary: 'Listar todos los productos' })
  @ApiResponse({ status: 200, description: 'Devuelve la lista completa de productos.' })
  findAll() {
    return this.productosService.findAll();
  }

  // 2. VER DETALLE
  @Get(':id')
  @ApiOperation({ summary: 'Ver detalle de un producto' })
  @ApiResponse({ status: 200, description: 'Devuelve el producto solicitado.' })
  @ApiResponse({ status: 404, description: 'Error: Producto no encontrado.' })  
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(+id);
  }

  // 3. CREAR (SOLO ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crear nuevo producto (Solo Admin)' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente.' }) 
  @ApiResponse({ status: 403, description: 'Prohibido: Solo el Administrador puede crear.' }) 
  create(@Body() createProductoDto: CreateProductoDto, @Request() req) {
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('Solo el Administrador puede crear productos');
    }
    return this.productosService.create(createProductoDto);
  }

  // 4. EDITAR (SOLO ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Editar precio/stock (Solo Admin)' })
  @ApiResponse({ status: 200, description: 'Producto actualizado.' }) 
  @ApiResponse({ status: 403, description: 'Prohibido: Solo el Administrador puede editar.' }) 
  @ApiResponse({ status: 404, description: 'Error: Producto no encontrado.' }) 
  update(@Param('id') id: string, @Body() updateProductoDto: UpdateProductoDto, @Request() req) {
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('Solo el Administrador puede editar productos');
    }
    return this.productosService.update(+id, updateProductoDto);
  }

  // 5. ELIMINAR (SOLO ADMIN)
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un producto (Solo Admin)' })
  @ApiResponse({ status: 200, description: 'Producto eliminado.' }) 
  @ApiResponse({ status: 403, description: 'Prohibido: Solo el Administrador puede borrar.' }) 
  remove(@Param('id') id: string, @Request() req) {
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('Solo el Administrador puede borrar productos');
    }
    return this.productosService.remove(+id);
  }
}