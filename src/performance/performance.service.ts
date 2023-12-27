import _ from 'lodash';
import { parse } from 'papaparse';
import { Repository } from 'typeorm';

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
    return await this.performanceRepository.find({
      select: ['id', 'name'],
    });
  }

  async findOne(id: number) {
    return await this.verifyPerformanceById(id);
  }

  async createByOne(name: string, description: string) {
    const performance = await this.performanceRepository.findOne({
      where: { name },
    });

    if (performance) {
      throw new BadRequestException('이미 존재하는 팀입니다.');
    }

    await this.performanceRepository.save({ name, description });
    return { name, description }; // 생성된 팀 정보를 반환합니다. 추후 수정 예정입니다.
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
      if (_.isNil(performanceData.name) || _.isNil(performanceData.description)) {
        throw new BadRequestException(
          'CSV 파일은 name과 description 컬럼을 포함해야 합니다.',
        );
      }
    }

    const createPerformanceDtos = performancesData.map((performanceData) => ({
      name: performanceData.name,
      description: performanceData.description,
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
    const team = await this.performanceRepository.findOneBy({ id });
    if (_.isNil(team)) {
      throw new NotFoundException('존재하지 않는 팀입니다.');
    }

    return team;
  }
}