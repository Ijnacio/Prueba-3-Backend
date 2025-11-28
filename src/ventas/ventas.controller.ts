import { Controller, Get, Post, Body, UseGuards, Request, UnauthorizedException, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { VentasService } from './ventas.service';
import { CreateVentaDto } from './dto/create-venta.dto';
import { FiltroVentasDto } from './dto/filtro-ventas.dto'; // Asegúrate de tener este DTO
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('Ventas (Caja)')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  // 1. REGISTRAR VENTA
  @Post()
  @ApiOperation({ summary: 'Registrar una nueva venta (Admin o Vendedor)' })
  @ApiResponse({ status: 201, description: 'Venta exitosa. Retorna la boleta completa.' })
  @ApiResponse({ status: 400, description: 'Error: Stock insuficiente o pago insuficiente.' })
  create(@Body() createVentaDto: CreateVentaDto, @Request() req) {
    return this.ventasService.crearVenta(createVentaDto, req.user);
  }

  // 2. CAJA DIARIA (SOLO ADMIN)
  @Get('caja-diaria')
  @ApiOperation({ summary: 'Ver cuadratura de caja del día (Solo Admin)' })
  @ApiResponse({ status: 200, description: 'Resumen financiero del día.' })
  @ApiResponse({ status: 403, description: 'Prohibido: No eres Admin.' })
  obtenerResumen(@Request() req) {
    if (req.user.rol !== 'admin') {
      throw new UnauthorizedException('Solo el Administrador puede ver el total de la caja');
    }
    return this.ventasService.resumenDelDia();
  }

  // 3. HISTORIAL (CON FILTROS)
  @Get('historial')
  @ApiOperation({ summary: 'Ver historial de ventas (Filtros opcionales)' })
  @ApiResponse({ status: 200, description: 'Lista de ventas según permisos.' })
  async obtenerHistorial(@Query() filtros: FiltroVentasDto, @Request() req) {
    // El servicio se encarga de filtrar si es vendedor o admin
    return this.ventasService.findAll(filtros, req.user);
  }

  // 4. DETALLE DE UNA VENTA
  @Get(':id')
  @ApiOperation({ summary: 'Ver detalle de una venta específica' })
  async findOne(@Param('id') id: string, @Request() req) {
    const venta = await this.ventasService.findOne(+id);
    
    // Seguridad: Si es vendedor, verificar que la venta sea suya
    if (req.user.rol !== 'admin' && venta.vendedor.id !== req.user.id) {
      throw new UnauthorizedException('No puedes ver ventas de otros vendedores');
    }
    return venta;
  }
}