import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'lead@team.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Scrum Master' })
  @IsString()
  @MinLength(2)
  username: string;

  @ApiProperty({ example: 'secret123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    required: false,
    description: 'Register as facilitator (default) or member',
    example: 'facilitator',
  })
  @IsOptional()
  @IsString()
  role?: 'facilitator' | 'member';
}
