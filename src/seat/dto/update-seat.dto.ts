import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpdateSeatDto {
  @IsString()
  @IsNotEmpty({ message: '좌석 이름을 입력해주세요.' })
  name: string;

  @IsNumber()
  @IsNotEmpty({ message: '좌석 가격을 입력해주세요.' })
  price: number;
}