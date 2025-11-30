import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; 
import * as bcryptjs from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { Categoria } from '../categorias/entities/categoria.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Boleta } from '../ventas/entities/boleta.entity';
import { DetalleBoleta } from '../ventas/entities/detalle-boleta.entity';
import { UserRole } from '../common/enums/roles.enum';
import { MedioPago } from '../ventas/enum/medio-pago.enum';

@Injectable()
export class SeedService {
  private readonly logger = new Logger('SeedService');

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Categoria) private readonly categoriaRepo: Repository<Categoria>,
    @InjectRepository(Producto) private readonly productoRepo: Repository<Producto>,
    @InjectRepository(Boleta) private readonly boletaRepo: Repository<Boleta>,
    @InjectRepository(DetalleBoleta) private readonly detalleRepo: Repository<DetalleBoleta>,
    private dataSource: DataSource, 
  ) {}

  async ejecutarSeed() {
    await this.limpiarBaseDeDatos();
    await this.crearUsuarios();
    await this.crearCategoriasYProductos();
    await this.crearVentasHistoricas(); 
    return { message: 'SEED EJECUTADO: Base de datos ordenada cronológicamente 🧹✨' };
  }

  async limpiarBaseDeDatos() {
    this.logger.warn('🧹 Iniciando limpieza total...');
    try {
      await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
      await this.detalleRepo.query('TRUNCATE TABLE detalle_boletas');
      await this.boletaRepo.query('TRUNCATE TABLE boletas');
      await this.productoRepo.query('TRUNCATE TABLE productos');
      await this.categoriaRepo.query('TRUNCATE TABLE categorias');
      await this.userRepo.query('TRUNCATE TABLE users');
      await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
      this.logger.log('✅ Base de datos vaciada');
    } catch (error) {
      this.logger.error('Error al limpiar: ' + error.message);
      await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
      throw error; 
    }
  }

  async crearUsuarios() {
    const passwordAdmin = await bcryptjs.hash('admin123', 10);
    const passwordVendedor = await bcryptjs.hash('vendedor123', 10);

    await this.userRepo.save({ name: 'Administrador Supremo', rut: '1-9', password: passwordAdmin, rol: UserRole.ADMIN });
    await this.userRepo.save({ name: 'Juan Cajero', rut: '2-7', password: passwordVendedor, rol: UserRole.VENDEDOR });
    this.logger.log('✅ Usuarios creados');
  }

  async crearCategoriasYProductos() {
    const categoriasMap = {};
    const categoriasData = [
      { id: 'tortas-cuadradas', nombre: 'Tortas Cuadradas', desc: 'Cuadradas y deliciosas' },
      { id: 'tortas-circulares', nombre: 'Tortas Circulares', desc: 'Clásicas redondas' },
      { id: 'postres-individuales', nombre: 'Postres Individuales', desc: 'Para uno solo' },
      { id: 'sin-azucar', nombre: 'Sin Azúcar', desc: 'Sabor sin culpa' },
      { id: 'pasteleria-tradicional', nombre: 'Tradicional', desc: 'Recetas de la abuela' },
      { id: 'sin-gluten', nombre: 'Sin Gluten', desc: 'Apto para celíacos' },
      { id: 'vegana', nombre: 'Vegana', desc: '100% vegetal' },
      { id: 'tortas-especiales', nombre: 'Especiales', desc: 'Para eventos únicos' }
    ];

    for (const cat of categoriasData) {
      const nuevaCat = await this.categoriaRepo.save({ nombre: cat.nombre, descripcion: cat.desc });
      categoriasMap[cat.id] = nuevaCat;
    }

    const productos = [
      { category: 'tortas-cuadradas', name: 'Torta Cuadrada de Chocolate', price: 45000, stock: 50, image: '/public/TortaChocolate.png' },
      { category: 'tortas-cuadradas', name: 'Torta Cuadrada de Frutas', price: 50000, stock: 30, image: '/public/TortaFrutas.png' },
      { category: 'tortas-circulares', name: 'Torta Circular de Vainilla', price: 40000, stock: 40, image: '/public/TortaVainilla.png' },
      { category: 'tortas-circulares', name: 'Torta Circular de Manjar', price: 42000, stock: 60, image: '/public/TortaManjar.png' },
      { category: 'postres-individuales', name: 'Mousse de Chocolate', price: 5000, stock: 200, image: '/public/MousseChocolate.png' },
      { category: 'postres-individuales', name: 'Tiramisú Clásico', price: 5500, stock: 150, image: '/public/Tiramisu.png' },
      { category: 'sin-azucar', name: 'Torta Sin Azúcar de Naranja', price: 48000, stock: 20, image: '/public/TortaNaranja.png' },
      { category: 'sin-azucar', name: 'Cheesecake Sin Azúcar', price: 47000, stock: 30, image: '/public/Cheesecake.png' },
      { category: 'pasteleria-tradicional', name: 'Empanada de Manzana', price: 3000, stock: 300, image: '/public/Empanada.png' },
      { category: 'pasteleria-tradicional', name: 'Tarta de Santiago', price: 6000, stock: 80, image: '/public/TartaSantiago.png' },
      { category: 'sin-gluten', name: 'Brownie Sin Gluten', price: 4000, stock: 120, image: '/public/Brownie.png' },
      { category: 'sin-gluten', name: 'Pan Sin Gluten', price: 3500, stock: 100, image: '/public/Pan.png' },
      { category: 'vegana', name: 'Torta Vegana de Chocolate', price: 50000, stock: 20, image: '/public/VeganaChocolate.png' },
      { category: 'vegana', name: 'Galletas Veganas de Avena', price: 4500, stock: 250, image: '/public/GalletasAvena.png' },
      { category: 'tortas-especiales', name: 'Torta Especial de Cumpleaños', price: 55000, stock: 10, image: '/public/TortaCumpleaños.png' },
      { category: 'tortas-especiales', name: 'Torta Especial de Boda', price: 60000, stock: 10, image: '/public/TortaBoda.png' }
    ];

    for (const p of productos) {
      await this.productoRepo.save({
        nombre: p.name,
        precio: p.price,
        stock: p.stock,
        fotoUrl: p.image,
        categoria: categoriasMap[p.category],
      });
    }
    this.logger.log('✅ Productos creados');
  }

  async crearVentasHistoricas() {
    this.logger.log('⏳ Creando ventas históricas...');
    const vendedor = await this.userRepo.findOneBy({ rut: '2-7' });
    const productos = await this.productoRepo.find();

    if (!vendedor || productos.length === 0) return;

    // --- CORRECCIÓN DE ORDEN ---
    // Ordenamos de mayor a menor (5 días atrás, 3 días atrás...)
    // Así la primera iteración crea la venta más antigua (ID 1)
    const diasAtras = [5, 3, 2, 2, 1, 1, 0, 0].sort((a, b) => b - a); 

    for (const dias of diasAtras) {
      const fechaVenta = new Date();
      fechaVenta.setDate(fechaVenta.getDate() - dias);
      fechaVenta.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 59));

      const producto = productos[Math.floor(Math.random() * productos.length)];
      const cantidad = Math.floor(Math.random() * 3) + 1;
      const medioPago = Math.random() > 0.5 ? MedioPago.EFECTIVO : MedioPago.DEBITO;

      const total = producto.precio * cantidad;
      const neto = Math.round(total / 1.19);
      const iva = total - neto;

      const boleta = this.boletaRepo.create({
        vendedor: vendedor,
        medioPago: medioPago,
        total: total,
        neto: neto,
        iva: iva,
        montoEntregado: medioPago === MedioPago.EFECTIVO ? total + 1000 : 0,
        vuelto: medioPago === MedioPago.EFECTIVO ? 1000 : 0,
        createdAt: fechaVenta // La fecha antigua
      });

      const ventaGuardada = await this.boletaRepo.save(boleta);

      const detalle = this.detalleRepo.create({
        boleta: ventaGuardada,
        producto: producto,
        cantidad: cantidad,
        precioUnitario: producto.precio,
        subtotal: total
      });

      await this.detalleRepo.save(detalle);
    }
    this.logger.log(`✅ Historial generado: ${diasAtras.length} ventas ordenadas cronológicamente.`);
  }
}