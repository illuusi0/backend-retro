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
import { ColumnsService } from './columns.service';
import { CreateColumnDto, UpdateColumnDto } from './dto/column.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  JwtPayloadUser,
} from '../auth/decorators/current-user.decorator';

@ApiTags('columns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('boards/:boardId/columns')
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  create(
    @Param('boardId') boardId: string,
    @Body() dto: CreateColumnDto,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.columnsService.create(boardId, dto, user);
  }

  @Patch(':id')
  update(
    @Param('boardId') boardId: string,
    @Param('id') id: string,
    @Body() dto: UpdateColumnDto,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.columnsService.update(boardId, id, dto, user);
  }

  @Delete(':id')
  remove(
    @Param('boardId') boardId: string,
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadUser,
  ) {
    return this.columnsService.remove(boardId, id, user);
  }
}
