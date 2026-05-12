import { ObjectId } from "mongodb";
import { Entity, ObjectIdColumn, Column, Index, CreateDateColumn } from "typeorm";

@Index("idx_audit_user_timestamp", ["userId", "timestamp"])
@Index("idx_audit_entity", ["entity", "entityId"])
@Entity({ name: "audit_logs" })
export class AuditLog {
  @ObjectIdColumn()
  _id!: ObjectId;

  /** e.g. CREATE / UPDATE / DELETE / LOGIN / LOGOUT */
  @Index()
  @Column()
  action!: string;

  /** e.g. business | account | transaction | user */
  @Index()
  @Column()
  entity!: string;

  @Index()
  @Column()
  entityId!: ObjectId;

  @Index()
  @Column()
  userId!: ObjectId;

  @CreateDateColumn({ name: "timestamp" })
  timestamp!: Date;
}
