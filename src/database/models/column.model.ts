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
import { Card } from './card.model';

@Table({ tableName: 'columns', timestamps: true })
export class BoardColumn extends Model<BoardColumn> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Board)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare boardId: string;

  @BelongsTo(() => Board, 'boardId')
  declare board: Board;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare title: string;

  @AllowNull(false)
  @Default('#10b981')
  @Column(DataType.STRING)
  declare color: string;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  declare order: number;

  @HasMany(() => Card, 'columnId')
  declare cards: Card[];
}
