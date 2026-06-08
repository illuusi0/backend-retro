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
} from 'sequelize-typescript';
import { Card } from './card.model';
import { User } from './user.model';
import { Board } from './board.model';

@Table({
  tableName: 'votes',
  timestamps: true,
  indexes: [{ unique: true, fields: ['cardId', 'userId'] }],
})
export class Vote extends Model<Vote> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Card)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare cardId: string;

  @BelongsTo(() => Card, 'cardId')
  declare card: Card;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare userId: string;

  @BelongsTo(() => User, 'userId')
  declare user: User;

  @ForeignKey(() => Board)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare boardId: string;

  @BelongsTo(() => Board, 'boardId')
  declare board: Board;
}
