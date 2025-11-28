import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { Boleta } from './entities/boleta.entity';
import { DetalleBoleta } from './entities/detalle-boleta.entity'; 
import { Producto } from '../productos/entities/producto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Boleta, DetalleBoleta, Producto]), 
  ],
  controllers: [VentasController],
  providers: [VentasService],
})
export class VentasModule {}