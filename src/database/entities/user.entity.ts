import { ObjectId } from "mongodb";
import {
  Entity,
  ObjectIdColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Index("idx_users_createdAt", ["createdAt"])
@Entity({ name: "users" })
export class User {
  @ObjectIdColumn()
  _id!: ObjectId;

  @Index({ unique: true })
  @Column()
  email!: string;

  @Column()
  password!: string;

  /** Hashed refresh token (bcrypt). `null` when the user is logged out. */
  @Column({ type: "string", nullable: true })
  refreshTokenHash!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
