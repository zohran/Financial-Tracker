import { ObjectId } from "mongodb";
import { Entity, ObjectIdColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { TransactionType } from "@/common/enums/transaction-type.enum";

@Index("idx_tx_user_business_occurredAt", ["userId", "businessId", "occurredAt"])
@Index("idx_tx_business_account_occurredAt", ["businessId", "accountId", "occurredAt"])
@Index("idx_tx_business_createdAt", ["businessId", "createdAt"])
@Entity({ name: "transactions" })
export class Transaction {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Index()
  @Column()
  userId!: ObjectId;

  @Index()
  @Column()
  businessId!: ObjectId;

  @Index()
  @Column()
  accountId!: ObjectId;

  @Column({ type: "enum", enum: TransactionType })
  type!: TransactionType;

  /** Amount is always stored as a positive number; `type` provides the sign. */
  @Column({ type: "number" })
  amount!: number;

  @Column({ type: "string", nullable: true })
  description!: string | null;

  @Column({ type: "string", nullable: true })
  category!: string | null;

  @Index()
  @Column()
  occurredAt!: Date;

  @Column({ default: false })
  isDeleted!: boolean;

  @Index()
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
