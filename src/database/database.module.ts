import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './models/user.model';
import { Board } from './models/board.model';
import { BoardColumn } from './models/column.model';
import { Card } from './models/card.model';
import { Vote } from './models/vote.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('DATABASE_URL');
        return {
          dialect: 'postgres',
          ...(url
            ? { uri: url }
            : {
                host: config.get('DB_HOST', 'localhost'),
                port: Number(config.get('DB_PORT', 5432)),
                username: config.get('DB_USER', 'postgres'),
                password: config.get('DB_PASSWORD', 'postgres'),
                database: config.get('DB_NAME', 'retro_db'),
              }),
          models: [User, Board, BoardColumn, Card, Vote],
          autoLoadModels: true,
          synchronize: false,
          logging: false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
