import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { Board } from '../database/models/board.model';
import { BoardColumn } from '../database/models/column.model';
import { Card } from '../database/models/card.model';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Board, BoardColumn, Card]),
    GatewayModule,
  ],
  controllers: [BoardsController],
  providers: [BoardsService],
  exports: [BoardsService],
})
export class BoardsModule {}
