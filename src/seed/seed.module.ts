import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller'; // <--- El import que fallaba
import { User } from '../users/entities/user.entity';
import { Categoria } from '../categorias/entities/categoria.entity';
import { Producto } from '../productos/entities/producto.entity';
import { Boleta } from '../ventas/entities/boleta.entity';
import { DetalleBoleta } from '../ventas/entities/detalle-boleta.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, 
      Categoria, 
      Producto, 
      Boleta, 
      DetalleBoleta
    ]),
  ],
  controllers: [SeedController], // <--- Debe estar aquí
  providers: [SeedService],
})
export class SeedModule {}