import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePerformanceDto {
  @IsString()
  @IsNotEmpty({ message: '공연 이름을 입력해주세요.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '공연에 대한 소개를 입력해주세요.' })
  description: string;
}