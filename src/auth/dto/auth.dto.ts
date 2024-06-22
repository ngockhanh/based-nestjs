import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class AuthDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  readonly name: string;

  @IsOptional()
  readonly password?: string;

  @IsOptional()
  readonly avatar?: string;
}
