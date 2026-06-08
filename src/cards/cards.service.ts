import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Card } from '../database/models/card.model';
import { Board } from '../database/models/board.model';
import { BoardColumn } from '../database/models/column.model';
import { Vote } from '../database/models/vote.model';
import { CreateCardDto, UpdateCardDto } from './dto/card.dto';
import { serializeCard } from '../common/serializers';
import { BoardGateway } from '../gateway/board.gateway';
import { JwtPayloadUser } from '../auth/decorators/current-user.decorator';

@Injectable()
export class CardsService {
  constructor(
    @InjectModel(Card) private readonly cardModel: typeof Card,
    @InjectModel(Board) private readonly boardModel: typeof Board,
    @InjectModel(BoardColumn) private readonly columnModel: typeof BoardColumn,
    private readonly gateway: BoardGateway,
  ) {}

  private async loadCard(id: string): Promise<Card> {
    const card = await this.cardModel.findByPk(id, { include: [Vote] });
    if (!card) throw new NotFoundException('Card not found');
    return card;
  }

  /** Broadcast a neutral serialization (no author, hidden text respected). */
  private broadcast(
    event: 'created' | 'updated',
    board: Board,
    card: Card,
  ) {
    const neutral = serializeCard(card, '__nobody__', board, {
      includeAuthor: false,
    });
    if (event === 'created') this.gateway.emitCardCreated(board.id, neutral);
    else this.gateway.emitCardUpdated(board.id, neutral);
  }

  async create(boardId: string, dto: CreateCardDto, user: JwtPayloadUser) {
    const board = await this.boardModel.findByPk(boardId);
    if (!board) throw new NotFoundException('Board not found');

    const column = await this.columnModel.findOne({
      where: { id: dto.columnId, boardId },
    });
    if (!column) throw new BadRequestException('Column does not belong to board');

    const card = await this.cardModel.create({
      boardId,
      columnId: dto.columnId,
      text: dto.text,
      authorId: user.id,
    } as any);

    card.votes = [];
    this.broadcast('created', board, card);
    return serializeCard(card, user.id, board, { votesCount: 0 });
  }

  async update(id: string, dto: UpdateCardDto, user: JwtPayloadUser) {
    const card = await this.loadCard(id);
    if (card.authorId !== user.id) {
      throw new ForbiddenException('You can only edit your own cards');
    }
    if (dto.columnId) {
      const column = await this.columnModel.findOne({
        where: { id: dto.columnId, boardId: card.boardId },
      });
      if (!column) throw new BadRequestException('Invalid column');
    }
    await card.update({ ...dto });
    const board = await this.boardModel.findByPk(card.boardId);
    this.broadcast('updated', board!, card);
    return serializeCard(card, user.id, board!);
  }

  async reveal(id: string, user: JwtPayloadUser) {
    const card = await this.loadCard(id);
    if (card.authorId !== user.id) {
      throw new ForbiddenException('You can only reveal your own cards');
    }
    await card.update({ isRevealed: true, revealedName: user.username });
    const board = await this.boardModel.findByPk(card.boardId);
    this.broadcast('updated', board!, card);
    return serializeCard(card, user.id, board!);
  }

  async remove(id: string, user: JwtPayloadUser) {
    const card = await this.loadCard(id);
    const board = await this.boardModel.findByPk(card.boardId);
    const isOwner = card.authorId === user.id;
    const isFacilitator =
      user.role === 'facilitator' && board?.facilitatorId === user.id;
    if (!isOwner && !isFacilitator) {
      throw new ForbiddenException('Not allowed to delete this card');
    }
    const boardId = card.boardId;
    await card.destroy();
    this.gateway.emitCardDeleted(boardId, id);
    return { success: true };
  }
}
