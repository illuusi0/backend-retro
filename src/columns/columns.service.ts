import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BoardColumn } from '../database/models/column.model';
import { Board } from '../database/models/board.model';
import { CreateColumnDto, UpdateColumnDto } from './dto/column.dto';
import { JwtPayloadUser } from '../auth/decorators/current-user.decorator';
import { BoardGateway } from '../gateway/board.gateway';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectModel(BoardColumn) private readonly columnModel: typeof BoardColumn,
    @InjectModel(Board) private readonly boardModel: typeof Board,
    private readonly gateway: BoardGateway,
  ) {}

  private serializeColumn(column: BoardColumn) {
    return {
      id: column.id,
      boardId: column.boardId,
      title: column.title,
      color: column.color,
      order: column.order,
    };
  }

  private async assertOwner(boardId: string, viewer: JwtPayloadUser) {
    const board = await this.boardModel.findByPk(boardId);
    if (!board) throw new NotFoundException('Board not found');
    if (board.facilitatorId !== viewer.id) {
      throw new ForbiddenException('Only the facilitator can manage columns');
    }
    return board;
  }

  async create(boardId: string, dto: CreateColumnDto, viewer: JwtPayloadUser) {
    await this.assertOwner(boardId, viewer);
    const count = await this.columnModel.count({ where: { boardId } });
    return this.columnModel.create({
      boardId,
      title: dto.title,
      color: dto.color ?? '#64748b',
      order: dto.order ?? count,
    } as any);
  }

  async update(
    boardId: string,
    id: string,
    dto: UpdateColumnDto,
    viewer: JwtPayloadUser,
  ) {
    await this.assertOwner(boardId, viewer);
    const column = await this.columnModel.findOne({ where: { id, boardId } });
    if (!column) throw new NotFoundException('Column not found');
    await column.update({ ...dto });
    const serialized = this.serializeColumn(column);
    this.gateway.emitColumnUpdated(boardId, serialized);
    return serialized;
  }

  async remove(boardId: string, id: string, viewer: JwtPayloadUser) {
    await this.assertOwner(boardId, viewer);
    const column = await this.columnModel.findOne({ where: { id, boardId } });
    if (!column) throw new NotFoundException('Column not found');
    await column.destroy();
    return { success: true };
  }
}
