import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Seat } from "../../seat/entities/seat.entity";

@Entity({
  name: 'performance',
})
export class Performance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  name: string;

  @Column({ type: 'varchar', nullable: false })
  description: string;

  @Column({ type: 'date', nullable: false })
  dateTime: Date;

  @Column({ type: 'varchar', nullable: false })
  location: string;

  @Column({ type: 'varchar', nullable: true })
  poster: string;

  @Column({ type: 'varchar', nullable: true })
  category: string;

  @OneToMany(() => Seat, (seat) => seat.performance)
  seat: Seat[];
}