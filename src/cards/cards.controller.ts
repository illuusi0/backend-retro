import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CardsService } from './cards.service';
import { CreateCardDto, UpdateCardDto } from './dto/card.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  JwtPayloadUser,
} from '../auth/decorators/current-user.decorator';

@ApiTags('cards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Post('boards/:boardId/cards')
  create(
    @Param('boardId') boardId: string,
    @Body() dto: CreateCardDto,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.cardsService.create(boardId, dto, user);
  }

  @Patch('cards/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCardDto,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.cardsService.update(id, dto, user);
  }

  @Patch('cards/:id/reveal')
  reveal(@Param('id') id: string, @CurrentUser() user: JwtPayloadUser) {
    return this.cardsService.reveal(id, user);
  }

  @Delete('cards/:id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayloadUser) {
    return this.cardsService.remove(id, user);
  }
}
