import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../common/abstract.entity';
import { User } from '../../users/entities/user.entity';
import { DetalleBoleta } from './detalle-boleta.entity';
import { MedioPago } from '../enum/medio-pago.enum';

@Entity('boletas')
export class Boleta extends AbstractEntity {
  // --- DATOS FINANCIEROS (Calculados) ---
  @Column('int')
  total: number; // Neto + IVA

  @Column('int')
  neto: number;  // total / 1.19

  @Column('int')
  iva: number;   // total - neto

  // --- DATOS DE CAJA ---
  @Column({ type: 'enum', enum: MedioPago, default: MedioPago.EFECTIVO })
  medioPago: MedioPago;

  @Column('int', { nullable: true })
  montoEntregado: number; 

  @Column('int', { default: 0 })
  vuelto: number; 

  // --- TRAZABILIDAD ---
  @ManyToOne(() => User, (user) => user.ventas)
  vendedor: User;
  
  @OneToMany(() => DetalleBoleta, (detalle) => detalle.boleta, { cascade: true })
  detalles: DetalleBoleta[];
}