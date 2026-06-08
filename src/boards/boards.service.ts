import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { nanoid } from 'nanoid';
import { Board } from '../database/models/board.model';
import { BoardColumn } from '../database/models/column.model';
import { Card } from '../database/models/card.model';
import { Vote } from '../database/models/vote.model';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { serializeCard } from '../common/serializers';
import { BoardGateway } from '../gateway/board.gateway';
import { JwtPayloadUser } from '../auth/decorators/current-user.decorator';

const DEFAULT_COLUMNS = [
  { title: 'Went Well', color: '#10b981', order: 0 },
  { title: 'To Improve', color: '#f43f5e', order: 1 },
  { title: 'Action Items', color: '#8b5cf6', order: 2 },
];

@Injectable()
export class BoardsService {
  constructor(
    @InjectModel(Board) private readonly boardModel: typeof Board,
    @InjectModel(BoardColumn) private readonly columnModel: typeof BoardColumn,
    @InjectModel(Card) private readonly cardModel: typeof Card,
    private readonly gateway: BoardGateway,
  ) {}

  async create(dto: CreateBoardDto, facilitatorId: string) {
    const board = await this.boardModel.create({
      title: dto.title,
      sprintNumber: dto.sprintNumber,
      votesPerUser: dto.votesPerUser ?? 5,
      facilitatorId,
      inviteCode: nanoid(6),
    } as any);

    await this.columnModel.bulkCreate(
      DEFAULT_COLUMNS.map((c) => ({ ...c, boardId: board.id })) as any,
    );

    return this.findOne(board.id, {
      id: facilitatorId,
      role: 'facilitator',
    } as JwtPayloadUser);
  }

  async listForFacilitator(facilitatorId: string) {
    const boards = await this.boardModel.findAll({
      where: { facilitatorId },
      order: [['createdAt', 'DESC']],
    });
    return boards;
  }

  private async loadBoardOrThrow(id: string): Promise<Board> {
    const board = await this.boardModel.findByPk(id);
    if (!board) throw new NotFoundException('Board not found');
    return board;
  }

  async findOne(id: string, viewer: JwtPayloadUser) {
    const board = await this.loadBoardOrThrow(id);
    const isFacilitator =
      viewer.role === 'facilitator' && board.facilitatorId === viewer.id;

    const columns = await this.columnModel.findAll({
      where: { boardId: id },
      order: [['order', 'ASC']],
    });

    const cards = await this.cardModel.findAll({
      where: { boardId: id },
      include: [Vote],
      order: [['createdAt', 'ASC']],
    });

    return {
      board: this.serializeBoard(board),
      columns,
      cards: cards.map((c) =>
        serializeCard(c, viewer.id, board, { includeAuthor: isFacilitator }),
      ),
    };
  }

  async getByInviteCode(code: string) {
    const board = await this.boardModel.findOne({
      where: { inviteCode: code },
    });
    if (!board) throw new NotFoundException('Invalid invite code');
    return this.serializeBoard(board);
  }

  async update(id: string, dto: UpdateBoardDto, viewer: JwtPayloadUser) {
    const board = await this.loadBoardOrThrow(id);
    this.assertOwner(board, viewer);

    await board.update({ ...dto });
    const serialized = this.serializeBoard(board);
    this.gateway.emitBoardUpdated(id, serialized);
    return serialized;
  }

  async remove(id: string, viewer: JwtPayloadUser) {
    const board = await this.loadBoardOrThrow(id);
    this.assertOwner(board, viewer);
    await board.destroy();
    return { success: true };
  }

  private assertOwner(board: Board, viewer: JwtPayloadUser) {
    if (board.facilitatorId !== viewer.id) {
      throw new ForbiddenException('You do not own this board');
    }
  }

  serializeBoard(board: Board) {
    return {
      id: board.id,
      title: board.title,
      sprintNumber: board.sprintNumber,
      isVotingOpen: board.isVotingOpen,
      isCardsHidden: board.isCardsHidden,
      votesPerUser: board.votesPerUser,
      facilitatorId: board.facilitatorId,
      inviteCode: board.inviteCode,
      createdAt: board.createdAt,
    };
  }
}
