import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, OneToMany } from 'typeorm';

import { State } from '../types/seat.state.type';
import { Grade } from '../types/seat.grade.type';
import { Performance } from '../../performance/entities/performance.entity'
import { Reservation } from '../../reservation/entities/reservation.entity'

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
  number: number;

  @Column({ type: 'enum', enum: State, default: State.ForSale })
  state: State;

  @Column({ type: 'enum', enum: Grade, nullable: false })
  grade: Grade;

  @Column({ type: 'integer', nullable: false })
  price: number;

  @OneToMany(() => Reservation, (reservation) => reservation.seat)
  reservation: Reservation[];
}