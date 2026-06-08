import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  JwtPayloadUser,
} from '../auth/decorators/current-user.decorator';

@ApiTags('votes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post('cards/:cardId/vote')
  vote(@Param('cardId') cardId: string, @CurrentUser() user: JwtPayloadUser) {
    return this.votesService.vote(cardId, user);
  }

  @Delete('cards/:cardId/vote')
  unvote(@Param('cardId') cardId: string, @CurrentUser() user: JwtPayloadUser) {
    return this.votesService.unvote(cardId, user);
  }

  @Get('boards/:boardId/my-votes')
  myVotes(
    @Param('boardId') boardId: string,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.votesService.myVotes(boardId, user);
  }
}
