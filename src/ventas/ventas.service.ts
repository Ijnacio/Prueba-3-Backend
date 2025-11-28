import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Boleta } from './entities/boleta.entity';
import { Producto } from '../productos/entities/producto.entity';
import { DetalleBoleta } from './entities/detalle-boleta.entity';
import { User } from '../users/entities/user.entity';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { FiltroVentasDto } from './dto/filtro-ventas.dto';
import { MedioPago } from './enum/medio-pago.enum';
@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Boleta) private boletaRepo: Repository<Boleta>,
    @InjectRepository(Producto) private productoRepo: Repository<Producto>,
    private dataSource: DataSource,
  ) {}

  //1. CREAR VENTA
  async crearVenta(dto: CreateVentaDto, vendedorData: any) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const vendedorId = vendedorData.id || vendedorData.sub;
      if (!vendedorId) throw new BadRequestException('Error: Vendedor no identificado');

      let totalVenta = 0;
      const detalles: DetalleBoleta[] = [];

      //Procesar Productos
      for (const item of dto.items) {
        const producto = await this.productoRepo.findOneBy({ id: item.productoId });
        if (!producto) throw new BadRequestException(`Producto ID ${item.productoId} no existe`);
        
        if (producto.stock < item.cantidad) {
          throw new BadRequestException(`Sin stock: ${producto.nombre} (Quedan ${producto.stock})`);
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

      //Cálculos
      const neto = Math.round(totalVenta / 1.19);
      const iva = totalVenta - neto;
      
      let vuelto = 0;
      if (dto.medioPago === MedioPago.EFECTIVO) {
        if (!dto.montoEntregado || dto.montoEntregado < totalVenta) {
          throw new BadRequestException('Dinero insuficiente');
        }
        vuelto = dto.montoEntregado - totalVenta;
      }

      //Guardar
      const boleta = new Boleta();
      boleta.vendedor = { id: vendedorId } as User;
      boleta.medioPago = dto.medioPago;
      boleta.total = totalVenta;
      boleta.neto = neto;
      boleta.iva = iva;
      boleta.montoEntregado = dto.montoEntregado || 0;
      boleta.vuelto = vuelto;
      boleta.detalles = detalles;

      // Guardamos y obtenemos el ID generado
      const guardada = await queryRunner.manager.save(boleta);
      
      //Confirmamos la transacción ANTES de consultar
      await queryRunner.commitTransaction();

      //Consultar la boleta completa para mostrar datos bonitos (Nombre vendedor, productos)
      const boletaCompleta = await this.findOne(guardada.id);
      
      //Formato Ticket
      return this.transformarBoleta(boletaCompleta);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  //2. EDITAR VENTA
  async update(id: number, dto: UpdateVentaDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const venta = await this.findOne(id);

      // Si cambian los productos
      if (dto.items && dto.items.length > 0) {
        // Devolver stock antiguo
        for (const det of venta.detalles) {
          if (det.producto) {
            det.producto.stock += det.cantidad;
            await queryRunner.manager.save(det.producto);
          }
        }
        await queryRunner.manager.delete(DetalleBoleta, { boleta: { id: venta.id } });

        // Nuevos productos
        let nuevoTotal = 0;
        const nuevosDetalles: DetalleBoleta[] = [];

        for (const item of dto.items) {
          const prod = await this.productoRepo.findOneBy({ id: item.productoId });
          if (!prod) throw new BadRequestException(`Producto ${item.productoId} no existe`);
          if (prod.stock < item.cantidad) throw new BadRequestException(`Stock insuficiente: ${prod.nombre}`);

          prod.stock -= item.cantidad;
          await queryRunner.manager.save(prod);

          const det = new DetalleBoleta();
          det.producto = prod;
          det.cantidad = item.cantidad;
          det.precioUnitario = prod.precio;
          det.subtotal = item.cantidad * prod.precio;
          det.boleta = venta;
          nuevosDetalles.push(det);
          nuevoTotal += det.subtotal;
        }

        venta.total = nuevoTotal;
        venta.neto = Math.round(nuevoTotal / 1.19);
        venta.iva = nuevoTotal - venta.neto;
        venta.detalles = nuevosDetalles;
        await queryRunner.manager.save(nuevosDetalles);
      }

      // Actualizar pago
      if (dto.medioPago) venta.medioPago = dto.medioPago;
      if (dto.montoEntregado) venta.montoEntregado = dto.montoEntregado;

      if (venta.medioPago === MedioPago.EFECTIVO) {
         const monto = venta.montoEntregado || venta.total;
         if (monto < venta.total) throw new BadRequestException('Monto insuficiente');
         venta.vuelto = monto - venta.total;
      } else {
         venta.vuelto = 0;
      }

      await queryRunner.manager.save(venta);
      await queryRunner.commitTransaction();
      
      // Retornar versión limpia
      return this.transformarBoleta(await this.findOne(id));

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

 // 3. RESUMEN PERSONAL
  async resumenPersonal(vendedorId: number) {
    if (!vendedorId) throw new BadRequestException("ID de vendedor requerido");

    const hoyInicio = new Date();
    hoyInicio.setHours(0, 0, 0, 0);
    const hoyFin = new Date();
    hoyFin.setHours(23, 59, 59, 999);

    // Consulta segura con QueryBuilder
    const query = this.boletaRepo.createQueryBuilder('boleta')
      .leftJoinAndSelect('boleta.vendedor', 'vendedor')
      .where('vendedor.id = :id', { id: vendedorId })
      .andWhere('boleta.created_at >= :inicio', { inicio: hoyInicio })
      .andWhere('boleta.created_at <= :fin', { fin: hoyFin });

    const misVentasHoy = await query.getMany();

    // Desglose matemático
    const efectivo = misVentasHoy.filter(v => v.medioPago === 'EFECTIVO').reduce((sum, v) => sum + v.total, 0);
    const debito = misVentasHoy.filter(v => v.medioPago === 'DEBITO').reduce((sum, v) => sum + v.total, 0);
    const credito = misVentasHoy.filter(v => v.medioPago === 'CREDITO').reduce((sum, v) => sum + v.total, 0);

    return {
      vendedorId,
      fecha: new Date(),
      resumen: {
        totalEfectivo: efectivo,
        totalDebito: debito,   
        totalCredito: credito, 
        totalVendido: efectivo + debito + credito,
        cantidadVentas: misVentasHoy.length
      }
    };
  }

  //MIS VENTAS
  async findMySales(vendedorId: number) {
    if (!vendedorId) return [];
    const ventas = await this.boletaRepo.find({
      where: { vendedor: { id: vendedorId } },
      relations: ['detalles', 'detalles.producto', 'vendedor'],
      order: { createdAt: 'DESC' }
    });
    // Transformamos cada venta para que se vea limpia en la lista
    return ventas.map(v => this.transformarBoleta(v));
  }

  //HISTORIAL ADMIN
  async findAllAdmin(filtros: FiltroVentasDto) {
    const query = this.boletaRepo.createQueryBuilder('boleta')
      .leftJoinAndSelect('boleta.vendedor', 'vendedor')
      .leftJoinAndSelect('boleta.detalles', 'detalles')
      .leftJoinAndSelect('detalles.producto', 'producto')
      .orderBy('boleta.createdAt', 'DESC');

    if (filtros.vendedorId) {
      query.andWhere('vendedor.id = :vendedorId', { vendedorId: filtros.vendedorId });
    }
    if (filtros.fecha) {
      query.andWhere('DATE(boleta.created_at) = :fecha', { fecha: filtros.fecha });
    }

    const resultados = await query.getMany();
    return resultados.map(v => this.transformarBoleta(v));
  }

  //CAJA GLOBAL
  async resumenDelDia() {
    const hoyInicio = new Date();
    hoyInicio.setHours(0, 0, 0, 0);
    
    const ventasHoy = await this.boletaRepo.createQueryBuilder('boleta')
      .where('boleta.created_at >= :hoy', { hoy: hoyInicio })
      .getMany();

    const efectivo = ventasHoy.filter(v => v.medioPago === MedioPago.EFECTIVO).reduce((sum, v) => sum + v.total, 0);
    const debito = ventasHoy.filter(v => v.medioPago === MedioPago.DEBITO).reduce((sum, v) => sum + v.total, 0);
    const credito = ventasHoy.filter(v => v.medioPago === MedioPago.CREDITO).reduce((sum, v) => sum + v.total, 0);

    return {
        fecha: new Date(),
        detalleCaja: {
            efectivoEnCaja: efectivo,
            bancoDebito: debito,
            bancoCredito: credito,
            totalVendido: efectivo + debito + credito
        }
    };
  }

  //ELIMINAR
  async remove(id: number) {
    const venta = await this.findOne(id);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      for (const detalle of venta.detalles) {
        if (detalle.producto) {
          detalle.producto.stock += detalle.cantidad;
          await queryRunner.manager.save(detalle.producto);
        }
      }
      await queryRunner.manager.remove(venta);
      await queryRunner.commitTransaction();
      return { message: `Venta #${id} eliminada` };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: number) {
    const venta = await this.boletaRepo.findOne({
      where: { id },
      relations: ['vendedor', 'detalles', 'detalles.producto'],
    });
    if (!venta) throw new NotFoundException('Venta no encontrada');
    return venta;
  }

  
  private transformarBoleta(boleta: Boleta) {
    return {
      folio: boleta.id,
      fecha: boleta.createdAt, // Fecha de emisión
      
      // Datos del Vendedor
      vendedor: {
        nombre: boleta.vendedor?.name || 'Desconocido',
        rut: boleta.vendedor?.rut || 'S/N',
      },

      // Detalles de la Compra
      items: boleta.detalles.map(d => ({
        producto: d.producto?.nombre || 'Producto eliminado',
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario,
        subtotal: d.subtotal,
      })),

      // Totales Financieros
      resumen: {
        neto: boleta.neto,
        iva: boleta.iva,
        total: boleta.total,
        medioPago: boleta.medioPago,
        montoEntregado: boleta.montoEntregado,
        vuelto: boleta.vuelto,
      }
    };
  }
}