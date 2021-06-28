import { Module } from "@nestjs/common";
import { ScheduleModule } from '@nestjs/schedule';
import { QueueService } from "./queue.gateway";
import { GameDatabaseController } from "../database/game_database.controller";
import { GameDatabaseService } from "../database/game_database.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Games } from '../entities/games.entity';
import { config } from '../orm.config';

@Module({
    imports: [ScheduleModule.forRoot(),
        TypeOrmModule.forRoot(config),
        TypeOrmModule.forFeature([Games])],
    controllers: [GameDatabaseController],
    providers: [QueueService, GameDatabaseService]
})
export class QueueModule {}