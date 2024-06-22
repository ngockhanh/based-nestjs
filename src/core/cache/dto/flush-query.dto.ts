import { IsOptional } from 'class-validator';

export class FlushQueryDto {
  @IsOptional()
  readonly pattern?: string;
}
