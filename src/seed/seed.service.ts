import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; // <--- Importar DataSource
import * as bcryptjs from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { Categoria } from '../categorias/entities/categoria.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Boleta } from '../ventas/entities/boleta.entity';
import { DetalleBoleta } from '../ventas/entities/detalle-boleta.entity';
import { UserRole } from '../common/enums/roles.enum';

@Injectable()
export class SeedService {
  private readonly logger = new Logger('SeedService');

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Categoria) private readonly categoriaRepo: Repository<Categoria>,
    @InjectRepository(Producto) private readonly productoRepo: Repository<Producto>,
    @InjectRepository(Boleta) private readonly boletaRepo: Repository<Boleta>,
    @InjectRepository(DetalleBoleta) private readonly detalleRepo: Repository<DetalleBoleta>,
    private dataSource: DataSource, // <--- Inyectamos para casos extremos
  ) {}

  async ejecutarSeed() {
    await this.limpiarBaseDeDatos();
    await this.crearUsuarios();
    await this.crearCategoriasYProductos();
    return { message: 'SEED EJECUTADO: Base de datos reiniciada y poblada 🧹✨' };
  }

  // --- CORRECCIÓN AQUÍ: Usamos QueryBuilder para saltar la protección ---
  async limpiarBaseDeDatos() {
    this.logger.warn('🧹 Iniciando limpieza total de la base de datos...');
    
    try {
      // Opción Nuclear: Desactivar revisión de llaves foráneas temporalmente
      // Esto evita cualquier error de "No se puede borrar porque está en uso"
      await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 0');

      // Borramos las tablas (Truncate es más rápido y resetea los IDs a 1)
      await this.detalleRepo.query('TRUNCATE TABLE detalle_boletas');
      await this.boletaRepo.query('TRUNCATE TABLE boletas');
      await this.productoRepo.query('TRUNCATE TABLE productos');
      await this.categoriaRepo.query('TRUNCATE TABLE categorias');
      await this.userRepo.query('TRUNCATE TABLE users');

      // Reactivar seguridad
      await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
      
      this.logger.log('✅ Base de datos vaciada y reiniciada a cero');
    } catch (error) {
      this.logger.error('Error al limpiar: ' + error.message);
      // Intentamos reactivar los checks por si acaso falló algo
      await this.dataSource.query('SET FOREIGN_KEY_CHECKS = 1');
      throw error; 
    }
  }

  async crearUsuarios() {
    const passwordAdmin = await bcryptjs.hash('admin123', 10);
    const passwordVendedor = await bcryptjs.hash('vendedor123', 10);

    // Admin
    await this.userRepo.save({
      name: 'Administrador Supremo',
      rut: '1-9',
      password: passwordAdmin,
      rol: UserRole.ADMIN,
    });

    // Vendedor
    await this.userRepo.save({
      name: 'Juan Cajero',
      rut: '2-7',
      password: passwordVendedor,
      rol: UserRole.VENDEDOR,
    });
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
    this.logger.log('✅ Categorías creadas');

    // Productos (Asegúrate de que las URLs coincidan con tus archivos en /public)
    const productos = [
      { category: 'tortas-cuadradas', name: 'Torta Cuadrada de Chocolate', price: 45000, stock: 5, image: '/public/TortaChocolate.png' },
      { category: 'tortas-cuadradas', name: 'Torta Cuadrada de Frutas', price: 50000, stock: 3, image: '/public/TortaFrutas.png' },
      { category: 'tortas-circulares', name: 'Torta Circular de Vainilla', price: 40000, stock: 4, image: '/public/TortaVainilla.png' },
      { category: 'tortas-circulares', name: 'Torta Circular de Manjar', price: 42000, stock: 6, image: '/public/TortaManjar.png' },
      { category: 'postres-individuales', name: 'Mousse de Chocolate', price: 5000, stock: 20, image: '/public/MousseChocolate.png' },
      { category: 'postres-individuales', name: 'Tiramisú Clásico', price: 5500, stock: 15, image: '/public/Tiramisu.png' },
      { category: 'sin-azucar', name: 'Torta Sin Azúcar de Naranja', price: 48000, stock: 2, image: '/public/TortaNaranja.png' },
      { category: 'sin-azucar', name: 'Cheesecake Sin Azúcar', price: 47000, stock: 3, image: '/public/Cheesecake.png' },
      { category: 'pasteleria-tradicional', name: 'Empanada de Manzana', price: 3000, stock: 30, image: '/public/Empanada.png' },
      { category: 'pasteleria-tradicional', name: 'Tarta de Santiago', price: 6000, stock: 8, image: '/public/TartaSantiago.png' },
      { category: 'sin-gluten', name: 'Brownie Sin Gluten', price: 4000, stock: 12, image: '/public/Brownie.png' },
      { category: 'sin-gluten', name: 'Pan Sin Gluten', price: 3500, stock: 10, image: '/public/Pan.png' },
      { category: 'vegana', name: 'Torta Vegana de Chocolate', price: 50000, stock: 2, image: '/public/VeganaChocolate.png' },
      { category: 'vegana', name: 'Galletas Veganas de Avena', price: 4500, stock: 25, image: '/public/GalletasAvena.png' },
      { category: 'tortas-especiales', name: 'Torta Especial de Cumpleaños', price: 55000, stock: 1, image: '/public/TortaCumpleaños.png' },
      { category: 'tortas-especiales', name: 'Torta Especial de Boda', price: 60000, stock: 1, image: '/public/TortaBoda.png' }
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

    this.logger.log('✅ 16 Productos cargados exitosamente');
  }
}