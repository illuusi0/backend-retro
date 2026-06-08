import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({ example: 'Sprint 102' })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({ example: 102 })
  @IsInt()
  @Min(0)
  sprintNumber: number;

  @ApiProperty({ example: 5, required: false, default: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  votesPerUser?: number;
}
