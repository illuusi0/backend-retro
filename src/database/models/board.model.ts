import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  Unique,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from './user.model';
import { BoardColumn } from './column.model';
import { Card } from './card.model';

@Table({ tableName: 'boards', timestamps: true })
export class Board extends Model<Board> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare title: string;

  @AllowNull(false)
  @Default(1)
  @Column(DataType.INTEGER)
  declare sprintNumber: number;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare isVotingOpen: boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare isCardsHidden: boolean;

  @AllowNull(false)
  @Default(5)
  @Column(DataType.INTEGER)
  declare votesPerUser: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare facilitatorId: string;

  @BelongsTo(() => User, 'facilitatorId')
  declare facilitator: User;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  declare inviteCode: string;

  @HasMany(() => BoardColumn, 'boardId')
  declare columns: BoardColumn[];

  @HasMany(() => Card, 'boardId')
  declare cards: Card[];
}
