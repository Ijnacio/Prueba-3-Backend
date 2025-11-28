import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../common/abstract.entity';
import { UserRole } from '../../common/enums/roles.enum';
import { Boleta } from '../../ventas/entities/boleta.entity';

@Entity('users')
export class User extends AbstractEntity {
  @Column()
  name: string;

  // NUEVO CAMPO RUT (Único para que no se repita)
  @Column({ unique: true })
  rut: string; 

  @Column({ select: false })
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.VENDEDOR })
  rol: UserRole;

  @OneToMany(() => Boleta, (boleta) => boleta.vendedor)
  ventas: Boleta[];
}