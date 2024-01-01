import _ from 'lodash';
import { Repository, Like } from 'typeorm';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UpdateReservationsDto } from './dto/update-reservation.dto';
import { Reservation } from './entities/reservation.entity';

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
  ) {}
  
  // 예약에걸린 시트에 걸린 공연정보를 반환
  // 예약가격도 반환
  async getAllReservation(id): Promise<Reservation[]> {
    return await this.reservationRepository.find({
      where: { user_id: id },
      relations: ['seat', 'performance'],
    });
  }

  // 예약에걸린 시트에 걸린 공연정보를 반환
  // 예약가격도 반환
  async findOne(id: number) {
    return await this.verifyReservationById(id);
  }

  async create(user_id: number, updateReservationsDto: UpdateReservationsDto) {
    for (const [seat_id] of updateReservationsDto) {
      const reservation = await this.reservationRepository.findOne({
        where: { seat_id },
      });
  
      if (reservation) {
        throw new BadRequestException('해당 시트에는 예약이 존재합니다.');
      }
    }

    const createReservationDtos = updateReservationsDto.map((updateReservationDto) => ({
      user_id: user_id,
      seat_id: updateReservationDto.seat_id,
      reservation_name: updateReservationDto.reservation_name,
      payment_amount: updateReservationDto.payment_amount,
    }));

    await this.reservationRepository.save(createReservationDtos);
  }

  async update(user_id: number, id: number, updateReservationsDto: UpdateReservationsDto) {
    const reservation = await this.verifyReservationById(id);
    if(reservation.user_id != user_id) {
      throw new BadRequestException('수정 권한이없습니다. 예약자가 아닙니다.');
    }
    for (const [seat_id] of updateReservationsDto) {
      const reservation = await this.reservationRepository.findOne({
        where: { seat_id },
      });
  
      if (reservation) {
        throw new BadRequestException('이미 예약이 존재하는 시트입니다.');
      }
    }
    const updateReservationDtos = updateReservationsDto.map((updateReservationDto) => ({
      user_id: user_id,
      seat_id: updateReservationDto.seat_id,
      reservation_name: updateReservationDto.reservation_name,
      payment_amount: updateReservationDto.payment_amount,
    }));

    await this.reservationRepository.save(updateReservationDtos);
  }

  async delete(user_id: number, id: number) {
    const reservation = await this.verifyReservationById(id);
    if(reservation.user_id != user_id) {
      throw new BadRequestException('삭제 권한이없습니다. 예약자가 아닙니다.');
    }
    await this.reservationRepository.delete({ id });
  }

  private async verifyReservationById(id: number) {
    const seat = await this.reservationRepository.findOneBy({ id });
    if (_.isNil(seat)) {
      throw new NotFoundException('존재하지 않는 좌석입니다.');
    }

    return seat;
  }
}