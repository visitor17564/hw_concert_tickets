import _ from 'lodash';
import { parse } from 'papaparse';
import { Repository, Like } from 'typeorm';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UpdateSeatDto } from './dto/update-seat.dto';
import { Seat } from './entities/seat.entity';

@Injectable()
export class SeatService {
  constructor(
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
  ) {}

  async findAll(): Promise<Seat[]> {
    return await this.seatRepository.find({
      select: ['id', 'name', 'price'],
    });
  }

  async findOne(id: number) {
    return await this.verifyPerformanceById(id);
  }

  // name을 포함한 값을 검색하는 type-orm 쿼리문
  async findBySearch(name: string) {
    const seat = await this.seatRepository.findBy({ 
      name: Like(`%${name}%`), 
     });
    if (_.isNil(seat)) {
      throw new NotFoundException('검색 결과가 없습니다.');
    }
    return seat;
  }

  async createByOne(performance_id: number, name: string, price: number) {
    const seat = await this.seatRepository.findOne({
      where: { performance_id, name },
    });

    if (seat) {
      throw new BadRequestException('이미 존재하는 좌석입니다.');
    }

    await this.seatRepository.save({ performance_id, name, price });
    return { performance_id, name, price }; // 생성된 좌석 정보를 반환합니다.
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

    const seatsData = parseResult.data as any[];

    for (const seatData of seatsData) {
      if (_.isNil(seatData.name) || _.isNil(seatData.price)) {
        throw new BadRequestException(
          'CSV 파일이 양식에 적합하지 않습니다.',
        );
      }
    }

    const createSeatDtos = seatsData.map((seatData) => ({
      performance_id: seatData.performance_id,
      name: seatData.name,
      price: seatData.price,
    }));

    await this.seatRepository.save(createSeatDtos);
  }

  async update(performance_id: number, id: number, updateSeatDto: UpdateSeatDto) {
    await this.verifyPerformanceById(id);
    await this.seatRepository.update({ id, performance_id }, updateSeatDto);
  }

  async delete(performance_id: number, id: number) {
    await this.verifyPerformanceById(id);
    await this.seatRepository.delete({ id, performance_id });
  }

  private async verifyPerformanceById(id: number) {
    const seat = await this.seatRepository.findOneBy({ id });
    if (_.isNil(seat)) {
      throw new NotFoundException('존재하지 않는 좌석입니다.');
    }

    return seat;
  }
}