import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { Card } from '../database/models/card.model';
import { Board } from '../database/models/board.model';
import { BoardColumn } from '../database/models/column.model';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Card, Board, BoardColumn]),
    GatewayModule,
  ],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
