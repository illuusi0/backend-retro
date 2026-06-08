import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Vote } from '../database/models/vote.model';
import { Card } from '../database/models/card.model';
import { Board } from '../database/models/board.model';
import { BoardGateway } from '../gateway/board.gateway';
import { JwtPayloadUser } from '../auth/decorators/current-user.decorator';

@Injectable()
export class VotesService {
  constructor(
    @InjectModel(Vote) private readonly voteModel: typeof Vote,
    @InjectModel(Card) private readonly cardModel: typeof Card,
    @InjectModel(Board) private readonly boardModel: typeof Board,
    private readonly gateway: BoardGateway,
  ) {}

  private async countVotes(cardId: string) {
    return this.voteModel.count({ where: { cardId } });
  }

  async vote(cardId: string, user: JwtPayloadUser) {
    const card = await this.cardModel.findByPk(cardId);
    if (!card) throw new NotFoundException('Card not found');

    const board = await this.boardModel.findByPk(card.boardId);
    if (!board) throw new NotFoundException('Board not found');

    if (!board.isVotingOpen) {
      throw new ForbiddenException('Voting is closed');
    }
    if (card.authorId === user.id) {
      throw new ForbiddenException('You cannot vote for your own card');
    }

    const existing = await this.voteModel.findOne({
      where: { cardId, userId: user.id },
    });
    if (existing) {
      throw new BadRequestException('You already voted for this card');
    }

    const used = await this.voteModel.count({
      where: { boardId: board.id, userId: user.id },
    });
    if (used >= board.votesPerUser) {
      throw new ForbiddenException('No votes left');
    }

    await this.voteModel.create({
      cardId,
      userId: user.id,
      boardId: board.id,
    } as any);

    const votesCount = await this.countVotes(cardId);
    this.gateway.emitVoteChanged(board.id, cardId, votesCount);

    return { votesCount, votesLeft: board.votesPerUser - (used + 1) };
  }

  async unvote(cardId: string, user: JwtPayloadUser) {
    const card = await this.cardModel.findByPk(cardId);
    if (!card) throw new NotFoundException('Card not found');

    const vote = await this.voteModel.findOne({
      where: { cardId, userId: user.id },
    });
    if (!vote) {
      throw new BadRequestException('You have not voted for this card');
    }
    const board = await this.boardModel.findByPk(card.boardId);
    await vote.destroy();

    const votesCount = await this.countVotes(cardId);
    this.gateway.emitVoteChanged(card.boardId, cardId, votesCount);

    const used = await this.voteModel.count({
      where: { boardId: card.boardId, userId: user.id },
    });
    return {
      votesCount,
      votesLeft: (board?.votesPerUser ?? 0) - used,
    };
  }

  async myVotes(boardId: string, user: JwtPayloadUser) {
    const board = await this.boardModel.findByPk(boardId);
    if (!board) throw new NotFoundException('Board not found');

    const used = await this.voteModel.count({
      where: { boardId, userId: user.id },
    });
    const myVotes = await this.voteModel.findAll({
      where: { boardId, userId: user.id },
      attributes: ['cardId'],
    });

    return {
      total: board.votesPerUser,
      used,
      left: board.votesPerUser - used,
      votedCardIds: myVotes.map((v) => v.cardId),
    };
  }
}
