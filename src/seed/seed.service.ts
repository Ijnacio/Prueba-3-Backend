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
    return { message: 'SEED EJECUTADO: Tienda Adoptapet cargada con 20 productos y exóticos 🦎🐹' };
  }

  async limpiarBaseDeDatos() {
    this.logger.warn('🧹 Limpiando base de datos...');
    try {
      await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 0');
      await this.detalleRepo.query('TRUNCATE TABLE detalle_boletas');
      await this.boletaRepo.query('TRUNCATE TABLE boletas');
      await this.productoRepo.query('TRUNCATE TABLE productos');
      await this.categoriaRepo.query('TRUNCATE TABLE categorias');
      await this.userRepo.query('TRUNCATE TABLE users');
      await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
      this.logger.log('Base de datos vaciada');
    } catch (error) {
      await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
      throw error;
    }
  }

  async crearUsuarios() {
    const passwordAdmin = await bcryptjs.hash('admin123', 10);
    const passwordVendedor = await bcryptjs.hash('vendedor123', 10);

    await this.userRepo.save({ name: 'Admin Adoptapet', rut: '1-9', password: passwordAdmin, rol: UserRole.ADMIN });
    await this.userRepo.save({ name: 'Juan Cajero', rut: '2-7', password: passwordVendedor, rol: UserRole.VENDEDOR });
    this.logger.log('Usuarios creados');
  }

  async crearCategoriasYProductos() {
    const categoriasMap = {};
    
    const categoriasData = [
      { id: 'perros', nombre: 'Perros', desc: 'Todo para canes' },
      { id: 'gatos', nombre: 'Gatos', desc: 'Mundo felino' },
      { id: 'exoticos', nombre: 'Exóticos y Pequeños', desc: 'Reptiles, Roedores y Peces' },
      { id: 'salud', nombre: 'Farmacia', desc: 'Cuidado y salud' },
      { id: 'animales', nombre: 'Venta de Animales', desc: 'Adopción y venta de mascotas' },
    ];

    for (const cat of categoriasData) {
      const nuevaCat = await this.categoriaRepo.save({ nombre: cat.nombre, descripcion: cat.desc });
      categoriasMap[cat.id] = nuevaCat;
    }

    // LISTA DE 20 PRODUCTOS (Precios en Pesos Chilenos)
    const productos = [
      // --- PERROS (6) ---
      { category: 'perros', name: 'Saco DogChow 15kg', price: 35990, stock: 20, image: '/public/saco_perro.png' },
      { category: 'perros', name: 'Correa Retráctil', price: 8990, stock: 15, image: '/public/correa.png' },
      { category: 'perros', name: 'Cama Acolchada L', price: 24990, stock: 8, image: '/public/cama_perro.png' },
      { category: 'perros', name: 'Snack Huesito', price: 1490, stock: 100, image: '/public/hueso.png' },
      { category: 'perros', name: 'Juguete Mordedor', price: 3990, stock: 30, image: '/public/mordedor.png' },
      { category: 'perros', name: 'Shampoo Perro Pelo Largo', price: 5990, stock: 20, image: '/public/shampoo_perro.png' },

      // --- GATOS (6) ---
      { category: 'gatos', name: 'Saco CatChow 8kg', price: 28990, stock: 15, image: '/public/saco_gato.png' },
      { category: 'gatos', name: 'Arena Sanitaria 10kg', price: 7490, stock: 40, image: '/public/arena.png' },
      { category: 'gatos', name: 'Rascador Torre', price: 19990, stock: 5, image: '/public/rascador.png' },
      { category: 'gatos', name: 'Whiskas Sobrecito', price: 790, stock: 200, image: '/public/sobre_gato.png' },
      { category: 'gatos', name: 'Collar con Cascabel', price: 2490, stock: 50, image: '/public/collar_gato.png' },
      { category: 'gatos', name: 'Juguete Caña Pluma', price: 3490, stock: 35, image: '/public/pluma.png' },

      // --- EXÓTICOS (5) ---
      { category: 'exoticos', name: 'Mix Semillas Hámster', price: 4490, stock: 25, image: '/public/comida_hamster.png' },
      { category: 'exoticos', name: 'Heno para Cuy', price: 5490, stock: 20, image: '/public/heno.png' },
      { category: 'exoticos', name: 'Comida Tortuga', price: 3990, stock: 30, image: '/public/comida_tortuga.png' },
      { category: 'exoticos', name: 'Lámpara Calor Reptil', price: 15990, stock: 10, image: '/public/lampara_reptil.png' },
      { category: 'exoticos', name: 'Sustrato de Coco', price: 6990, stock: 15, image: '/public/sustrato.png' },

      // --- SALUD (3) ---
      { category: 'salud', name: 'Pipeta Antipulgas', price: 12990, stock: 30, image: '/public/pipeta.png' },
      { category: 'salud', name: 'Vitaminas Pelaje', price: 16990, stock: 12, image: '/public/vitaminas.png' },
      { category: 'salud', name: 'Cepillo Dental', price: 4490, stock: 25, image: '/public/cepillo.png' },

      // --- VENTA DE ANIMALES (10) ---
      { category: 'animales', name: 'Hámster Dorado "Bolita"', price: 8990, stock: 5, image: '/public/hamster.png' },
      { category: 'animales', name: 'Conejo Enano "Copito"', price: 35990, stock: 3, image: '/public/conejo.png' },
      { category: 'animales', name: 'Loro Australiano "Piolín"', price: 89990, stock: 2, image: '/public/loro.png' },
      { category: 'animales', name: 'Tortuga Terrestre "Speedy"', price: 45990, stock: 4, image: '/public/tortuga.png' },
      { category: 'animales', name: 'Gecko Leopardo "Rex"', price: 65990, stock: 2, image: '/public/gecko.png' },
      { category: 'animales', name: 'Pez Betta "Azulito"', price: 4990, stock: 15, image: '/public/betta.png' },
      { category: 'animales', name: 'Canario "Pichón"', price: 29990, stock: 6, image: '/public/canario.png' },
      { category: 'animales', name: 'Cobayo "Peluchín"', price: 19990, stock: 4, image: '/public/cobayo.png' },
      { category: 'animales', name: 'Chinchilla "Grisito"', price: 125990, stock: 1, image: '/public/chinchilla.png' },
      { category: 'animales', name: 'Erizo Pigmeo Africano "Pincho"', price: 159990, stock: 1, image: '/public/erizo.png' },
      { category: 'animales', name: 'Pitón Bola "Serpentina"', price: 249990, stock: 1, image: '/public/piton.png' },
      { category: 'animales', name: 'León Cachorro "Simba"', price: 8999990, stock: 1, image: '/public/leon.png' },
      { category: 'animales', name: 'Elefante Asiático "Dumbo"', price: 15999990, stock: 1, image: '/public/elefante.png' },
      { category: 'animales', name: 'Jaguar "Manchitas"', price: 12999990, stock: 1, image: '/public/jaguar.png' },
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
    this.logger.log('✅ Inventario de cargado (20 Productos)');
  }

  async crearVentasHistoricas() {
    this.logger.log('📊 Generando historial de ventas...');
    
    const vendedor = await this.userRepo.findOneBy({ rut: '2-7' });
    const productos = await this.productoRepo.find();

    if (!vendedor || productos.length === 0) return;

    const diasAtras = [3, 3, 2, 2, 1, 1, 0, 0, 0];

    for (const dias of diasAtras) {
      const fechaVenta = new Date();
      fechaVenta.setDate(fechaVenta.getDate() - dias);
      fechaVenta.setHours(10 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 59));

      const producto = productos[Math.floor(Math.random() * productos.length)];
      const cantidad = Math.floor(Math.random() * 2) + 1;
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
        montoEntregado: medioPago === MedioPago.EFECTIVO ? total + 2000 : 0, 
        vuelto: medioPago === MedioPago.EFECTIVO ? 2000 : 0,
        createdAt: fechaVenta
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
    this.logger.log(`✅ Historial generado: ${diasAtras.length} ventas simuladas.`);
  }
}