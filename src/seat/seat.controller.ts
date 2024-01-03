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
@Controller('seat')
export class SeatController {
  constructor(private readonly seatService: SeatService) {}

  @Get(':seatId')
  async findOne(@Param('seatId') id: number) {
    return await this.seatService.findOne(id);
  }

  @Roles(Role.Admin)
  @Post('csv')
  @UseInterceptors(FileInterceptor('file'))
  async createByCsv(@UploadedFile() file: Express.Multer.File) {
    await this.seatService.createByCsv(file);
  }

  @Roles(Role.Admin)
  @Post()
  async creatByOne(@Body() updateSeatDto: UpdateSeatDto, @Param('performance_id') performanceId: number) {
    return await this.seatService.createByOne(performanceId, updateSeatDto.number, updateSeatDto.grade, updateSeatDto.price);
  }

  @Roles(Role.Admin)
  @Put(':seatId')
  async update(@Param('seatId') id: number, @Body() updateSeatDto: UpdateSeatDto) {
    await this.seatService.update(id, updateSeatDto);
  }

  @Roles(Role.Admin)
  @Delete(':seatId')
  async delete(@Param('seatId') id: number) {
    await this.seatService.delete(id);
  }
}