import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/user/types/userRole.type';

import {
  Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseGuards, UseInterceptors
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

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return await this.performanceService.findOne(id);
  }

  @Roles(Role.Admin)
  @Post()
  @UseInterceptors(FileInterceptor('file'))

  async create(@UploadedFile() file: Express.Multer.File, @Body() updatePerformanceDto: UpdatePerformanceDto) {
    if(updatePerformanceDto) {
      return await this.performanceService.createByOne(updatePerformanceDto.name, updatePerformanceDto.description);
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