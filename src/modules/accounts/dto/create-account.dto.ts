import { IsEnum, IsMongoId, IsString, MaxLength, MinLength } from "class-validator";
import { AccountType } from "@/common/enums/account-type.enum";

export class CreateAccountDto {
  @IsMongoId()
  businessId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @IsEnum(AccountType)
  type!: AccountType;
}
