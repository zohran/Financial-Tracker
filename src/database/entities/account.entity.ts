import { ObjectId } from "mongodb";
import { Entity, ObjectIdColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { AccountType } from "@/common/enums/account-type.enum";

@Index("idx_accounts_user_business", ["userId", "businessId"])
@Index("idx_accounts_business", ["businessId"])
@Entity({ name: "accounts" })
export class Account {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Index()
  @Column()
  userId!: ObjectId;

  @Index()
  @Column()
  businessId!: ObjectId;

  @Column()
  name!: string;

  @Column({ type: "enum", enum: AccountType, default: AccountType.CUSTOM })
  type!: AccountType;

  /**
   * Soft-delete flag. Deleted accounts are hidden from dropdowns but still
   * participate in financial aggregates so historical balances stay accurate.
   */
  @Column({ default: false })
  isDeleted!: boolean;

  @Index()
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
