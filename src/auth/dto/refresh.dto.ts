import { IsNotEmpty } from 'class-validator';

export class RefreshDto {
  @IsNotEmpty()
  readonly token: string;
}
