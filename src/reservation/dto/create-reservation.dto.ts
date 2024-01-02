import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';

export class CreateReservationsDto {
    @IsNumber()
    @IsNotEmpty({ message: '좌석을 지정해주세요.' })
    seat_id: number;

    @IsString()
    @IsNotEmpty({ message: '예약자명을 입력해주세요.' })
    reservation_name: string;

    @IsNumber()
    @IsNotEmpty({ message: '결제금액을 입력해주세요.' })
    payment_amount: number;
}