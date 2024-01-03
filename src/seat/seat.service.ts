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
import { Grade } from './types/seat.grade.type';

@Injectable()
export class SeatService {
  constructor(
    @InjectRepository(Seat)
    private readonly seatRepository: Repository<Seat>,
  ) {}

  async findOne(id: number) {
    return await this.verifySeatById(id);
  }

  async createByOne(performance_id: number, number: number, grade: Grade, price: number) {
    console.log(performance_id, number, grade, price)
    const seat = await this.seatRepository.findOne({
      where: { performance_id, number, grade },
    });

    if (seat) {
      throw new BadRequestException('이미 존재하는 좌석입니다.');
    }

    await this.seatRepository.save({ performance_id, number, grade, price });
    return { performance_id, number, grade, price }; // 생성된 좌석 정보를 반환합니다.
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
      if (_.isNil(seatData.performance_id) || _.isNil(seatData.number) || _.isNil(seatData.grade) || _.isNil(seatData.price)) {
        throw new BadRequestException(
          'CSV 파일이 양식에 적합하지 않습니다.',
        );
      }
      const seat = await this.seatRepository.findOne({
        where: { performance_id: seatData.performance_id, number: seatData.number, grade: seatData.grade },
      });
      if (seat) {
        throw new BadRequestException('이미 존재하는 좌석입니다.');
      }
    }

    const createSeatDtos = seatsData.map((seatData) => ({
      performance_id: seatData.performance_id,
      number: seatData.number,
      grade: seatData.grade,
      price: seatData.price,
    }));

    await this.seatRepository.save(createSeatDtos);
  }

  async update(id: number, updateSeatDto: UpdateSeatDto) {
    const seat = await this.verifySeatById(id);
    if(!seat.length) {
      throw new NotFoundException('존재하지 않는 좌석입니다.');
    }
    await this.seatRepository.update({ id, performance_id: seat[0].performance_id }, updateSeatDto);
  }

  async delete(id: number) {
    const seat = await this.verifySeatById(id);
    if(!seat.length) {
      throw new NotFoundException('존재하지 않는 좌석입니다.');
    }
    await this.seatRepository.delete({ id, performance_id: seat[0].performance_id });
  }

  private async verifySeatById(id: number) {
    const seat = await this.seatRepository.find({ 
      where: { id },
      relations: ['performance'],
     });
    if (_.isNil(seat)) {
      throw new NotFoundException('존재하지 않는 좌석입니다.');
    }
    return seat;
  }
}