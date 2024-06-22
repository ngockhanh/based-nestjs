import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @MinLength(2)
  readonly name: string;

  @IsOptional()
  readonly description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  readonly level?: number;
}
