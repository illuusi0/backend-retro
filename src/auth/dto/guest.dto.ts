import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class GuestDto {
  @ApiProperty({ example: 'Введите имя или никнейм' })
  @IsString()
  @MinLength(1)
  username: string;
}
