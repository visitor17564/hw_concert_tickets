import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';

import { Seat } from '../../seat/entities/seat.entity'
import { User } from '../../user/entities/user.entity'

@Entity({
  name: 'reservations',
})
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Seat, (seat) => seat.reservation)
  @JoinColumn({ name: 'seat_id' })
  seat: Seat;

  @Column({ type: 'varchar', nullable: false })
  seat_id: number;

  @ManyToOne(() => User, (user) => user.reservation)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', nullable: false })
  user_id: number;

  @Column({ type: 'varchar', nullable: false })
  reservation_name: string

  @Column({ type: 'varchar', nullable: false })
  payment_amount: number;
}