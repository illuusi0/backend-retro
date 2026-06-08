import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CurrentUser,
  JwtPayloadUser,
} from '../auth/decorators/current-user.decorator';

@ApiTags('boards')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @UseGuards(RolesGuard)
  @Roles('facilitator')
  @Get()
  list(@CurrentUser() user: JwtPayloadUser) {
    return this.boardsService.listForFacilitator(user.id);
  }

  @UseGuards(RolesGuard)
  @Roles('facilitator')
  @Post()
  create(@Body() dto: CreateBoardDto, @CurrentUser() user: JwtPayloadUser) {
    return this.boardsService.create(dto, user.id);
  }

  @Get('join/:code')
  join(@Param('code') code: string) {
    return this.boardsService.getByInviteCode(code);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayloadUser) {
    return this.boardsService.findOne(id, user);
  }

  @UseGuards(RolesGuard)
  @Roles('facilitator')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBoardDto,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.boardsService.update(id, dto, user);
  }

  @UseGuards(RolesGuard)
  @Roles('facilitator')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayloadUser) {
    return this.boardsService.remove(id, user);
  }
}
