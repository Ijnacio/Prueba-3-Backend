import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../common/abstract.entity';
import { UserRole } from '../../common/enums/roles.enum';
import { Boleta } from '../../ventas/entities/boleta.entity';

@Entity('users')
export class User extends AbstractEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  rut: string;

  @Column() // Si usaste { select: false }, asegúrate de que tu auth service lo maneje
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.VENDEDOR })
  rol: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Boleta, (boleta) => boleta.vendedor)
  ventas: Boleta[];
}