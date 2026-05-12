import { ObjectId } from "mongodb";
import {
  Entity,
  ObjectIdColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "businesses" })
export class Business {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Index()
  @Column()
  userId!: ObjectId;

  @Column()
  name!: string;

  @Column({ type: "string", nullable: true })
  description!: string | null;

  /** Active business flag (multi-business switching). */
  @Index()
  @Column({ default: true })
  isActive!: boolean;

  @Index()
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
