import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Reservation } from './entities/reservation.entity';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';

import { Seat } from '../seat/entities/seat.entity';
import { SeatService } from '../seat/seat.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, Seat])],
  providers: [ReservationService, SeatService],
  controllers: [ReservationController]
})
export class ReservationModule {}
