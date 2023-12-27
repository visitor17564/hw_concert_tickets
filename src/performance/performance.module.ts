import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Performance } from './entities/performance.entity';
import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';

@Module({
  imports: [TypeOrmModule.forFeature([Performance])],
  providers: [PerformanceService],
  controllers: [PerformanceController],
})
export class PerformanceModule {}