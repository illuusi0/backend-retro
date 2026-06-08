import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateColumnDto {
  @ApiProperty({ example: 'Kudos' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiPropertyOptional({ example: '#f59e0b' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  order?: number;
}

export class UpdateColumnDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  order?: number;
}
