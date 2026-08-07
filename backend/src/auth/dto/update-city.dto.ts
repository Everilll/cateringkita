import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCityDto {
  @IsString()
  @IsNotEmpty()
  city: string;
}
