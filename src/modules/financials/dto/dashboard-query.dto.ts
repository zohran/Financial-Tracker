import { IsDateString, IsEnum, IsMongoId, IsOptional } from "class-validator";
import { DateRangePreset } from "@/common/enums/date-range.enum";

export class DashboardQueryDto {
  @IsMongoId()
  businessId!: string;

  @IsOptional()
  @IsEnum(DateRangePreset)
  range?: DateRangePreset;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
