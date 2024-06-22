import { IsOptional } from 'class-validator';

export class SamlAuthDto {
  @IsOptional()
  readonly RelayState?: string;
}
