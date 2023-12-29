import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/user/types/userRole.type';

import {
  Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UpdatePerformanceDto } from './dto/update-performance.dto';
import { PerformanceService } from './performance.service';

@UseGuards(RolesGuard)
@Controller('performance')
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Get()
  async findAll() {
    return await this.performanceService.findAll();
  }

  @Get('id/:id')
  async findOne(@Param('id') id: number) {
    return await this.performanceService.findOne(id);
  }

  @Get('search')
  async findBySearch(@Query('name') name: string, @Query('category') category: string) {
    return await this.performanceService.findBySearch(name, category);
  }

  @Roles(Role.Admin)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(@UploadedFile() file: Express.Multer.File, @Body() updatePerformanceDto: UpdatePerformanceDto) {
    if(updatePerformanceDto) {
      const dateTime = new Date(updatePerformanceDto.dateTime)
      return await this.performanceService.createByOne(updatePerformanceDto.name, updatePerformanceDto.description, dateTime, updatePerformanceDto.location, updatePerformanceDto.poster, updatePerformanceDto.category);
    } else {
      await this.performanceService.createByCsv(file);
    }
  }

  @Roles(Role.Admin)
  @Put(':id')
  async update(@Param('id') id: number, @Body() updatePerformanceDto: UpdatePerformanceDto) {
    await this.performanceService.update(id, updatePerformanceDto);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  async delete(@Param('id') id: number) {
    await this.performanceService.delete(id);
  }
}