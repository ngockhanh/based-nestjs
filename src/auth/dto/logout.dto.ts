import { IsOptional } from 'class-validator';

export class LogoutDto {
  @IsOptional()
  readonly refreshToken?: string;
}
