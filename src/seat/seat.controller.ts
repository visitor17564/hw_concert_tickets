import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/user/types/userRole.type';

import {
  Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UpdateSeatDto } from './dto/update-seat.dto';
import { SeatService } from './seat.service';

@UseGuards(RolesGuard)
@Controller('performance/:performance_id/seat')
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  @Get('id/:seatId')
  async findOne(@Param('seatId') id: number) {
    return await this.seatService.findOne(id);
  }

  @Get('search')
  async findBySearch(@Query('name') name: string) {
    return await this.seatService.findBySearch(name);
  }

  @Roles(Role.Admin)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(@UploadedFile() file: Express.Multer.File, @Body() updateSeatDto: UpdateSeatDto, @Param('performanceId') performanceId: number) {
    if(updateSeatDto) {
      return await this.seatService.createByOne(performanceId, updateSeatDto.name, updateSeatDto.price);
    } else {
      await this.seatService.createByCsv(file);
    }
  }

  @Roles(Role.Admin)
  @Put(':seatId')
  async update(@Param('performance_id') performance_id: number, @Param('seatId') id: number, @Body() updateSeatDto: UpdateSeatDto) {
    await this.seatService.update(performance_id, id, updateSeatDto);
  }

  @Roles(Role.Admin)
  @Delete(':seatId')
  async delete(@Param('performance_id') performance_id: number, @Param('seatId') id: number, ) {
    await this.seatService.delete(performance_id, id);
  }
}