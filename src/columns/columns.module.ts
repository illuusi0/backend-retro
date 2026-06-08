import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { BoardColumn } from '../database/models/column.model';
import { Board } from '../database/models/board.model';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [SequelizeModule.forFeature([BoardColumn, Board]), GatewayModule],
  controllers: [ColumnsController],
  providers: [ColumnsService],
})
export class ColumnsModule {}
