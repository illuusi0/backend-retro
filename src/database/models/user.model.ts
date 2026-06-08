import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  Unique,
  HasMany,
} from 'sequelize-typescript';
import { Board } from './board.model';
import { Card } from './card.model';
import { Vote } from './vote.model';

export type UserRole = 'facilitator' | 'member' | 'guest';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model<User> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(true)
  @Unique
  @Column(DataType.STRING)
  declare email: string | null;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare username: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare passwordHash: string | null;

  @AllowNull(false)
  @Default('member')
  @Column(DataType.ENUM('facilitator', 'member', 'guest'))
  declare role: UserRole;

  @AllowNull(true)
  @Unique
  @Column(DataType.STRING)
  declare guestToken: string | null;

  @HasMany(() => Board, 'facilitatorId')
  declare boards: Board[];

  @HasMany(() => Card, 'authorId')
  declare cards: Card[];

  @HasMany(() => Vote, 'userId')
  declare votes: Vote[];
}
