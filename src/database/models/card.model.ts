import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  AllowNull,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Board } from './board.model';
import { BoardColumn } from './column.model';
import { User } from './user.model';
import { Vote } from './vote.model';

@Table({ tableName: 'cards', timestamps: true })
export class Card extends Model<Card> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => BoardColumn)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare columnId: string;

  @BelongsTo(() => BoardColumn, 'columnId')
  declare column: BoardColumn;

  @ForeignKey(() => Board)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare boardId: string;

  @BelongsTo(() => Board, 'boardId')
  declare board: Board;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare text: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare authorId: string;

  @BelongsTo(() => User, 'authorId')
  declare author: User;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare isRevealed: boolean;

  @AllowNull(true)
  @Column(DataType.STRING)
  declare revealedName: string | null;

  @HasMany(() => Vote, 'cardId')
  declare votes: Vote[];
}
