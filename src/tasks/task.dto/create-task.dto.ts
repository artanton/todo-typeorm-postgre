import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  text: string;

  @IsString()
  date: string;

  @IsNumber()
  subLevel: number;

  @IsNumber()
  parentId: number;
}
