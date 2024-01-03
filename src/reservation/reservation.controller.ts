import {
  Body, Controller, Delete, Get, Param, Post, Put, UseGuards, BadRequestException
} from '@nestjs/common';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from '../user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { CreateReservationsDto } from './dto/create-reservation.dto';
import { ReservationService } from './reservation.service';
import { SeatService } from '../seat/seat.service';
import { State } from '../seat/types/seat.state.type';

@Controller('reservation')
@UseGuards(AuthGuard('jwt'))
export class ReservationController {
  constructor(private readonly reservationService: ReservationService,
    private readonly seatService: SeatService,
    ) {}

  @Get()
  async getAllReservation(@UserInfo() user: User) {
    return await this.reservationService.getAllReservation(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.reservationService.findOne(id);
  }

  @Post()
  async create(@UserInfo() user: User, @Body() createReservationsDtos: CreateReservationsDto[]) {
    // 한사람이 한번에 여러개 예약을 할 수 있어야 함
    // 예약된 좌석의 status가 for_sale이 아니면 불가능
    let sumOfPrice = 0
    // 좌석 예약여부 확인
    for(const value of createReservationsDtos) {
      const seat = await this.seatService.findOne(value.seat_id);
      if(seat[0].state !== State.ForSale) {
        throw new BadRequestException('이미 예약된 좌석입니다.');
      }
      // 하는김에 총금액도 합산
      sumOfPrice += value.payment_amount;
    }
    // 포인트 모잘라유? 체크
    if(user.point<=sumOfPrice) {
      throw new BadRequestException('포인트가 모자랍니다.');
    }
    return await this.reservationService.create(user.id, createReservationsDtos, sumOfPrice);
  }

  @Delete(':id')
  async delete(@UserInfo() user: User, @Param('id') id: number) {
    await this.reservationService.delete(user.id, id);
  }
}
