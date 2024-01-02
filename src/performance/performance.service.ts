import _ from 'lodash';
import { parse } from 'papaparse';
import { Repository, Like } from 'typeorm';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UpdatePerformanceDto } from './dto/update-performance.dto';
import { Performance } from './entities/performance.entity';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(Performance)
    private readonly performanceRepository: Repository<Performance>,
  ) {}

  async findAll(): Promise<Performance[]> {
    const performances = await this.performanceRepository.createQueryBuilder('performance')
        .leftJoinAndSelect('performance.seat', 'seat')
        .select(['performance.id', 'performance.name'])
        .addSelect('COUNT(seat.id)', 'total_seat_count')
        .addSelect(`SUM(CASE WHEN seat.state = 'for_sale' THEN 1 ELSE 0 END)`, 'available_seat_count')
        .groupBy('performance.id')
        .getRawMany();

    return performances;
  }

  async findOne(id: number) {
    return await this.verifyPerformanceById(id);
  }

  // name, category를 포함한 값을 검색하는 type-orm 쿼리문
  async findBySearch(name: string, category: string) {
    const performances = await this.performanceRepository.createQueryBuilder('performance')
    .leftJoinAndSelect('performance.seat', 'seat')
    .select(['performance.id', 'performance.name'])
    .where('performance.name LIKE :name', { name: `%${name}%` })
    .andWhere('performance.category LIKE :category', { category: `%${category}%` })
    .addSelect('COUNT(seat.id)', 'total_seat_count')
    .addSelect(`SUM(CASE WHEN seat.state = 'for_sale' THEN 1 ELSE 0 END)`, 'available_seat_count')
    .groupBy('performance.id')
    .getRawMany();

  return performances;
  }

  async createByOne(name: string, description: string, dateTime: Date, location: string, poster: string, category: string) {
    const performance = await this.performanceRepository.findOne({
      where: { name },
    });

    if (performance) {
      throw new BadRequestException('이미 존재하는 공연입니다.');
    }

    await this.performanceRepository.save({ name, description, dateTime, location, poster, category });
    return { name, description, dateTime, location, poster, category }; // 생성된 공연 정보를 반환합니다.
  }

  async createByCsv(file: Express.Multer.File) {
    if (!file.originalname.endsWith('.csv')) {
      throw new BadRequestException('CSV 파일만 업로드 가능합니다.');
    }

    const csvContent = file.buffer.toString();

    let parseResult;
    try {
      parseResult = parse(csvContent, {
        header: true,
        skipEmptyLines: true,
      });
    } catch (error) {
      throw new BadRequestException('CSV 파싱에 실패했습니다.');
    }

    const performancesData = parseResult.data as any[];

    for (const performanceData of performancesData) {
      if (_.isNil(performanceData.name) || _.isNil(performanceData.description) || _.isNil(performanceData.dateTime) || _.isNil(performanceData.location) || _.isNil(performanceData.poster) || _.isNil(performanceData.category)) {
        throw new BadRequestException(
          'CSV 파일이 양식에 적합하지 않습니다.',
        );
      }
      const dateTime = new Date(performanceData.dateTime)
      const performance = await this.performanceRepository.findOne({
        where: { name: performanceData.name, dateTime },
      });
      if (performance) {
        throw new BadRequestException('같은날짜, 시간에 같은이름의 공연이 존재합니다.');
      }
    }

    const createPerformanceDtos = performancesData.map((performanceData) => ({
      name: performanceData.name,
      description: performanceData.description,
      dateTime: new Date(performanceData.dateTime),
      location: performanceData.location,
      poster: performanceData.poster,
      keyword: performanceData.category,
    }));

    await this.performanceRepository.save(createPerformanceDtos);
  }

  async update(id: number, updatePerformanceDto: UpdatePerformanceDto) {
    await this.verifyPerformanceById(id);
    await this.performanceRepository.update({ id }, updatePerformanceDto);
  }

  async delete(id: number) {
    await this.verifyPerformanceById(id);
    await this.performanceRepository.delete({ id });
  }

  private async verifyPerformanceById(id: number) {
    const performance = await this.performanceRepository.find({ where: { id }, relations: { seat: true } });
    const allSeatsCount = performance[0].seat.length;
    const availableSeatsCount = performance[0].seat.filter((seat) => seat.state === 'for_sale').length;
    
    if (_.isNil(performance)) {
      throw new NotFoundException('존재하지 않는 공연입니다.');
    }

    return { performance, allSeatsCount, availableSeatsCount };
  }
}