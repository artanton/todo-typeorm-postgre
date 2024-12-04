import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  text: string;

  @IsString()
  @IsOptional()
  date: string;

  @IsNumber()
  @IsOptional()
  sublevel: number;

  @IsNumber()
  @IsOptional()
  parentId: number;
}
