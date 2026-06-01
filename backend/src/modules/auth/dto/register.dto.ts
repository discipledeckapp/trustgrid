import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InstitutionType } from '@prisma/client';

export class RegisterInstitutionDto {
  @ApiProperty({ example: 'Redemption City Estate' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: InstitutionType })
  @IsEnum(InstitutionType)
  type: InstitutionType;

  @ApiProperty({ example: 'admin@redemptioncity.ng' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'NG' })
  @IsOptional()
  @IsString()
  country?: string;
}

export class RegisterAdminDto {
  @ApiProperty({ example: 'Emeka' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Okafor' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '+2348001234567' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'phone must be a valid international number' })
  phone: string;

  @ApiPropertyOptional({ example: 'admin@redemptioncity.ng' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'SecurePass123!' })
  @IsString()
  @MinLength(8)
  password: string;
}

export class RegisterDto {
  @ApiProperty()
  institution: RegisterInstitutionDto;

  @ApiProperty()
  admin: RegisterAdminDto;
}
