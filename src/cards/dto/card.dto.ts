import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateCardDto {
  @ApiProperty({ example: 'Great pair-programming sessions' })
  @IsString()
  @MinLength(1)
  text: string;

  @ApiProperty({ example: 'uuid-of-column' })
  @IsUUID()
  columnId: string;
}

export class UpdateCardDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  text?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  columnId?: string;
}
