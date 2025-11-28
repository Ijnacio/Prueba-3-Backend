// src/common/abstract.entity.ts
import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date; // Se llena sola cuando creas algo

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date; // Se actualiza sola cuando editas algo
}