import {
  Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors
} from '@nestjs/common';
import { UserInfo } from 'src/utils/userInfo.decorator';
import { User } from '../user/entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { UpdateReservationsDto } from './dto/update-reservation.dto';
import { ReservationService } from './reservation.service';

@Controller('reservation')
@UseGuards(AuthGuard('jwt'))
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Get()
  async getAllReservation(@UserInfo() user: User) {
    return await this.reservationService.getAllReservation(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.reservationService.findOne(id);
  }

  @Post()
  async create(@UserInfo() user: User, @Body() updateReservationsDto: UpdateReservationsDto) {
    // 한사람이 한번에 여러개 예약을 할 수 있어야 함
    if(updateReservationsDto) {
      return await this.reservationService.create(user.id, updateReservationsDto);
    }
  }

  @Put(':id')
  async update(@UserInfo() user: User, @Param('id') id: number, @Body() updateReservationsDto: UpdateReservationsDto) {
    await this.reservationService.update(user.id, id, updateReservationsDto);
  }

  @Delete(':id')
  async delete(@UserInfo() user: User, @Param('id') id: number) {
    await this.reservationService.delete(user.id, id);
  }
}
