import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { Vote } from '../database/models/vote.model';
import { Card } from '../database/models/card.model';
import { Board } from '../database/models/board.model';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [SequelizeModule.forFeature([Vote, Card, Board]), GatewayModule],
  controllers: [VotesController],
  providers: [VotesService],
})
export class VotesModule {}
