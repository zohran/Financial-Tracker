import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from "class-validator";
import { TransactionType } from "@/common/enums/transaction-type.enum";

export class CreateTransactionDto {
  @IsMongoId()
  businessId!: string;

  @IsMongoId()
  accountId!: string;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive({ message: "Amount must be positive; use `type` to indicate direction" })
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  /** ISO date string. Defaults to `now` if omitted. */
  @IsOptional()
  @IsDateString()
  occurredAt?: string;
}
