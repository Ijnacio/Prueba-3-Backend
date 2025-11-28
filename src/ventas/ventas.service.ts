import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Boleta } from './entities/boleta.entity';
import { Producto } from '../productos/entities/producto.entity';
import { DetalleBoleta } from './entities/detalle-boleta.entity';
import { User } from '../users/entities/user.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { FiltroVentasDto } from './dto/filtro-ventas.dto'; // Asegúrate de tener este DTO creado
import { MedioPago } from './enum/medio-pago.enum'; // Revisa la ruta de tu Enum

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Boleta) private boletaRepo: Repository<Boleta>,
    @InjectRepository(Producto) private productoRepo: Repository<Producto>,
    private dataSource: DataSource,
  ) {}

  // --- 1. CREAR VENTA (Transacción) ---
  async crearVenta(dto: CreateVentaDto, vendedor: User) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalVenta = 0;
      const detalles: DetalleBoleta[] = [];

      // A. Procesar productos
      for (const item of dto.items) {
        const producto = await this.productoRepo.findOneBy({ id: item.productoId });

        if (!producto) {
          throw new BadRequestException(`El producto con ID ${item.productoId} no existe`);
        }

        if (producto.stock < item.cantidad) {
          throw new BadRequestException(`Stock insuficiente para ${producto.nombre}. Quedan: ${producto.stock}`);
        }

        // Restar stock
        producto.stock -= item.cantidad;
        await queryRunner.manager.save(producto);

        // Crear detalle
        const detalle = new DetalleBoleta();
        detalle.producto = producto;
        detalle.cantidad = item.cantidad;
        detalle.precioUnitario = producto.precio;
        detalle.subtotal = item.cantidad * producto.precio;
        detalles.push(detalle);

        totalVenta += detalle.subtotal;
      }

      // B. Cálculos SII
      const neto = Math.round(totalVenta / 1.19);
      const iva = totalVenta - neto;

      // C. Vuelto
      let vuelto = 0;
      if (dto.medioPago === MedioPago.EFECTIVO) {
        if (!dto.montoEntregado || dto.montoEntregado < totalVenta) {
          throw new BadRequestException('Dinero entregado es insuficiente');
        }
        vuelto = dto.montoEntregado - totalVenta;
      }

      // D. Guardar Boleta
      const boleta = new Boleta();
      boleta.vendedor = vendedor;
      boleta.medioPago = dto.medioPago;
      boleta.total = totalVenta;
      boleta.neto = neto;
      boleta.iva = iva;
      boleta.montoEntregado = dto.montoEntregado || 0;
      boleta.vuelto = vuelto;
      boleta.detalles = detalles;

      const ventaGuardada = await queryRunner.manager.save(boleta);
      await queryRunner.commitTransaction();

      // Retornamos la boleta completa para que el frontend la pinte
      return ventaGuardada;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // --- 2. RESUMEN DE CAJA (Solo Admin) ---
  async resumenDelDia() {
    const hoyInicio = new Date();
    hoyInicio.setHours(0, 0, 0, 0);
    const hoyFin = new Date();
    hoyFin.setHours(23, 59, 59, 999);

    const ventasHoy = await this.boletaRepo.createQueryBuilder('boleta')
      .where('boleta.created_at BETWEEN :inicio AND :fin', { inicio: hoyInicio, fin: hoyFin })
      .getMany();

    const totalEfectivo = ventasHoy
      .filter(v => v.medioPago === MedioPago.EFECTIVO)
      .reduce((sum, v) => sum + v.total, 0);

    const totalDebito = ventasHoy
      .filter(v => v.medioPago === MedioPago.DEBITO)
      .reduce((sum, v) => sum + v.total, 0);

    const totalCredito = ventasHoy
      .filter(v => v.medioPago === MedioPago.CREDITO)
      .reduce((sum, v) => sum + v.total, 0);

    return {
      fecha: new Date(),
      cantidadVentas: ventasHoy.length,
      detalleCaja: {
        efectivoEnCaja: totalEfectivo,
        bancoDebito: totalDebito,
        bancoCredito: totalCredito,
        totalVendido: totalEfectivo + totalDebito + totalCredito
      }
    };
  }

  // --- 3. HISTORIAL CON FILTROS (Inteligente) ---
  async findAll(filtros: FiltroVentasDto, usuarioSolicitante: any) {
    const query = this.boletaRepo.createQueryBuilder('boleta')
      .leftJoinAndSelect('boleta.vendedor', 'vendedor')
      .leftJoinAndSelect('boleta.detalles', 'detalles')
      .leftJoinAndSelect('detalles.producto', 'producto')
      .orderBy('boleta.createdAt', 'DESC');

    // Seguridad: Si es vendedor, FORZAMOS que vea solo lo suyo
    if (usuarioSolicitante.rol !== 'admin') {
      query.andWhere('vendedor.id = :miId', { miId: usuarioSolicitante.id });
    } else {
      // Si es Admin y pide ver a alguien específico
      if (filtros.vendedorId) {
        query.andWhere('vendedor.id = :vendedorId', { vendedorId: filtros.vendedorId });
      }
    }

    // Filtro por Fecha (YYYY-MM-DD)
    if (filtros.fecha) {
      // Truco: Compara la parte de la fecha ignorando la hora
      // Nota: Esto depende de tu base de datos (MySQL usa DATE(), Postgres también)
      query.andWhere('DATE(boleta.created_at) = :fecha', { fecha: filtros.fecha });
    }

    return await query.getMany();
  }

  // --- 4. VER UNA (Detalle) ---
  async findOne(id: number) {
    const venta = await this.boletaRepo.findOne({
      where: { id },
      relations: ['vendedor', 'detalles', 'detalles.producto'],
    });
    if (!venta) throw new NotFoundException('Venta no encontrada');
    return venta;
  }
}