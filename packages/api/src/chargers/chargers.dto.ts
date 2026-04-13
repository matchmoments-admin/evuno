import { IsString, IsNumber, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateChargerDto {
  @IsString()
  ocppId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  locationLat?: number;

  @IsOptional()
  @IsNumber()
  locationLng?: number;

  @IsOptional()
  @IsString()
  locationAddress?: string;

  @IsOptional()
  @IsString()
  locationCity?: string;

  @IsOptional()
  @IsString()
  locationCountry?: string;

  @IsIn(['L2', 'DC'])
  level: string;

  @IsNumber()
  powerKw: number;

  @IsOptional()
  @IsIn(['CCS2', 'CHAdeMO', 'Type2'])
  connectorType?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  pricePerKwh?: string;

  @IsOptional()
  @IsString()
  priceCurrency?: string;
}

export class UpdateChargerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  locationLat?: number;

  @IsOptional()
  @IsNumber()
  locationLng?: number;

  @IsOptional()
  @IsString()
  locationAddress?: string;

  @IsOptional()
  @IsString()
  locationCity?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  pricePerKwh?: string;

  @IsOptional()
  @IsString()
  priceCurrency?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
