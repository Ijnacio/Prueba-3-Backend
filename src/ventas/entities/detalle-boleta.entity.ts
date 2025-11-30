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
  subtotal: number;

  @ManyToOne(() => Boleta, (boleta) => boleta.detalles, { onDelete: 'CASCADE' })
  boleta: Boleta;

  @ManyToOne(() => Producto, { onDelete: 'SET NULL', nullable: true })
  producto: Producto;
}