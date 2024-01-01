import { IsNotEmpty, IsString, IsNumber, IsEnum } from 'class-validator';
import { Grade } from '../types/seat.grade.type'
export class UpdateSeatDto {
  @IsEnum(Grade)
  @IsNotEmpty({ message: '좌석 등급을 입력해주세요.' })
  grade: Grade;

  @IsNumber()
  @IsNotEmpty({ message: '좌석 번호를 입력해주세요.' })
  number: number;

  @IsNumber()
  @IsNotEmpty({ message: '좌석 가격을 입력해주세요.' })
  price: number;
}