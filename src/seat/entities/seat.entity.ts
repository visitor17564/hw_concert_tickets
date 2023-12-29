import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';

import { State } from '../types/seatState.type';
import { Performance } from '../../performance/entities/performance.entity'

@Entity({
  name: 'seats',
})
export class Seat {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Performance, (performance) => performance.seat)
  @JoinColumn({ name: 'performance_id' })
  performance: Performance;

  @Column({ type: 'varchar', nullable: false })
  performance_id: number;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'enum', enum: State, default: State.ForSale })
  state: State;

  @Column({ type: 'integer', nullable: false })
  price: number;
}