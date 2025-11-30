import { Column, Entity, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../common/abstract.entity';
import { Categoria } from '../../categorias/entities/categoria.entity';

@Entity('productos')
export class Producto extends AbstractEntity {
  @Column()
  nombre: string;

  @Column('int')
  precio: number;

  @Column('int')
  stock: number; 

  @Column({ type: 'text', nullable: true })
  fotoUrl: string; // URL de la imagen (Web o Local)

  @ManyToOne(() => Categoria, (categoria) => categoria.productos, { onDelete: 'SET NULL', nullable: true })
  categoria: Categoria;
}