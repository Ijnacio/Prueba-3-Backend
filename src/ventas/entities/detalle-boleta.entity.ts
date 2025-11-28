import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/abstract.entity';
import { Boleta } from './boleta.entity';
import { Producto } from '../../productos/entities/producto.entity';

@Entity('detalle_boletas')
export class DetalleBoleta extends AbstractEntity {
  @Column('int')
  cantidad: number;

  @Column('int')
  precioUnitario: number; 
  
  @Column('int')
  subtotal: number; // cantidad * precio

  @ManyToOne(() => Boleta, (boleta) => boleta.detalles)
  boleta: Boleta;

  @ManyToOne(() => Producto)
  producto: Producto;
}