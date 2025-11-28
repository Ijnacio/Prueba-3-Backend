import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UnauthorizedException, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { FiltroVentasDto } from './dto/filtro-ventas.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Ventas (Caja)')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar venta (Cualquier rol)' })
  @ApiResponse({ status: 201, description: 'Venta exitosa' })
  create(@Body() createVentaDto: CreateVentaDto, @Request() req) {
    // Pasamos el usuario completo (req.user) que tiene {id, rol, rut}
    return this.ventasService.crearVenta(createVentaDto, req.user);
  }

  @Get('mis-ventas')
  @ApiOperation({ summary: 'Mis ventas (Vendedor)' })
  getMySales(@Request() req) {
    return this.ventasService.findMySales(req.user.id);
  }

  @Get('mi-caja')
  @ApiOperation({ summary: 'Mi cuadratura diaria (Vendedor)' })
  getMyCaja(@Request() req) {
    return this.ventasService.resumenPersonal(req.user.id);
  }

  @Get('historial-admin')
  @ApiOperation({ summary: 'Historial global con filtros (Solo Admin)' })
  getHistorialAdmin(@Query() filtros: FiltroVentasDto, @Request() req) {
    if (req.user.rol !== 'admin') throw new UnauthorizedException('Solo Admin');
    return this.ventasService.findAllAdmin(filtros);
  }

  @Get('caja-admin')
  @ApiOperation({ summary: 'Caja global del día (Solo Admin)' })
  getCajaAdmin(@Request() req) {
    if (req.user.rol !== 'admin') throw new UnauthorizedException('Solo Admin');
    return this.ventasService.resumenDelDia();
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar venta/corregir (Solo Admin)' })
  update(@Param('id') id: string, @Body() updateVentaDto: UpdateVentaDto, @Request() req) {
    if (req.user.rol !== 'admin') throw new UnauthorizedException('Solo Admin');
    return this.ventasService.update(+id, updateVentaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar/Devolución (Solo Admin)' })
  delete(@Param('id') id: string, @Request() req) {
    if (req.user.rol !== 'admin') throw new UnauthorizedException('Solo Admin');
    return this.ventasService.remove(+id);
  }
}