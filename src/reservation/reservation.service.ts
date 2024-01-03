import _ from 'lodash';
import { Repository } from 'typeorm';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateReservationsDto } from './dto/create-reservation.dto';
import { Reservation } from './entities/reservation.entity';
import { Seat } from '../seat/entities/seat.entity';
import { State } from '../seat/types/seat.state.type'
import { User } from '../user/entities/user.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
  ) {}
  
  // 예약에걸린 시트에 걸린 공연정보를 반환
  // 예약가격도 반환
  async getAllReservation(id) {
    return await this.reservationRepository
    .createQueryBuilder('reservation')
    .leftJoinAndSelect('reservation.seat', 'seat')
    .leftJoinAndSelect('seat.performance', 'performance')
    .where('reservation.user_id = :id', { id: id })
    .getMany()
  }

  // 예약에걸린 시트에 걸린 공연정보를 반환
  // 예약가격도 반환
  async findOne(id: number) {
    return await this.verifyReservationById(id);
  }

  async create(user_id: number, createReservationsDto: CreateReservationsDto[], sumOfPrice: number) {
    const reservations = createReservationsDto.map(createReservationDto => {
      const reservation = new Reservation();
      reservation.seat_id = createReservationDto.seat_id;
      reservation.user_id = user_id;
      reservation.reservation_name = createReservationDto.reservation_name;
      reservation.payment_amount = createReservationDto.payment_amount;
      return reservation
    });

    // 예약 저장
    await this.reservationRepository.save(reservations);
  
    // 좌석 상태 변경
    for(const value of createReservationsDto) {
      const seat = await this.seatRepository.findOne({
        where: {
          id: value.seat_id,
        },
      });
      seat.state = State.SoldOut;
      await this.seatRepository.save(seat);
    }

    // 유저 포인트 차감
    const user = await this.userRepository.findOne({
      where: {
        id: user_id,
      },
    });
    user.point -= sumOfPrice;
    await this.userRepository.save(user)
  }

  async delete(user_id: number, id: number) {
    const reservation = await this.verifyReservationById(id);
    if(reservation.user_id != user_id) {
      throw new BadRequestException('삭제 권한이없습니다. 예약자가 아닙니다.');
    }
    // 좌석 상태 변경
    const seat = await this.seatRepository.findOne({
      where: {
        id: reservation.seat_id,
      },
    });
    seat.state = State.ForSale;
    await this.seatRepository.save(seat);

    // 유저 포인트 갱신
    const user = await this.userRepository.findOne({
      where: {
        id: user_id,
      },
    });
    user.point += reservation.payment_amount;
    await this.userRepository.save(user)

    // 예약 삭제
    await this.reservationRepository.delete({ id });
  }

  private async verifyReservationById(id: number) {
    const reservation = await this.reservationRepository
    .createQueryBuilder('reservation')
    .leftJoinAndSelect('reservation.seat', 'seat')
    .leftJoinAndSelect('seat.performance', 'performance')
    .where('reservation.id = :id', { id: id })
    .getOne()
    if (_.isNil(reservation)) {
      throw new NotFoundException('존재하지 않는 예약입니다.');
    }

    return reservation;
  }
}